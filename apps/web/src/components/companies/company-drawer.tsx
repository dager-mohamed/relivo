import { Link } from "@tanstack/react-router";
import {
  ArrowsPointingOutIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { Sheet, SheetContent } from "@repo/ui/components/sheet";

import { CompanyPanel } from "#/components/companies/company-panel";
import type { CompanyPatch } from "#/components/companies/company-properties";
import type { CompanyListRow } from "#/mocks/company-rows";

/**
 * The record panel, opened from the list. Same component the record page
 * mounts, so the two surfaces cannot drift apart — RELIV-44 asks for a
 * reusable layout, not a page and a panel that disagree.
 */
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
    <Sheet open={company !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        // Must match SheetContent's own variant chain. It caps width with
        // `data-[side=right]:sm:max-w-sm`; a plain `sm:max-w-*` is a different
        // chain, so tailwind-merge keeps both and the attribute-scoped rule
        // wins on specificity — which pinned this at 384px.
        className="flex w-full flex-col gap-0 p-0 data-[side=right]:sm:max-w-5xl"
      >
        {company ? (
          <>
            <header className="flex h-12 shrink-0 items-center gap-2.5 border-b border-border px-3">
              <Avatar className="size-5 shrink-0 rounded-sm">
                <AvatarImage src={company.logoUrl ?? undefined} />
                <AvatarFallback className="rounded-sm bg-muted text-[0.625rem] font-medium">
                  {company.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate font-heading font-semibold">
                {company.name}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                Created{" "}
                {company.createdAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                })}
              </span>

              <div className="ml-auto flex shrink-0 items-center gap-0.5">
                <Button variant="ghost" size="icon-sm" aria-label="Favourite">
                  <StarIcon className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Open full record"
                  render={
                    <Link
                      to="/companies/$companyId"
                      params={{ companyId: company.id }}
                    />
                  }
                >
                  <ArrowsPointingOutIcon className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close"
                  onClick={onClose}
                >
                  <XMarkIcon className="size-4" />
                </Button>
              </div>
            </header>

            <CompanyPanel
              key={company.id}
              company={company}
              onEdit={(patch) => onEdit(company.id, patch)}
            />
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
