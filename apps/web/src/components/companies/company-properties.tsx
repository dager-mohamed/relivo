import {
  BanknotesIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  HashtagIcon,
  LinkIcon,
  MapPinIcon,
  PhoneIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

import { employeeRanges, revenueRanges } from "@repo/schema";

import {
  AddSocialLink,
  EditableMoney,
  EditableSelect,
  EditableText,
  SocialLinks,
} from "#/components/record-panel/editable-field";
import { FieldRow, StaticValue } from "#/components/record-panel/field-row";
import { PanelSection } from "#/components/record-panel/panel-section";
import type { CompanyListRow } from "#/mocks/company-rows";
import { formatDate } from "#/text-maps";

/** Only the fields a user owns — derived counts and totals are not patchable. */
export type CompanyPatch = Partial<
  Pick<
    CompanyListRow,
    | "name"
    | "domain"
    | "location"
    | "description"
    | "phone"
    | "employees"
    | "revenue"
    | "funding"
    | "socials"
  >
>;

/**
 * Every field on the record, grouped and collapsible. Rendered by both the
 * drawer and the record page — one list, so the two surfaces cannot disagree
 * about what a company has.
 *
 * Grouped by who asks for it: General is what you type after a call,
 * Firmographics is what qualifies the deal, Contact is how you reach them.
 * System is closed by default because nobody opens a record to read it.
 */
export function CompanyProperties({
  company,
  now,
  onEdit,
}: {
  company: CompanyListRow;
  now: Date;
  onEdit: (patch: CompanyPatch) => void;
}) {
  return (
    <div className="flex flex-col">
      <PanelSection id="company-general" title="General">
        <FieldRow label="Name" icon={BuildingOffice2Icon}>
          <EditableText
            value={company.name}
            onCommit={(name) => onEdit({ name: name ?? company.name })}
          />
        </FieldRow>
        <FieldRow label="Domain" icon={GlobeAltIcon}>
          <EditableText
            value={company.domain}
            onCommit={(domain) => onEdit({ domain: domain ?? company.domain })}
            placeholder="acme.com"
          />
        </FieldRow>
        <FieldRow label="Location" icon={MapPinIcon}>
          <EditableText
            value={company.location}
            onCommit={(location) => onEdit({ location })}
            placeholder="Add location"
          />
        </FieldRow>
        <FieldRow label="Description" icon={DocumentTextIcon} stacked>
          <EditableText
            value={company.description}
            onCommit={(description) => onEdit({ description })}
            placeholder="What do they do?"
            multiline
          />
        </FieldRow>
      </PanelSection>

      <PanelSection id="company-firmographics" title="Firmographics">
        <FieldRow label="Employees" icon={UserGroupIcon}>
          <EditableSelect
            value={company.employees}
            options={employeeRanges}
            onCommit={(employees) => onEdit({ employees })}
          />
        </FieldRow>
        <FieldRow label="Revenue" icon={BanknotesIcon}>
          <EditableSelect
            value={company.revenue}
            options={revenueRanges}
            onCommit={(revenue) => onEdit({ revenue })}
          />
        </FieldRow>
        <FieldRow label="Funding" icon={HashtagIcon}>
          <EditableMoney
            value={company.funding}
            onCommit={(funding) => onEdit({ funding })}
          />
        </FieldRow>
      </PanelSection>

      <PanelSection id="company-contact" title="Contact">
        <FieldRow label="Phone" icon={PhoneIcon}>
          <EditableText
            value={company.phone}
            onCommit={(phone) => onEdit({ phone })}
            placeholder="Add phone"
          />
        </FieldRow>
        <FieldRow
          label="Social"
          icon={LinkIcon}
          align="start"
          action={
            <AddSocialLink
              onAdd={(platform, url) =>
                onEdit({
                  socials: { ...(company.socials ?? {}), [platform]: url },
                })
              }
            />
          }
        >
          <SocialLinks
            value={company.socials}
            onRemove={(platform) => {
              const next = { ...(company.socials ?? {}) };
              delete next[platform];
              onEdit({
                socials: Object.keys(next).length === 0 ? null : next,
              });
            }}
          />
        </FieldRow>
      </PanelSection>

      <PanelSection id="company-system" title="System" defaultOpen={false}>
        <FieldRow label="Created" icon={CalendarIcon}>
          <StaticValue>{formatDate(company.createdAt, now)}</StaticValue>
        </FieldRow>
        <FieldRow label="Updated" icon={CalendarIcon}>
          <StaticValue>{formatDate(company.updatedAt, now)}</StaticValue>
        </FieldRow>
      </PanelSection>
    </div>
  );
}
