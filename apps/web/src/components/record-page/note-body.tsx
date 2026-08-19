import type { NoteDoc, NoteNode } from "@repo/schema";

import { noteHeadingClass, safeNoteHref } from "#/text-maps";

/**
 * Renders a note's stored document. A walk over the JSON, not an editor —
 * a feed holds hundreds of notes and hundreds of ProseMirror instances would
 * cost far more than they are worth for text nobody is editing.
 *
 * Covers what the composer can produce, which is the contract: every block the
 * slash menu offers has a case here. Unknown types render their children rather
 * than disappearing, so switching on a new extension degrades to plain text
 * instead of silently dropping what someone wrote.
 *
 * Headings are deliberately compressed. A note lives in a card a few hundred
 * pixels wide, so document scale would outweigh the record's own title.
 */
export function NoteBody({ doc }: { doc: NoteDoc }) {
  return (
    <div className="flex flex-col gap-2 text-sm leading-6 text-pretty">
      <Nodes nodes={doc.content} />
    </div>
  );
}

function Nodes({ nodes }: { nodes: NoteNode[] | undefined }) {
  if (!nodes) return null;
  return nodes.map((node, i) => <Block key={i} node={node} />);
}

function Block({ node }: { node: NoteNode }) {
  switch (node.type) {
    case "paragraph":
      return (
        <p>
          <Inline nodes={node.content} />
        </p>
      );

    case "heading": {
      const level = Number(node.attrs?.level ?? 3);
      return (
        <p className={noteHeadingClass[level] ?? noteHeadingClass[3]}>
          <Inline nodes={node.content} />
        </p>
      );
    }

    // No flex on lists or items. `display: flex` replaces `display: list-item`,
    // which is what paints the marker — the list still indents, so it reads as
    // a list that lost its bullets. Spacing comes from margins instead.
    case "bulletList":
      return (
        <ul className="ml-4 list-outside list-disc space-y-1 marker:text-muted-foreground">
          <Nodes nodes={node.content} />
        </ul>
      );

    case "orderedList":
      return (
        <ol className="ml-4 list-outside list-decimal space-y-1 marker:text-muted-foreground">
          <Nodes nodes={node.content} />
        </ol>
      );

    case "listItem":
      return (
        <li className="space-y-1">
          <Nodes nodes={node.content} />
        </li>
      );

    case "taskList":
      return (
        <ul className="flex list-none flex-col gap-1">
          <Nodes nodes={node.content} />
        </ul>
      );

    case "taskItem": {
      const checked = node.attrs?.checked === true;
      return (
        <li className="flex items-start gap-2 [&>ul]:mt-1">
          {/* Disabled rather than a drawn box: it reports its state to a screen
              reader, and a note in the feed is a record of what was written,
              not a live checklist. */}
          <input
            type="checkbox"
            checked={checked}
            disabled
            className="mt-1.5 size-3.5 shrink-0 accent-muted-foreground"
          />
          <div
            className={`min-w-0 flex-1 ${checked ? "text-muted-foreground line-through" : ""}`}
          >
            <Nodes nodes={node.content} />
          </div>
        </li>
      );
    }

    case "blockquote":
      return (
        <blockquote className="border-l-2 border-border pl-3 text-muted-foreground">
          <Nodes nodes={node.content} />
        </blockquote>
      );

    case "codeBlock":
      return (
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
          <code>
            <Inline nodes={node.content} />
          </code>
        </pre>
      );

    case "table":
      // Its own scroller: a pasted table is the one thing in a note wide
      // enough to push the card past the column it sits in.
      return (
        <div className="-mx-1 overflow-x-auto px-1">
          <table className="w-full border-collapse text-left text-[0.8125rem]">
            <tbody>
              <Nodes nodes={node.content} />
            </tbody>
          </table>
        </div>
      );

    case "tableRow":
      return (
        <tr>
          <Nodes nodes={node.content} />
        </tr>
      );

    case "tableHeader":
      return (
        <th
          colSpan={spanAttr(node.attrs?.colspan)}
          rowSpan={spanAttr(node.attrs?.rowspan)}
          className="border border-border bg-muted/40 px-2 py-1 font-medium"
        >
          <Nodes nodes={node.content} />
        </th>
      );

    case "tableCell":
      return (
        <td
          colSpan={spanAttr(node.attrs?.colspan)}
          rowSpan={spanAttr(node.attrs?.rowspan)}
          className="border border-border px-2 py-1 align-top"
        >
          <Nodes nodes={node.content} />
        </td>
      );

    case "image": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : null;
      if (!src) return null;
      return (
        <img
          src={src}
          alt={typeof node.attrs?.alt === "string" ? node.attrs.alt : ""}
          className="max-w-full rounded-lg outline outline-black/10 dark:outline-white/10"
        />
      );
    }

    case "horizontalRule":
      return <hr className="border-border" />;

    case "text":
    case "hardBreak":
      return <Inline nodes={[node]} />;

    default:
      return <Nodes nodes={node.content} />;
  }
}

function spanAttr(value: unknown): number | undefined {
  return typeof value === "number" && value > 1 ? value : undefined;
}

function Inline({ nodes }: { nodes: NoteNode[] | undefined }) {
  if (!nodes) return null;

  return nodes.map((node, i) => {
    if (node.type === "hardBreak") return <br key={i} />;
    if (node.type !== "text") return <Block key={i} node={node} />;

    return (
      <Marked key={i} node={node}>
        {node.text}
      </Marked>
    );
  });
}

function Marked({
  node,
  children,
}: {
  node: NoteNode;
  children: React.ReactNode;
}) {
  let out = children;

  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case "bold":
        out = <strong className="font-medium">{out}</strong>;
        break;
      case "italic":
        out = <em>{out}</em>;
        break;
      case "strike":
        out = <s className="text-muted-foreground">{out}</s>;
        break;
      case "underline":
        out = <u>{out}</u>;
        break;
      case "subscript":
        out = <sub>{out}</sub>;
        break;
      case "superscript":
        out = <sup>{out}</sup>;
        break;
      case "code":
        out = (
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8125rem]">
            {out}
          </code>
        );
        break;
      case "link": {
        const href = safeNoteHref(mark.attrs?.href);
        // A link that fails the protocol check keeps its text and loses its
        // href — dropping the run entirely would silently eat what was typed.
        out = href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:decoration-foreground"
          >
            {out}
          </a>
        ) : (
          out
        );
        break;
      }
    }
  }

  return out;
}
