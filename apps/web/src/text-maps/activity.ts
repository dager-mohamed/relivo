import {
  ArrowRightCircleIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  MinusCircleIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  SparklesIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

import type { ActivityAction } from "@repo/schema";

/**
 * `activity_events` stores the action plus a jsonb payload, never the rendered
 * sentence — see packages/db/src/schema/timeline.ts. Composing it here is what
 * lets the wording change without a backfill, so this map is the only place
 * that knows how an event reads.
 *
 * `phrase` returns everything after the actor's name.
 */
export const activityActionText: Record<
  ActivityAction,
  {
    icon: React.ComponentType<{ className?: string }>;
    phrase: (data: Record<string, unknown> | null) => string;
  }
> = {
  record_created: {
    icon: SparklesIcon,
    phrase: () => "created this record",
  },
  field_set: {
    icon: PlusCircleIcon,
    phrase: (d) => `set ${field(d)} to ${value(d, "to")}`,
  },
  field_changed: {
    icon: PencilSquareIcon,
    phrase: (d) => `changed ${field(d)} to ${value(d, "to")}`,
  },
  field_cleared: {
    icon: MinusCircleIcon,
    phrase: (d) => `cleared ${field(d)}`,
  },
  stage_changed: {
    icon: ArrowRightCircleIcon,
    phrase: (d) => `moved the deal to ${value(d, "to")}`,
  },
  next_step_created: {
    icon: CheckCircleIcon,
    phrase: (d) => `added the next step ${value(d, "target")}`,
  },
  next_step_completed: {
    icon: CheckCircleIcon,
    phrase: (d) => `completed ${value(d, "target")}`,
  },
  person_linked: {
    icon: UserPlusIcon,
    phrase: (d) => `linked ${value(d, "target")}`,
  },
  person_unlinked: {
    icon: UserMinusIcon,
    phrase: (d) => `unlinked ${value(d, "target")}`,
  },
  feedback_linked: {
    icon: ChatBubbleLeftRightIcon,
    phrase: (d) => `linked the request ${value(d, "target")}`,
  },
  feedback_unlinked: {
    icon: ChatBubbleLeftRightIcon,
    phrase: (d) => `unlinked the request ${value(d, "target")}`,
  },
  note_added: {
    icon: DocumentTextIcon,
    phrase: () => "added a note",
  },
};

// jsonb is untyped by definition, so every read is defensive — an event
// written by an older version of the app must still render as a sentence.
function value(data: Record<string, unknown> | null, key: string): string {
  const raw = data?.[key];
  return typeof raw === "string" && raw !== "" ? raw : "—";
}

function field(data: Record<string, unknown> | null): string {
  const raw = data?.field;
  return typeof raw === "string" && raw !== "" ? raw : "a field";
}
