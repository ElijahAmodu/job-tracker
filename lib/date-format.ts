/** "2021-06-01" -> "Jun 2021". Falls back to the raw string if it doesn't parse. */
export function formatMonthYear(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/**
 * Builds a "Jun 2021 – Mar 2023" style range.
 *
 * allowPresent controls what happens when there's no end date: for a current
 * job that means "Jun 2021 – Present"; for education/certifications a missing
 * end date usually just means it wasn't recorded, not that it's ongoing, so
 * allowPresent should be false there — this returns just the start date with
 * no dash and no "Present" in that case.
 */
export function formatDateRange(
  start: string | null,
  end: string | null,
  opts: { allowPresent?: boolean } = {},
): string | null {
  const { allowPresent = true } = opts;
  const startFmt = formatMonthYear(start);
  const endFmt = formatMonthYear(end);

  if (!startFmt && !endFmt) return null;
  if (endFmt) return `${startFmt ?? ""} – ${endFmt}`.trim();
  return allowPresent ? `${startFmt} – Present` : startFmt;
}
