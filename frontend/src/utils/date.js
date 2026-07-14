// Local YYYY-MM-DD (avoids UTC off-by-one from toISOString()).
export function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function formatDisplayDate(isoDate) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

// Last `count` calendar dates ending today, oldest first.
export function lastNDatesISO(count) {
  const today = todayISO();
  const [y, m, d] = today.split("-").map(Number);
  const dates = [];
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(y, m - 1, d - i);
    const offset = date.getTimezoneOffset();
    dates.push(new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10));
  }
  return dates;
}

export function shortWeekday(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short" });
}
