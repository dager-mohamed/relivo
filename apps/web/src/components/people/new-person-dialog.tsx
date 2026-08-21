import * as React from "react";
import { Link } from "@tanstack/react-router";
import { BriefcaseIcon, PhoneIcon } from "@heroicons/react/24/outline";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";

import {
  CreateIdentity,
  CreateNameLine,
  CreateRecordDialog,
  heroInputClass,
} from "#/components/record-form/create-dialog";
import {
  ChipPhone,
  ChipText,
  FieldChip,
} from "#/components/record-form/field-chip";
import {
  companyFromEmail,
  draftPersonCompany,
  draftPersonName,
  emptyPersonDraft,
  personDraftStatus,
  type NewPerson,
  type PersonDraft,
} from "#/lib/people/new-person";
import type { CompanyListRow } from "#/mocks/company-rows";
import { personInitials, type PersonListRow } from "#/mocks/person-rows";

/**
 * The address leads, and it carries two other fields with it: the local part
 * guesses the name, the domain finds the company.
 *
 * That is not a trick — it is what email sync does to every message it
 * ingests, so a person typed after a call and a person discovered in the inbox
 * are built the same way. It also matches how anyone actually has this: you
 * leave a meeting holding a card, not a form.
 *
 * A name alone is enough too. `people` requires a name *or* an email, so the
 * name line stays editable even with the address empty.
 */
export function NewPersonDialog({
  open,
  onOpenChange,
  existing,
  companies,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing: readonly PersonListRow[];
  companies: readonly CompanyListRow[];
  /** See `NewCompanyDialog` — the list decides what follows a create, not this. */
  onCreate: (person: NewPerson, createMore: boolean) => void;
}) {
  const [draft, setDraft] = React.useState<PersonDraft>(emptyPersonDraft);
  const emailRef = React.useRef<HTMLInputElement>(null);

  const status = personDraftStatus(draft, existing);
  const name = draftPersonName(draft);
  const company = draftPersonCompany(draft, companies);
  // Whether the company on the chip was found rather than chosen — worth
  // saying, because a match you did not make is one you should be able to see.
  const matched =
    draft.companyId === null &&
    companyFromEmail(draft.email.trim(), companies) !== null;

  const set = <K extends keyof PersonDraft>(key: K) => {
    return (value: PersonDraft[K]) =>
      setDraft((current) => ({ ...current, [key]: value }));
  };

  const submit = (createMore: boolean) => {
    if (status.kind !== "ready") return false;

    onCreate(
      {
        name: status.name,
        email: status.email,
        companyId: company?.id ?? null,
        role: draft.role,
        phone: draft.phone,
      },
      createMore,
    );
    return true;
  };

  return (
    <CreateRecordDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New person"
      onSubmit={submit}
      onReset={(createMore) => {
        setDraft(emptyPersonDraft);
        if (createMore) emailRef.current?.focus();
      }}
      identity={
        <CreateIdentity
          shape="round"
          monogram={
            name === "" && draft.email.trim() === ""
              ? ""
              : personInitials({
                  name: name === "" ? null : name,
                  email: draft.email.trim() || null,
                })
          }
        >
          <input
            ref={emailRef}
            autoFocus
            type="email"
            value={draft.email}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            placeholder="nolan@atari.com"
            aria-label="Email"
            autoComplete="off"
            spellCheck={false}
            className={heroInputClass}
          />
          <CreateNameLine
            kind={status.kind}
            message={
              status.kind === "duplicate"
                ? `${status.person.name ?? status.person.email} is already here`
                : status.kind === "invalid"
                  ? status.message
                  : undefined
            }
            hint="The name and company fill themselves in"
            nameAlone
            name={name}
            placeholder="Add a name instead"
            onRename={set("name")}
          />
        </CreateIdentity>
      }
      chips={
        <>
          <CompanyChip
            company={company}
            matched={matched}
            companies={companies}
            onChange={set("companyId")}
          />
          <ChipText
            icon={BriefcaseIcon}
            label="Role"
            value={draft.role}
            onChange={set("role")}
            placeholder="Founder"
          />
          <ChipPhone
            icon={PhoneIcon}
            label="Phone"
            value={draft.phone}
            onChange={set("phone")}
          />
        </>
      }
      submit={
        status.kind === "duplicate" ? (
          <Button
            nativeButton={false}
            render={
              <Link
                to="/people/$personId"
                params={{ personId: status.person.id }}
              />
            }
          >
            Open record
          </Button>
        ) : (
          <Button type="submit" disabled={status.kind !== "ready"}>
            Create person
          </Button>
        )
      }
    />
  );
}

/**
 * Its own chip rather than a `ChipSelect`: companies are records, not enum
 * values, so the menu shows logos, and the chip has a state an enum has
 * never had — filled by the address rather than by you.
 */
function CompanyChip({
  company,
  matched,
  companies,
  onChange,
}: {
  company: CompanyListRow | null;
  matched: boolean;
  companies: readonly CompanyListRow[];
  onChange: (id: string | null) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <FieldChip
            icon={CompanyMark}
            label="Company"
            value={company?.name ?? null}
            // A quiet halo when the address found it, so a company you did not
            // pick is visibly not one you picked. A ring rather than a border:
            // FieldChip's own `data-filled:border-*` would win on specificity
            // and the override would silently do nothing.
            className={matched ? "ring-1 ring-ring/30" : undefined}
          />
        }
      />
      <DropdownMenuContent
        align="start"
        className="max-h-80 w-56 overflow-y-auto"
      >
        <DropdownMenuItem onClick={() => onChange(null)}>
          <span className="text-muted-foreground">Match from the address</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {companies.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => onChange(option.id)}
            className="gap-2"
          >
            <Avatar className="size-4 shrink-0 rounded-sm">
              <AvatarImage src={option.logoUrl ?? undefined} />
              <AvatarFallback className="rounded-sm bg-muted text-[0.5rem] font-medium">
                {option.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{option.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Square mark, matching how a company reads everywhere else in the app. */
function CompanyMark({ className }: { className?: string }) {
  return (
    <span
      className={`${className ?? ""} inline-block rounded-[3px] border border-current`}
    />
  );
}
