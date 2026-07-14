import { formatShortDate } from "../../utils/date";

// Groups a real day-by-day rate series into weekly/monthly averages, purely
// by re-aggregating the same numbers — no new data is invented.
export function bucketTrend(dailyTrend, granularity) {
  if (dailyTrend.length === 0) return [];

  if (granularity === "daily") {
    return dailyTrend.map((d) => ({
      key: d.date,
      label: formatShortDate(d.date).replace(/, \d{4}$/, ""),
      rate: d.rate,
    }));
  }

  const [firstY, firstM, firstD] = dailyTrend[0].date.split("-").map(Number);
  const firstDate = new Date(firstY, firstM - 1, firstD);

  const buckets = new Map();
  dailyTrend.forEach((d) => {
    const [y, m, day] = d.date.split("-").map(Number);
    let key;
    let label;

    if (granularity === "monthly") {
      key = `${y}-${String(m).padStart(2, "0")}`;
      label = new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short", year: "numeric" });
    } else {
      const thisDate = new Date(y, m - 1, day);
      const dayDiff = Math.round((thisDate - firstDate) / 86400000);
      const weekIdx = Math.floor(dayDiff / 7);
      key = `w${weekIdx}`;
      label = formatShortDate(d.date).replace(/, \d{4}$/, "");
    }

    if (!buckets.has(key)) buckets.set(key, { label, sum: 0, count: 0 });
    const bucket = buckets.get(key);
    if (d.rate !== null) {
      bucket.sum += d.rate;
      bucket.count += 1;
    }
  });

  return Array.from(buckets.entries()).map(([key, b]) => ({
    key,
    label: b.label,
    rate: b.count === 0 ? null : Math.round(b.sum / b.count),
  }));
}
