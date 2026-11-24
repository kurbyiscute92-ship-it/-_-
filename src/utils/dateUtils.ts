export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const WEEKDAY_NAMES_KO = ['일', '월', '화', '수', '목', '금', '토'];

export function formatKoreanDate(isoDate: string): string {
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return isoDate;
  const [year, month, day] = parts;
  const dateObj = new Date(year, month - 1, day);
  const weekday = WEEKDAY_NAMES_KO[dateObj.getDay()] ?? '';
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

export function formatMonthTitle(year: number, monthIndexZeroBased: number): string {
  return `${year}년 ${monthIndexZeroBased + 1}월`;
}

export function toIsoDate(year: number, monthIndexZeroBased: number, day: number): string {
  const m = String(monthIndexZeroBased + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export interface CalendarCell {
  isoDate: string;
  day: number;
  inCurrentMonth: boolean;
}

export function buildMonthGrid(year: number, monthIndexZeroBased: number): CalendarCell[] {
  const firstDayOfMonth = new Date(year, monthIndexZeroBased, 1);
  const startWeekday = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(year, monthIndexZeroBased + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndexZeroBased, 0).getDate();

  const cells: CalendarCell[] = [];

  // Leading days from previous month
  const prevMonthDate = new Date(year, monthIndexZeroBased - 1, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonthIdx = prevMonthDate.getMonth();
  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({
      isoDate: toIsoDate(prevYear, prevMonthIdx, day),
      day,
      inCurrentMonth: false,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      isoDate: toIsoDate(year, monthIndexZeroBased, day),
      day,
      inCurrentMonth: true,
    });
  }

  // Trailing days to complete 6 rows or 5 rows cleanly
  const totalCells = cells.length <= 35 ? 35 : 42;
  const nextMonthDate = new Date(year, monthIndexZeroBased + 1, 1);
  const nextYear = nextMonthDate.getFullYear();
  const nextMonthIdx = nextMonthDate.getMonth();
  let nextDay = 1;
  while (cells.length < totalCells) {
    cells.push({
      isoDate: toIsoDate(nextYear, nextMonthIdx, nextDay),
      day: nextDay,
      inCurrentMonth: false,
    });
    nextDay++;
  }

  return cells;
}
