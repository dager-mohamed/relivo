import * as React from "react";

const KEY = "relivo:panel-sections";

/**
 * Panel sections remember whether they were collapsed. localStorage rather
 * than the cookie the sidebar uses: the panel is never server-rendered — it
 * mounts when a record is opened — so there is no first paint to get wrong.
 */
export function usePanelSection(
  id: string,
  defaultOpen = true,
): [boolean, (open: boolean) => void] {
  // Lazy initialiser, not an effect, so the section never flashes open and
  // then shuts. Guarded for SSR.
  const [open, setOpen] = React.useState(() => {
    if (typeof window === "undefined") return defaultOpen;
    return read()[id] ?? defaultOpen;
  });

  const set = React.useCallback(
    (next: boolean) => {
      setOpen(next);
      if (typeof window === "undefined") return;
      write({ ...read(), [id]: next });
    },
    [id],
  );

  return [open, set];
}

function read(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    // Private browsing and disabled storage both throw; defaults are fine.
    return {};
  }
}

function write(state: Record<string, boolean>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Losing the preference is acceptable; breaking the panel is not.
  }
}
