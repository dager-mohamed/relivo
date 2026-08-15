import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BanknotesIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  HashtagIcon,
  MapPinIcon,
  PhoneIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

import { employeeRanges, revenueRanges } from "@repo/schema";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Switch } from "@repo/ui/components/switch";

import {
  ChipMoney,
  ChipSelect,
  ChipText,
} from "#/components/record-form/field-chip";
import { EditableText } from "#/components/record-panel/editable-field";
import {
  draftName,
  draftStatus,
  emptyCompanyDraft,
  type CompanyDraft,
} from "#/lib/companies/new-company";
import type { CompanyListRow } from "#/mocks/company-rows";

/**
 * The domain leads, not the name.
 *
 * A company is identified by its domain everywhere in B2B, `companies` is
 * unique on it, and `companyInsert` already derives the name from it — so the
 * one field worth making the headline is the one that does three jobs at
 * once: names the record, fills the name in front of you, and says when this
 * company is already here.
 *
 * Everything else is a chip. Companies get enriched rather than typed, so a
 * column of nine labelled inputs would ask for work nobody does at this
 * moment, while burying the field that matters.
 */
export function NewCompanyDialog({
  open,
  onOpenChange,
  existing,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing: readonly CompanyListRow[];
  /** Returns the new record's id, which is where we go next. */
  onCreate: (draft: CompanyDraft) => string;
}) {
  const navigate = useNavigate();
  const [draft, setDraft] = React.useState<CompanyDraft>(emptyCompanyDraft);
  const [createMore, setCreateMore] = React.useState(false);
  const [added, setAdded] = React.useState(0);
  const domainRef = React.useRef<HTMLInputElement>(null);

  const status = draftStatus(draft, existing);
  const name = draftName(draft);

  const set = <K extends keyof CompanyDraft>(key: K) => {
    return (value: CompanyDraft[K]) =>
      setDraft((current) => ({ ...current, [key]: value }));
  };

  const close = (next: boolean) => {
    if (!next) {
      setDraft(emptyCompanyDraft);
      setAdded(0);
    }
    onOpenChange(next);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (status.kind !== "ready") return;

    const id = onCreate({ ...draft, domain: status.domain });

    if (createMore) {
      // Staying open is the point of the toggle, so the running count in the
      // footer is the confirmation — a toast per company would stack up.
      setDraft(emptyCompanyDraft);
      setAdded((count) => count + 1);
      domainRef.current?.focus();
      return;
    }

    // Not back to the list: it sorts by pipeline value, so a company with no
    // deals yet lands near the bottom and closing the dialog would look like
    // nothing happened. The record you just made is the confirmation.
    close(false);
    void navigate({ to: "/companies/$companyId", params: { companyId: id } });
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent showCloseButton={false} className="gap-0 sm:max-w-xl">
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader className="gap-0">
            <DialogTitle className="text-xs text-muted-foreground">
              New company
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-3">
            {name === "" ? (
              <div className="size-10 shrink-0 rounded-xl border border-dashed border-input" />
            ) : (
              <Avatar className="size-10 shrink-0 rounded-xl">
                <AvatarFallback className="rounded-xl bg-muted text-sm font-semibold">
                  {name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
              <input
                ref={domainRef}
                autoFocus
                value={draft.domain}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    domain: event.target.value,
                  }))
                }
                placeholder="acme.com"
                aria-label="Domain"
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-transparent text-xl leading-8 font-semibold tracking-tight outline-none placeholder:font-normal placeholder:text-muted-foreground/40"
              />
              <NameLine status={status} name={name} onRename={set("name")} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <ChipText
              icon={MapPinIcon}
              label="Location"
              value={draft.location}
              onChange={set("location")}
              placeholder="SF"
            />
            <ChipSelect
              icon={UserGroupIcon}
              label="Employees"
              value={draft.employees}
              options={employeeRanges}
              onChange={set("employees")}
            />
            <ChipSelect
              icon={BanknotesIcon}
              label="Revenue"
              value={draft.revenue}
              options={revenueRanges}
              onChange={set("revenue")}
            />
            <ChipMoney
              icon={HashtagIcon}
              label="Funding"
              value={draft.funding}
              onChange={set("funding")}
            />
            <ChipText
              icon={PhoneIcon}
              label="Phone"
              value={draft.phone}
              onChange={set("phone")}
            />
            <ChipText
              icon={DocumentTextIcon}
              label="Description"
              value={draft.description}
              onChange={set("description")}
              placeholder="What do they do?"
              multiline
            />
          </div>

          <DialogFooter className="flex-row items-center px-4 py-3">
            <div className="mr-auto flex items-center gap-3">
              <Switch
                id="create-more"
                size="sm"
                checked={createMore}
                onCheckedChange={setCreateMore}
              />
              <label
                htmlFor="create-more"
                className="cursor-pointer text-sm text-muted-foreground"
              >
                Create more
              </label>
              {added > 0 ? (
                <span className="text-sm text-muted-foreground tabular-nums">
                  {added} added
                </span>
              ) : null}
            </div>

            <DialogClose render={<Button type="button" variant="ghost" />}>
              Cancel
            </DialogClose>

            {status.kind === "duplicate" ? (
              <Button
                render={
                  <Link
                    to="/companies/$companyId"
                    params={{ companyId: status.company.id }}
                  />
                }
              >
                Open {status.company.name}
              </Button>
            ) : (
              <Button type="submit" disabled={status.kind !== "ready"}>
                Create company
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The line under the domain, which is where the field reports back: the name
 * it derived, the company you already have, or what is wrong with what you
 * typed. Fixed height so none of the three shifts the chips below.
 *
 * Clearing the name restores the derived one — `null` is what "derive it"
 * means, so emptying the field is the way back.
 */
function NameLine({
  status,
  name,
  onRename,
}: {
  status: ReturnType<typeof draftStatus<CompanyListRow>>;
  name: string;
  onRename: (next: string | null) => void;
}) {
  return (
    <div className="flex min-h-7 items-center gap-1.5 text-sm">
      {status.kind === "duplicate" ? (
        <>
          <ExclamationTriangleIcon className="size-3.5 shrink-0 text-warning" />
          <span className="truncate text-muted-foreground">
            {status.company.name} is already here
          </span>
        </>
      ) : status.kind === "invalid" ? (
        <span className="px-1.5 text-destructive">{status.message}</span>
      ) : status.kind === "empty" ? (
        <span className="px-1.5 text-muted-foreground/40">
          The name fills itself in
        </span>
      ) : (
        <>
          <span className="shrink-0 text-muted-foreground">Name</span>
          <EditableText
            value={name}
            onCommit={onRename}
            className="w-auto max-w-full font-medium"
          />
        </>
      )}
    </div>
  );
}
