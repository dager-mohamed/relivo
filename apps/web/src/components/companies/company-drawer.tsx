import { Link } from "@tanstack/react-router";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";

import { CompanyPanel } from "#/components/companies/company-panel";
import type { CompanyPatch } from "#/components/companies/company-properties";
import { RecordDrawer } from "#/components/record-page/record-drawer";
import type { CompanyListRow } from "#/mocks/company-rows";

/** A company in the drawer. The body is the same panel the record page mounts. */
export function CompanyDrawer({
  company,
  onClose,
  onEdit,
}: {
  company: CompanyListRow | null;
  onClose: () => void;
  onEdit: (id: string, patch: CompanyPatch) => void;
}) {
  return (
    <RecordDrawer
      open={company !== null}
      onClose={onClose}
      avatar={
        <Avatar className="size-5 shrink-0 rounded-sm">
          <AvatarImage src={company?.logoUrl ?? undefined} />
          <AvatarFallback className="rounded-sm bg-muted text-[0.625rem] font-medium">
            {company?.name.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
      }
      title={company?.name}
      meta={
        company
          ? `Created ${company.createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
            })}`
          : null
      }
      expandLink={
        <Link
          to="/companies/$companyId"
          params={{ companyId: company?.id ?? "" }}
        />
      }
    >
      {company ? (
        <CompanyPanel
          key={company.id}
          company={company}
          onEdit={(patch) => onEdit(company.id, patch)}
        />
      ) : null}
    </RecordDrawer>
  );
}
