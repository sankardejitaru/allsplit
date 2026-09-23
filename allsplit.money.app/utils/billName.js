const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const BILL_NAME_SEPARATOR = " — ";

export function ordinalDay(day) {
  const value = Number(day) || 0;
  const teen = value % 100;
  if (teen >= 11 && teen <= 13) {
    return `${value}th`;
  }

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

export function formatBillDateLabel(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) {
    return formatBillDateLabel(new Date());
  }

  return `${ordinalDay(value.getDate())} ${MONTHS[value.getMonth()]} ${value.getFullYear()}`;
}

export function buildSplitName(dateLabel, promptName) {
  const date = String(dateLabel || formatBillDateLabel()).trim();
  const prompt = String(promptName || "").trim();
  if (!prompt) {
    return date;
  }
  return `${date}${BILL_NAME_SEPARATOR}${prompt}`;
}

const DATE_NAME_PATTERN =
  /^(\d{1,2}(?:st|nd|rd|th)\s+[A-Za-z]{3}\s+\d{4})(?:\s*[—\-–]\s*(.*))?$/i;

export function parseSplitName(splitName, fallbackDate = new Date()) {
  const raw = String(splitName || "").trim();
  const dateLabel = formatBillDateLabel(fallbackDate);

  if (!raw) {
    return { dateLabel, promptName: "" };
  }

  const match = raw.match(DATE_NAME_PATTERN);
  if (match) {
    return {
      dateLabel: match[1],
      promptName: String(match[2] || "").trim(),
    };
  }

  return { dateLabel, promptName: raw };
}
