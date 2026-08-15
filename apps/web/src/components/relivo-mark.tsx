/**
 * The brand symbol inlined rather than imported from @repo/assets, so it can
 * take `currentColor` and follow the theme. Importing the .svg gives a URL,
 * which would pin it to one colour. Geometry matches icons/mark-black.svg
 * exactly — do not redraw it here.
 */
export function RelivoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={8}
      className={className}
      aria-hidden="true"
    >
      <path d="M39.45 28.14A16 16 0 0 1 8.55 28.14" />
      <path d="M8.55 19.86A16 16 0 0 1 39.45 19.86" />
    </svg>
  );
}
