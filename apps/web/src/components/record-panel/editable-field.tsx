import * as React from "react";
import {
  GlobeAltIcon,
  LinkIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { cn } from "@repo/ui/lib/utils";

import { formatPhone, normalizePhone, phoneMessage } from "@repo/schema";

import { hasSocialIcon, SocialIcon } from "#/components/icons/social";
import {
  detectPlatform,
  formatMoney,
  normalizeSocialUrl,
  socialHandle,
} from "#/text-maps";

const RESTING =
  "w-full truncate rounded-md px-1.5 py-1 text-left transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";
const INPUT =
  "w-full rounded-md border border-ring bg-background px-1.5 py-1 text-sm outline-none";

/**
 * Click the value, type, done — no edit mode and no save button, which is what
 * RELIV-44 asks for. Enter or blur commits, Escape reverts.
 *
 * `multiline` swaps the input for a textarea, where Enter has to mean newline;
 * blur or ⌘+Enter commits instead.
 */
export function EditableText({
  value,
  onCommit,
  placeholder = "Empty",
  multiline = false,
  className,
}: {
  value: string | null;
  onCommit: (next: string | null) => void;
  placeholder?: string;
  multiline?: boolean;
  /** For values that are not rail-sized — the record page title, say. */
  className?: string;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value ?? "");

  React.useEffect(() => {
    if (!editing) setDraft(value ?? "");
  }, [value, editing]);

  if (editing) {
    const commit = () => {
      setEditing(false);
      const next = draft.trim();
      if (next !== (value ?? "")) onCommit(next === "" ? null : next);
    };

    const revert = () => {
      setDraft(value ?? "");
      setEditing(false);
    };

    const shared = { autoFocus: true, value: draft, onBlur: commit };

    return multiline ? (
      <textarea
        {...shared}
        rows={3}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") revert();
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            commit();
          }
        }}
        className={cn(INPUT, "field-sizing-content resize-none", className)}
      />
    ) : (
      <input
        {...shared}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") revert();
        }}
        className={cn(INPUT, className)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={cn(RESTING, multiline && "whitespace-pre-line", className)}
    >
      {value ?? <Placeholder>{placeholder}</Placeholder>}
    </button>
  );
}

/**
 * Phone fields are free text in the column, which is how "call me maybe" gets
 * filed as a number. This parses what you type and only commits when it is a
 * real number, storing canonical E.164 and showing it formatted.
 *
 * Invalid input keeps you in the field rather than discarding what you typed —
 * a phone is usually copied from somewhere and retyping it is the annoying
 * part. Escape still reverts, and emptying it still clears the field.
 */
