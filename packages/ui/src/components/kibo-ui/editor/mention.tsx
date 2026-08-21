"use client";

import { Mention } from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";

import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "@repo/ui/components/command";

/**
 * `@` mentions, sitting beside kibo's editor rather than inside it — their CLI
 * overwrites `index.tsx` on every update and this is ours.
 *
 * The extension knows nothing about people, companies or deals. It takes a
 * search function and renders whatever comes back, so the workspace data stays
 * in the app and this file stays a text editor concern.
 */
export type MentionItem = {
  id: string;
  /** Shown in the note. Stored on the node, so a rename does not rewrite old notes. */
  label: string;
  /** Free-form: the app owns the vocabulary, this only passes it through. */
  kind: string;
  /** Second line in the menu — the company someone works at, a deal's value. */
  hint?: string;
  /** Where the mention navigates to once written. */
  href: string;
};

const MENU_ID = "mention-command";

type MentionMenuProps = {
  items: MentionItem[];
  command: (item: MentionItem) => void;
};

const MentionMenu = ({ items, command }: MentionMenuProps) => (
  <Command
    id={MENU_ID}
    className="w-64 border shadow"
    // We already searched; cmdk filtering again would re-rank against its own
    // notion of a match and drop rows the caller deliberately returned.
    shouldFilter={false}
    onKeyDown={(event) => {
      event.stopPropagation();
    }}
  >
    <CommandEmpty className="p-3 text-sm text-muted-foreground">
      No matches
    </CommandEmpty>
    <CommandList>
      {items.map((item) => (
        <CommandItem
          key={item.id}
          value={item.id}
          onSelect={() => command(item)}
          className="flex items-center gap-2"
        >
          <span className="truncate">{item.label}</span>
          {item.hint ? (
            <span className="ml-auto shrink-0 truncate text-xs text-muted-foreground">
              {item.hint}
            </span>
          ) : null}
        </CommandItem>
      ))}
    </CommandList>
  </Command>
);

/**
 * The suggestion plugin owns the keymap while the menu is up, so arrows and
 * Enter never reach cmdk on their own — they are forwarded to it here. Same
 * trick kibo uses for the slash menu, kept local so the two cannot fight over
 * one element id.
 */
function forwardToMenu(event: KeyboardEvent): boolean {
  if (!["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) return false;

  const menu = document.querySelector(`#${MENU_ID}`);
  if (!menu) return false;

  menu.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: event.key,
      cancelable: true,
      bubbles: true,
    }),
  );
  return true;
}

export function createMentionExtension(
  search: (query: string) => MentionItem[],
) {
  return Mention.extend({
    // `kind` and `href` ride along on the node so the feed can render a
    // mention without looking anything up — a note has to still read correctly
    // after the deal it names is deleted.
    addAttributes() {
      return {
        ...this.parent?.(),
        kind: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-kind"),
          renderHTML: (attributes) =>
            attributes.kind ? { "data-kind": String(attributes.kind) } : {},
        },
        href: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-href"),
          renderHTML: (attributes) =>
            attributes.href ? { "data-href": String(attributes.href) } : {},
        },
      };
    },
  }).configure({
    HTMLAttributes: {
      class:
        "rounded-sm bg-muted px-1 py-0.5 font-medium text-foreground no-underline",
    },
    suggestion: {
      char: "@",
      items: ({ query }) => search(query),
      render: () => {
        let component: ReactRenderer<MentionMenuProps>;
        let popup: TippyInstance;

        return {
          onStart: (props) => {
            component = new ReactRenderer(MentionMenu, {
              props,
              editor: props.editor,
            });

            popup = tippy(document.body, {
              getReferenceClientRect: () =>
                props.clientRect?.() ?? new DOMRect(),
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: "manual",
              placement: "bottom-start",
            });
          },

          onUpdate: (props) => {
            component.updateProps(props);
            popup.setProps({
              getReferenceClientRect: () =>
                props.clientRect?.() ?? new DOMRect(),
            });
          },

          onKeyDown: (props) => {
            if (props.event.key === "Escape") {
              popup.hide();
              return true;
            }
            return forwardToMenu(props.event);
          },

          onExit: () => {
            popup.destroy();
            component.destroy();
          },
        };
      },
    },
  });
}
