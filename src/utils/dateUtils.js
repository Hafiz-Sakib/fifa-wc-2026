import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

/**
 * All times in fixtures.json are already in BST (UTC+6).
 */

export function formatDate(dateStr) {
  return dayjs(dateStr).format("dddd, D MMMM YYYY");
}

export function formatDateShort(dateStr) {
  return dayjs(dateStr).format("D MMM");
}

export function formatDateCard(dateStr) {
  return dayjs(dateStr).format("ddd, D MMM YYYY");
}

/**
 * Convert "HH:mm" (24h) → "h:mm AM/PM BST"
 * e.g. "03:00" → "3:00 AM BST"   "21:00" → "9:00 PM BST"
 */
export function formatTime(timeStr) {
  return dayjs(`2000-01-01 ${timeStr}`, "YYYY-MM-DD HH:mm").format("h:mm A") + " BST";
}

/**
 * Return day/night period info based on BST hour.
 * Returns { label, emoji, className }
 *   className matches CSS classes: time-dawn | time-day | time-night
 */
export function getTimePeriod(timeStr) {
  const hour = parseInt(timeStr.split(":")[0], 10);

  if (hour >= 5 && hour < 12) {
    return { label: "সকাল (Morning)",  emoji: "🌅", className: "time-dawn"  };
  } else if (hour >= 12 && hour < 17) {
    return { label: "দুপুর (Afternoon)", emoji: "☀️",  className: "time-day"   };
  } else if (hour >= 17 && hour < 20) {
    return { label: "বিকাল (Evening)",  emoji: "🌆", className: "time-day"   };
  } else if (hour >= 20 || hour < 1) {
    return { label: "রাত (Night)",      emoji: "🌙", className: "time-night" };
  } else {
    // 1:00 – 4:59
    return { label: "রাত (Late Night)", emoji: "🌙", className: "time-night" };
  }
}

export function getUniqueDates(fixtures) {
  const dates = [...new Set(fixtures.map((f) => f.date))];
  return dates.sort();
}

export function groupByDate(fixtures) {
  const groups = {};
  fixtures.forEach((f) => {
    if (!groups[f.date]) groups[f.date] = [];
    groups[f.date].push(f);
  });
  Object.keys(groups).forEach((date) => {
    groups[date].sort((a, b) => a.time.localeCompare(b.time));
  });
  return groups;
}

export function sortByDateTime(fixtures) {
  return [...fixtures].sort((a, b) => {
    const dtA = `${a.date} ${a.time}`;
    const dtB = `${b.date} ${b.time}`;
    return dtA.localeCompare(dtB);
  });
}

export function getDayAbbr(dateStr) {
  return dayjs(dateStr).format("ddd");
}

export function getMonthName(dateStr) {
  return dayjs(dateStr).format("MMMM YYYY");
}

export function groupDatesByMonth(dates) {
  const months = {};
  dates.forEach((d) => {
    const month = dayjs(d).format("MMMM YYYY");
    if (!months[month]) months[month] = [];
    months[month].push(d);
  });
  return months;
}
