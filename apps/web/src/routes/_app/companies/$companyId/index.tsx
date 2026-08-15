import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowTopRightOnSquareIcon,
  BuildingOffice2Icon,
  EllipsisHorizontalIcon,
  LinkIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";

import { CompanyRecord } from "#/components/companies/company-record";
import type { CompanyPatch } from "#/components/companies/company-properties";
import { EmptyState } from "#/components/empty-state";
import { PageShell } from "#/components/page-shell";
import { companyRows } from "#/mocks/company-rows";

export const Route = createFileRoute("/_app/companies/$companyId/")({
  component: CompanyPage,
});

function CompanyPage() {
  const { companyId } = Route.useParams();
  // Local until `companies.byId` exists, same as the list screen — a query
  // plus a mutation replaces this state and nothing else on the page.
  const [rows, setRows] = React.useState(companyRows);
  const [starred, setStarred] = React.useState(false);

  const company = rows.find((row) => row.id === companyId);

  const handleEdit = React.useCallback(
    (patch: CompanyPatch) => {
      setRows((current) =>
        current.map((row) =>
          row.id === companyId ? { ...row, ...patch } : row,
        ),
      );
    },
    [companyId],
  );

  if (!company) {
    return (
      <PageShell
        title="Company"
        parent={{ label: "Companies", to: "/companies" }}
      >
        <EmptyState
          icon={BuildingOffice2Icon}
          title="This company is gone"
          description="It may have been deleted, or the link may be out of date."
          action={
            <Button variant="outline" render={<Link to="/companies" />}>
              Back to companies
            </Button>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={company.name}
      parent={{ label: "Companies", to: "/companies" }}
      bleed
      actions={
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={
              starred ? "Remove from favourites" : "Add to favourites"
            }
            aria-pressed={starred}
            onClick={() => setStarred((current) => !current)}
          >
            {starred ? (
              <StarIconSolid className="size-4" />
            ) : (
              <StarIcon className="size-4" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="More actions"
                />
              }
            >
              <EllipsisHorizontalIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() =>
                    void navigator.clipboard.writeText(window.location.href)
                  }
                >
                  <LinkIcon />
                  Copy record link
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={
                    <a
                      href={`https://${company.domain}`}
                      target="_blank"
                      rel="noreferrer noopener"
                    />
                  }
                >
                  <ArrowTopRightOnSquareIcon />
                  Open website
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    >
      <CompanyRecord key={company.id} company={company} onEdit={handleEdit} />
    </PageShell>
  );
}
