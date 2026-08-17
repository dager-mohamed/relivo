import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BanknotesIcon,
  DocumentTextIcon,
  HashtagIcon,
  MapPinIcon,
  PhoneIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

import { employeeRanges, revenueRanges } from "@repo/schema";
import { Button } from "@repo/ui/components/button";

import {
  CreateIdentity,
  CreateNameLine,
  CreateRecordDialog,
  heroInputClass,
} from "#/components/record-form/create-dialog";
import {
  ChipMoney,
  ChipPhone,
  ChipSelect,
  ChipText,
} from "#/components/record-form/field-chip";
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
  const domainRef = React.useRef<HTMLInputElement>(null);

  const status = draftStatus(draft, existing);
  const name = draftName(draft);

  const set = <K extends keyof CompanyDraft>(key: K) => {
    return (value: CompanyDraft[K]) =>
      setDraft((current) => ({ ...current, [key]: value }));
  };

  const submit = (createMore: boolean) => {
    if (status.kind !== "ready") return false;

    const id = onCreate({ ...draft, domain: status.domain });
    if (createMore) return true;

    // Not back to the list: it sorts by pipeline value, so a company with no
    // deals yet lands near the bottom and closing the dialog would look like
    // nothing happened. The record you just made is the confirmation.
    void navigate({ to: "/companies/$companyId", params: { companyId: id } });
    return true;
  };

  return (
    <CreateRecordDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New company"
      onSubmit={submit}
      onReset={(createMore) => {
        setDraft(emptyCompanyDraft);
        if (createMore) domainRef.current?.focus();
      }}
      identity={
        <CreateIdentity monogram={name.slice(0, 1).toUpperCase()}>
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
            className={heroInputClass}
          />
          <CreateNameLine
            kind={status.kind}
            message={
              status.kind === "duplicate"
                ? `${status.company.name} is already here`
                : status.kind === "invalid"
                  ? status.message
                  : undefined
            }
            hint="The name fills itself in"
            name={name}
            onRename={set("name")}
          />
        </CreateIdentity>
      }
      chips={
        <>
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
          <ChipPhone
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
        </>
      }
      submit={
        status.kind === "duplicate" ? (
          <Button
            nativeButton={false}
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
        )
      }
    />
  );
}
