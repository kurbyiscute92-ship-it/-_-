import { useEffect, useState } from 'react';
import { CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MorningGreeting, Student } from '../types/classroom';
import { buildMonthGrid, formatKoreanDate, formatMonthTitle } from '../utils/dateUtils';
import { CharacterAvatar } from './CharacterAvatar';

interface MorningGreetingCalendarProps {
  mode: 'student' | 'teacher';
  activeDate: string;
  greetings: MorningGreeting[];
  students?: Student[];
  selectedStudentName?: string;
  onCheckMorningGreeting?: (greetingId: string, replyText: string) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function parseYearMonth(isoDate: string): { year: number; monthIdx: number } {
  const [y, m] = isoDate.split('-').map(Number);
  if (!y || !m) {
    const now = new Date();
    return { year: now.getFullYear(), monthIdx: now.getMonth() };
  }
  return { year: y, monthIdx: m - 1 };
}

export function MorningGreetingCalendar({
  mode,
  activeDate,
  greetings,
  students = [],
  selectedStudentName,
  onCheckMorningGreeting,
}: MorningGreetingCalendarProps) {
  const initialYm = parseYearMonth(activeDate);
  const [viewYear, setViewYear] = useState<number>(initialYm.year);
  const [viewMonthIdx, setViewMonthIdx] = useState<number>(initialYm.monthIdx);
  const [selectedDate, setSelectedDate] = useState<string>(activeDate);
  const [teacherStudentFilter, setTeacherStudentFilter] = useState<string>('all');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setSelectedDate(activeDate);
    const nextYm = parseYearMonth(activeDate);
    setViewYear(nextYm.year);
    setViewMonthIdx(nextYm.monthIdx);
  }, [activeDate]);

  const visibleGreetings =
    mode === 'teacher' && teacherStudentFilter !== 'all'
      ? greetings.filter((g) => g.studentId === teacherStudentFilter)
      : greetings;

  const greetingsByDate = new Map<string, MorningGreeting[]>();
  for (const item of visibleGreetings) {
    const list = greetingsByDate.get(item.date) ?? [];
    list.push(item);
    greetingsByDate.set(item.date, list);
  }

  const cells = buildMonthGrid(viewYear, viewMonthIdx);
  const selectedDayGreetings = greetingsByDate.get(selectedDate) ?? [];

  const handlePrevMonth = () => {
    const prev = new Date(viewYear, viewMonthIdx - 1, 1);
    setViewYear(prev.getFullYear());
    setViewMonthIdx(prev.getMonth());
  };

  const handleNextMonth = () => {
    const next = new Date(viewYear, viewMonthIdx + 1, 1);
    setViewYear(next.getFullYear());
    setViewMonthIdx(next.getMonth());
  };

  const handleJumpToActiveDate = () => {
    const target = parseYearMonth(activeDate);
    setViewYear(target.year);
    setViewMonthIdx(target.monthIdx);
    setSelectedDate(activeDate);
  };

  const getStudentAvatar = (studentId: string) => {
    return students.find((s) => s.id === studentId)?.character;
  };

  // In teacher mode when viewing all students on a specific date, calculate who did not submit yet
  const submittedStudentIdsOnSelectedDate = new Set(
    selectedDayGreetings.map((g) => g.studentId)
  );
  const missingStudentsOnSelectedDate =
    mode === 'teacher' && teacherStudentFilter === 'all'
      ? students.filter((s) => !submittedStudentIdsOnSelectedDate.has(s.id))
      : [];

  return (
    <section
      id="greeting-calendar"
      aria-labelledby="greeting-calendar-heading"
      className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] shrink-0">
            <CalendarDays className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2
              id="greeting-calendar-heading"
              className="text-xl font-bold text-slate-900"
            >
              {mode === 'student'
                ? `${selectedStudentName ?? '내'}의 아침인사 달력`
                : '날짜별 학생 아침인사 달력'}
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              {mode === 'student'
                ? '날짜별로 내가 선택한 기분 이모티콘과 작성한 기록만 달력에서 모아 볼 수 있어요.'
                : '달력에서 날짜를 누르면 그날 제출된 모든 학생의 기분 이모티콘과 기록을 확인할 수 있어요.'}
            </p>
          </div>
        </div>

        {/* Teacher-only student filter */}
        {mode === 'teacher' && students.length > 0 && (
          <div
            role="group"
            aria-label="달력 학생별 보기"
            className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start lg:self-auto"
          >
            <button
              type="button"
              onClick={() => setTeacherStudentFilter('all')}
              aria-pressed={teacherStudentFilter === 'all'}
              className={`min-h-10 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                teacherStudentFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체 학생
            </button>
            {students.map((student) => (
              <button
                key={student.id}
                type="button"
                onClick={() => setTeacherStudentFilter(student.id)}
                aria-pressed={teacherStudentFilter === student.id}
                className={`min-h-10 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  teacherStudentFilter === student.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {student.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Split: Monthly Calendar Grid + Selected Date Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Month Controls */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="이전 달"
                className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 px-2 tabular-nums">
                {formatMonthTitle(viewYear, viewMonthIdx)}
              </h3>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="다음 달"
                className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleJumpToActiveDate}
              className="min-h-10 px-3.5 py-1.5 text-xs font-semibold text-[#0369A1] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              설정 날짜로 이동
            </button>
          </div>

          {/* Weekday Header */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {WEEKDAYS.map((dayName, idx) => (
              <div
                key={dayName}
                className={`py-2 text-xs font-semibold ${
                  idx === 0
                    ? 'text-rose-600'
                    : idx === 6
                    ? 'text-[#0284C7]'
                    : 'text-slate-500'
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((cell) => {
              const dayGreetings = greetingsByDate.get(cell.isoDate) ?? [];
              const isSelected = selectedDate === cell.isoDate;
              const isActiveDate = activeDate === cell.isoDate;

              return (
                <button
                  key={cell.isoDate}
                  type="button"
                  onClick={() => setSelectedDate(cell.isoDate)}
                  aria-label={`${formatKoreanDate(cell.isoDate)} 아침인사 ${dayGreetings.length}건`}
                  aria-pressed={isSelected}
                  className={`min-h-[72px] sm:min-h-[82px] rounded-2xl border p-1.5 sm:p-2 flex flex-col items-start justify-between text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] ${
                    isSelected
                      ? 'bg-[#F0F9FF] border-[#0284C7] ring-1 ring-[#0284C7]'
                      : isActiveDate
                      ? 'bg-slate-50 border-slate-400'
                      : cell.inCurrentMonth
                      ? 'bg-white border-slate-200 hover:bg-slate-50'
                      : 'bg-slate-50/50 border-slate-100 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-full flex items-center justify-between gap-1">
                    <span
                      className={`text-xs font-bold tabular-nums ${
                        !cell.inCurrentMonth
                          ? 'text-slate-400'
                          : isSelected || isActiveDate
                          ? 'text-[#0369A1]'
                          : 'text-slate-700'
                      }`}
                    >
                      {cell.day}
                    </span>
                    {isActiveDate && (
                      <span className="text-[10px] font-semibold text-[#0284C7] whitespace-nowrap">
                        설정일
                      </span>
                    )}
                  </div>

                  {dayGreetings.length > 0 ? (
                    mode === 'student' ? (
                      <div className="w-full flex flex-col items-center justify-center pt-0.5">
                        <span
                          className="text-xl sm:text-2xl leading-none"
                          title={dayGreetings[0].moodLabel}
                        >
                          {dayGreetings[0].moodEmoji}
                        </span>
                        {dayGreetings.length > 1 && (
                          <span className="text-[10px] font-semibold text-slate-500 mt-0.5 tabular-nums">
                            {dayGreetings.length}건
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-full flex flex-col gap-0.5">
                        <div className="flex flex-wrap items-center gap-0.5 leading-none">
                          {dayGreetings.slice(0, 4).map((g) => (
                            <span
                              key={g.id}
                              className="text-sm sm:text-base"
                              title={`${g.studentName}: ${g.moodLabel}`}
                            >
                              {g.moodEmoji}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 tabular-nums">
                          {dayGreetings.length}건
                        </span>
                      </div>
                    )
                  ) : (
                    <span className="text-[10px] text-slate-300 self-center pb-1" aria-hidden="true">
                      —
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail Panel */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <p className="text-xs font-semibold text-[#0284C7]">
                {selectedDate === activeDate ? '설정된 아침인사 날짜' : '선택한 날짜'}
              </p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 tabular-nums">
                {formatKoreanDate(selectedDate)}
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-600 tabular-nums whitespace-nowrap pt-1">
              기록 {selectedDayGreetings.length}건
            </span>
          </div>

          {mode === 'teacher' && missingStudentsOnSelectedDate.length > 0 && (
            <p className="text-xs text-slate-500">
              미제출 학생:{' '}
              <span className="font-medium text-slate-700">
                {missingStudentsOnSelectedDate.map((s) => s.name).join(', ')}
              </span>
            </p>
          )}

          {selectedDayGreetings.length === 0 ? (
            <div className="rounded-xl bg-white border border-dashed border-slate-300 p-6 text-center">
              <p className="text-sm font-semibold text-slate-700">
                이 날짜에는 아직 아침인사 기록이 없어요.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'student'
                  ? selectedDate === activeDate
                    ? '위 아침인사 카드에서 오늘의 기분을 남기면 달력에 이모티콘이 기록됩니다.'
                    : '다른 날짜를 선택해 지난 아침인사 기록을 확인해 보세요.'
                  : '학생이 해당 날짜로 아침인사를 제출하면 이곳에 표시됩니다.'}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-0.5">
              {selectedDayGreetings.map((item) => {
                const avatar = getStudentAvatar(item.studentId);
                const draft = replyDrafts[item.id] ?? '';
                return (
                  <li
                    key={item.id}
                    className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {mode === 'teacher' && avatar && (
                          <CharacterAvatar character={avatar} size="xs" />
                        )}
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {mode === 'teacher' ? `${item.studentName} · ` : ''}
                          {item.moodEmoji} {item.moodLabel}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
                        {item.createdAt}
                      </span>
                    </div>

                    <div className="text-sm text-slate-800 space-y-1 bg-slate-50 rounded-xl p-3 border border-slate-200/70">
                      <p>
                        <strong className="text-slate-900">기분 이유:</strong> {item.reason}
                      </p>
                      {item.messageToTeacher && (
                        <p>
                          <strong className="text-[#0369A1]">선생님께 한마디:</strong>{' '}
                          {item.messageToTeacher}
                        </p>
                      )}
                    </div>

                    {item.teacherChecked ? (
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>선생님 확인 완료</span>
                        </span>
                        {item.teacherReply && (
                          <p className="text-xs text-[#0C4A6E] bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl px-3 py-2">
                            <strong>선생님 답장:</strong> {item.teacherReply}
                          </p>
                        )}
                      </div>
                    ) : mode === 'teacher' && onCheckMorningGreeting ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
                        <input
                          type="text"
                          value={draft}
                          onChange={(e) =>
                            setReplyDrafts((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          placeholder="답장 남기기 (선택)"
                          aria-label={`${item.studentName} 학생 달력 기록 답장`}
                          className="flex-1 min-h-10 rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onCheckMorningGreeting(item.id, draft.trim());
                            setReplyDrafts((prev) => {
                              const next = { ...prev };
                              delete next[item.id];
                              return next;
                            });
                          }}
                          className="inline-flex items-center justify-center gap-1 min-h-10 px-3.5 py-2 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>확인 완료</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-amber-700">
                        선생님 확인 대기 중
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
