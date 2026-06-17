const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;
const MONTHS_RU = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
] as const;

const MINUTES_IN_DAY = 24 * 60;
const MINUTES_IN_YEAR = 365 * MINUTES_IN_DAY;

export type LifeYearDate = {
  share: number;
  monthIndex: number;
  monthNameRu: string;
  day: number;
  hour: number;
  minute: number;
  time: string;
  labelRu: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function mapAgeToLifeYear(ageMa: number, originMa = 4000): LifeYearDate {
  const share = clamp((originMa - ageMa) / originMa, 0, 1);
  const minuteOfYear = clamp(Math.floor(share * (MINUTES_IN_YEAR - 1)), 0, MINUTES_IN_YEAR - 1);
  let dayOfYear = Math.floor(minuteOfYear / MINUTES_IN_DAY);
  const minuteOfDay = minuteOfYear % MINUTES_IN_DAY;
  let monthIndex = 0;

  while (dayOfYear >= DAYS_IN_MONTH[monthIndex] && monthIndex < DAYS_IN_MONTH.length - 1) {
    dayOfYear -= DAYS_IN_MONTH[monthIndex];
    monthIndex += 1;
  }

  const day = dayOfYear + 1;
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const monthNameRu = MONTHS_RU[monthIndex];

  return {
    share,
    monthIndex,
    monthNameRu,
    day,
    hour,
    minute,
    time,
    labelRu: `${day} ${monthNameRu}, ${time}`,
  };
}