export function EditablePhone({
  value,
  onCommit,
  placeholder = "Empty",
}: {
  value: string | null;
  onCommit: (next: string | null) => void;
  placeholder?: string;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState("");

  React.useEffect(() => {
    if (!editing) setDraft(value ? formatPhone(value) : "");
  }, [value, editing]);

  if (editing) {
    const typed = draft.trim();
    const normalized = typed === "" ? null : normalizePhone(typed);
    const invalid = typed !== "" && normalized === null;

    const commit = () => {
      if (invalid) return;
      setEditing(false);
      if (normalized !== value) onCommit(normalized);
    };

    return (
      <div className="flex flex-col gap-1">
        <input
          autoFocus
          type="tel"
          inputMode="tel"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit();
            if (event.key === "Escape") {
              setDraft(value ? formatPhone(value) : "");
              setEditing(false);
            }
          }}
          placeholder="+1 408 555 0163"
          aria-invalid={invalid || undefined}
          className={cn(INPUT, invalid && "border-destructive")}
        />
        {invalid ? (
          <span className="px-1.5 text-xs text-destructive">
            {phoneMessage}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setEditing(true)} className={RESTING}>
      {value === null ? (
        <Placeholder>{placeholder}</Placeholder>
      ) : (
        formatPhone(value)
      )}
    </button>
  );
}

/** Enum fields — a range, never a free number. Empty clears the value. */
export function EditableSelect<T extends string>({
  value,
  options,
  onCommit,
  placeholder = "Empty",
}: {
  value: T | null;
  options: readonly T[];
  onCommit: (next: T | null) => void;
  placeholder?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`${RESTING} text-sm`}>
        {value ?? <Placeholder>{placeholder}</Placeholder>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuRadioGroup
          value={value ?? ""}
          onValueChange={(next) => onCommit(next === "" ? null : (next as T))}
        >
          <DropdownMenuRadioItem value="">
            <span className="text-muted-foreground">{placeholder}</span>
          </DropdownMenuRadioItem>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {option}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Money is stored in minor units but nobody types cents. The field reads and
 * writes dollars and does the ×100 here, so "5000" can never be filed as $50.
 */
export function EditableMoney({
  value,
  onCommit,
  placeholder = "Empty",
}: {
  value: number | null;
  onCommit: (next: number | null) => void;
  placeholder?: string;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState("");

  React.useEffect(() => {
    if (!editing) setDraft(value === null ? "" : String(value / 100));
  }, [value, editing]);

  if (editing) {
    const commit = () => {
      setEditing(false);
      const cleaned = draft.replace(/[$,\s]/g, "");
      if (cleaned === "") return onCommit(null);
      const dollars = Number(cleaned);
      if (!Number.isFinite(dollars) || dollars < 0) return;
      onCommit(Math.round(dollars * 100));
    };

    return (
      <input
        autoFocus
        inputMode="decimal"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") setEditing(false);
        }}
        placeholder="0"
        className={`${INPUT} tabular-nums`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`${RESTING} tabular-nums`}
    >
      {value === null ? (
        <Placeholder>{placeholder}</Placeholder>
      ) : (
        formatMoney(value)
      )}
    </button>
  );
}

/**
 * `socials` is a jsonb map of platform to URL, so a single text field cannot
 * express it. Entries are rows, not chips — chips became unreadable the moment
 * a handle ran longer than a word, and left nowhere sensible for the remove
 * control to sit.
 *
 * Adding lives in `AddSocialLink`, up on the field's label line: a list field
 * has no single value to click into, so the affordance has to be its own.
 */
export function SocialLinks({
  value,
  onRemove,
}: {
  value: Record<string, string> | null;
  onRemove: (platform: string) => void;
}) {
  const entries = Object.entries(value ?? {});

  if (entries.length === 0) {
    return (
      <span className="block px-1.5 py-1 text-muted-foreground/40">Empty</span>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {entries.map(([key, href]) => (
        <div
          key={key}
          className="group/social flex items-center gap-2 rounded-md py-0.5 pr-0.5 pl-1.5 transition-colors hover:bg-muted/60"
        >
          <PlatformMark platform={key} />
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="min-w-0 flex-1 truncate text-sm hover:underline"
          >
            {socialHandle(key, href)}
          </a>
          <button
            type="button"
            onClick={() => onRemove(key)}
            aria-label={`Remove ${key}`}
            className="shrink-0 rounded-sm p-0.5 text-muted-foreground opacity-0 transition-opacity group-hover/social:opacity-100 hover:text-foreground focus-visible:opacity-100"
          >
            <XMarkIcon className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

/**
 * One field. Nobody knows what we call a platform, but everybody has the
 * profile open in a tab, so paste the link and the hostname says which it is —
 * the mark inside the field is the confirmation. A picker would be asking for
 * something the URL already contains.
 */
export function AddSocialLink({
  onAdd,
}: {
  onAdd: (platform: string, url: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [link, setLink] = React.useState("");

  const typed = link.trim();
  const platform = typed === "" ? null : detectPlatform(typed);

  const close = () => {
    setOpen(false);
    setLink("");
  };

  const add = () => {
    if (typed === "" || !platform) return;
    onAdd(platform.id, normalizeSocialUrl(typed));
    close();
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => (next ? setOpen(true) : close())}
    >
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon-xs" aria-label="Add a link" />
        }
      >
        <PlusIcon className="size-3.5" />
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 gap-2.5">
        <div className="flex items-center gap-2 rounded-lg border border-input pr-2.5 pl-2.5 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          {/* Reserves its slot from the start, so recognising the host swaps
              the glyph instead of shifting the field. */}
          <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
            {platform ? (
              <PlatformMark platform={platform.id} />
            ) : (
              <LinkIcon className="size-4" />
            )}
          </span>
          <input
            autoFocus
            value={link}
            onChange={(event) => setLink(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") add();
              if (event.key === "Escape") close();
            }}
            placeholder="Paste a profile link"
            aria-label="Profile link"
            className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {platform ? platform.id : ""}
          </span>
          <Button variant="ghost" size="sm" onClick={close}>
            Cancel
          </Button>
          <Button size="sm" onClick={add} disabled={typed === ""}>
            Add
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PlatformMark({ platform }: { platform: string }) {
  return hasSocialIcon(platform) ? (
    <SocialIcon platform={platform} className="size-4 shrink-0" />
  ) : (
    <GlobeAltIcon className="size-4 shrink-0 text-muted-foreground" />
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground/40">{children}</span>;
}
