import { useEffect, useState } from 'react';
import {
  Calendar,
  Check,
  CheckCircle2,
  HeartHandshake,
  LayoutDashboard,
  Link2,
  RotateCcw,
  Settings,
  Sun,
} from 'lucide-react';
import type {
  CharacterTheme,
  CounselingRequest,
  CounselingStatus,
  MorningGreeting,
  Student,
} from '../types/classroom';
import { formatKoreanDate } from '../utils/dateUtils';
import { loadDrafts, saveDrafts } from '../utils/storage';
import { CharacterAvatar } from './CharacterAvatar';
import { MorningGreetingCalendar } from './MorningGreetingCalendar';
import { ShareLinksCard } from './ShareLinksCard';
import { TeacherSettingsPanel } from './TeacherSettingsPanel';

interface TeacherCareOverviewProps {
  students: Student[];
  activeDate: string;
  morningGreetings: MorningGreeting[];
  counselingRequests: CounselingRequest[];
  onChangeActiveDate: (nextDate: string) => void;
  onAddStudent: (name: string, number: number, character: CharacterTheme) => void;
  onUpdateStudent: (
    studentId: string,
    name: string,
    number: number,
    character: CharacterTheme
  ) => void;
  onDeleteStudent: (studentId: string) => void;
  onCheckMorningGreeting: (greetingId: string, replyText: string) => void;
  onUpdateCounselingStatus: (requestId: string, status: CounselingStatus) => void;
  onRequestResetAll: () => void;
}

type TeacherTab = 'overview' | 'settings';
type CounselingFilter = 'all' | 'active' | 'completed';

export function TeacherCareOverview({
  students,
  activeDate,
  morningGreetings,
  counselingRequests,
  onChangeActiveDate,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onCheckMorningGreeting,
  onUpdateCounselingStatus,
  onRequestResetAll,
}: TeacherCareOverviewProps) {
  const initialDrafts = loadDrafts();
  const [activeTab, setActiveTab] = useState<TeacherTab>(initialDrafts.teacherTab);
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [greetingDateScope, setGreetingDateScope] = useState<'active' | 'all'>('active');
  const [counselingFilter, setCounselingFilter] = useState<CounselingFilter>('all');
  const [showShareLinks, setShowShareLinks] = useState<boolean>(true);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>(
    initialDrafts.teacherReplies
  );

  useEffect(() => {
    const current = loadDrafts();
    saveDrafts({
      ...current,
      teacherTab: activeTab,
      teacherReplies: replyDrafts,
    });
  }, [activeTab, replyDrafts]);

  const effectiveStudentFilter =
    studentFilter === 'all' || students.some((s) => s.id === studentFilter)
      ? studentFilter
      : 'all';

  const activeDateGreetings = morningGreetings.filter((g) => g.date === activeDate);
  const submittedOnActiveDateIds = new Set(activeDateGreetings.map((g) => g.studentId));
  const uncheckedActiveDateCount = activeDateGreetings.filter((g) => !g.teacherChecked).length;
  const pendingCounselingCount = counselingRequests.filter((c) => c.status !== 'completed').length;

  const baseGreetings =
    greetingDateScope === 'active' ? activeDateGreetings : morningGreetings;
  const filteredGreetings =
    effectiveStudentFilter === 'all'
      ? baseGreetings
      : baseGreetings.filter((item) => item.studentId === effectiveStudentFilter);

  const studentFilteredCounselings =
    effectiveStudentFilter === 'all'
      ? counselingRequests
      : counselingRequests.filter((item) => item.studentId === effectiveStudentFilter);

  const filteredCounselings =
    counselingFilter === 'all'
      ? studentFilteredCounselings
      : counselingFilter === 'active'
      ? studentFilteredCounselings.filter((c) => c.status !== 'completed')
      : studentFilteredCounselings.filter((c) => c.status === 'completed');

  const getStudentAvatar = (studentId: string) => {
    return students.find((s) => s.id === studentId)?.character ?? students[0]?.character;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Teacher Sub-Navigation & Active Date Strip */}
      <section
        aria-label="교사 관리 메뉴"
        className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div
          role="tablist"
          aria-label="교사 화면 탭"
          className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 self-start shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            className={`inline-flex items-center gap-1.5 min-h-10 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
            <span>아침인사 · 상담 현황</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            className={`inline-flex items-center gap-1.5 min-h-10 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
            <span>교사용 설정 (명단 · 날짜 · 완료)</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 tabular-nums">
            <Calendar className="w-4 h-4 text-[#0284C7]" aria-hidden="true" />
            <span>설정 날짜:</span>
            <strong className="text-[#0369A1]">{formatKoreanDate(activeDate)}</strong>
          </span>
          {activeTab === 'overview' && (
            <>
              <button
                type="button"
                onClick={() => setShowShareLinks((prev) => !prev)}
                aria-expanded={showShareLinks}
                className="inline-flex items-center gap-1.5 min-h-9 px-3 py-1.5 text-xs font-semibold text-[#4F46E5] bg-[#EEF2FF] hover:bg-[#E0E7FF] border border-[#C7D2FE] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{showShareLinks ? '접속 링크 접기' : '교사용·학생용 링크'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className="min-h-9 px-3 py-1.5 text-xs font-semibold text-[#0369A1] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                날짜 · 명단 설정
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onRequestResetAll}
            className="inline-flex items-center gap-1 min-h-9 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>전체 초기화</span>
          </button>
        </div>
      </section>

      {activeTab === 'overview' && showShareLinks && <ShareLinksCard />}

      {activeTab === 'settings' ? (
        <TeacherSettingsPanel
          students={students}
          activeDate={activeDate}
          counselingRequests={counselingRequests}
          onChangeActiveDate={onChangeActiveDate}
          onAddStudent={onAddStudent}
          onUpdateStudent={onUpdateStudent}
          onDeleteStudent={onDeleteStudent}
          onUpdateCounselingStatus={onUpdateCounselingStatus}
          onRequestResetAll={onRequestResetAll}
        />
      ) : (
        <>
          <section
            aria-labelledby="teacher-care-heading"
            className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 flex flex-col gap-6"
          >
            {/* Header & Student Filter */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h1
                  id="teacher-care-heading"
                  className="text-xl sm:text-2xl font-bold text-slate-900"
                >
                  교사용 아침인사 · 상담 신청 관리
                </h1>
                <p className="text-sm text-slate-600 mt-1 tabular-nums">
                  {formatKoreanDate(activeDate)} 아침인사 제출 {submittedOnActiveDateIds.size}/
                  {students.length}명 · 미확인 {uncheckedActiveDateCount}건 · 미완료 상담{' '}
                  {pendingCounselingCount}건
                </p>
              </div>

              <div
                role="group"
                aria-label="학생별 기록 필터"
                className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start lg:self-auto"
              >
                <button
                  type="button"
                  onClick={() => setStudentFilter('all')}
                  aria-pressed={effectiveStudentFilter === 'all'}
                  className={`min-h-10 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    effectiveStudentFilter === 'all'
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
                    onClick={() => setStudentFilter(student.id)}
                    aria-pressed={effectiveStudentFilter === student.id}
                    className={`min-h-10 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      effectiveStudentFilter === student.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {student.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Roster Morning Status Strip (for activeDate) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {students.map((student) => {
                const latestGreeting = activeDateGreetings.find(
                  (g) => g.studentId === student.id
                );
                const studentPendingCounseling = counselingRequests.filter(
                  (c) => c.studentId === student.id && c.status !== 'completed'
                ).length;
                const isFiltered = effectiveStudentFilter === student.id;

                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() =>
                      setStudentFilter((prev) => (prev === student.id ? 'all' : student.id))
                    }
                    aria-pressed={isFiltered}
                    className={`text-left rounded-2xl border p-4 flex items-center gap-3 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] ${
                      isFiltered
                        ? 'bg-[#F0F9FF] border-[#0284C7]'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <CharacterAvatar character={student.character} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {student.number}번 {student.name}
                        </p>
                        {studentPendingCounseling > 0 && (
                          <span className="text-xs font-semibold text-[#4F46E5] tabular-nums whitespace-nowrap">
                            상담 {studentPendingCounseling}건
                          </span>
                        )}
                      </div>
                      {latestGreeting ? (
                        <p className="text-xs text-slate-600 mt-0.5 truncate tabular-nums">
                          {latestGreeting.moodEmoji} {latestGreeting.moodLabel} ·{' '}
                          {latestGreeting.createdAt}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-0.5">아침인사 미제출</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Two-Column Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Column 1: Morning Greetings */}
              <div
                id="morning-greeting"
                className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
                      <Sun className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        학생별 아침인사 도착함 ({filteredGreetings.length}건)
                      </h2>
                      <p className="text-xs text-slate-600">
                        타학생에게는 비공개이며 교사만 전체 응답을 확인합니다.
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex p-0.5 rounded-lg bg-slate-200/70 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setGreetingDateScope('active')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        greetingDateScope === 'active'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      설정일만
                    </button>
                    <button
                      type="button"
                      onClick={() => setGreetingDateScope('all')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        greetingDateScope === 'all'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      전체 날짜
                    </button>
                  </div>
                </div>

                {filteredGreetings.length === 0 ? (
                  <div className="rounded-xl bg-white border border-dashed border-slate-300 p-6 text-center">
                    <p className="text-sm font-semibold text-slate-800">
                      {greetingDateScope === 'active'
                        ? `${formatKoreanDate(activeDate)}에 제출된 아침인사가 아직 없어요.`
                        : '아직 제출된 아침인사가 없어요.'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      학생용 보기 화면에서 학생이 아침인사를 제출하면 이곳에 바로 표시됩니다.
                    </p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {filteredGreetings.map((item) => {
                      const draft = replyDrafts[item.id] ?? '';
                      const avatar = getStudentAvatar(item.studentId);
                      return (
                        <li
                          key={item.id}
                          className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col gap-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              {avatar && <CharacterAvatar character={avatar} size="sm" />}
                              <div>
                                <p className="text-sm font-bold text-slate-900">
                                  {item.studentName}
                                  <span className="mx-1.5 text-slate-300" aria-hidden="true">
                                    ·
                                  </span>
                                  <span className="text-[#0369A1]">
                                    {item.moodEmoji} {item.moodLabel}
                                  </span>
                                </p>
                                <p className="text-xs text-slate-500 tabular-nums">
                                  {item.date} · {item.createdAt} 제출
                                </p>
                              </div>
                            </div>

                            {item.teacherChecked ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 whitespace-nowrap">
                                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                                <span>확인 완료</span>
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-amber-700 whitespace-nowrap">
                                미확인
                              </span>
                            )}
                          </div>

                          <div className="text-sm text-slate-800 space-y-1.5 bg-slate-50 rounded-xl p-3 border border-slate-200/80">
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

                          {!item.teacherChecked ? (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                              <input
                                type="text"
                                value={draft}
                                onChange={(e) =>
                                  setReplyDrafts((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                placeholder="짧은 답장 남기기 (선택)"
                                aria-label={`${item.studentName} 학생 아침인사 답장`}
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
                                className="inline-flex items-center justify-center gap-1.5 min-h-10 px-4 py-2 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                <Check className="w-4 h-4" aria-hidden="true" />
                                <span>확인 완료</span>
                              </button>
                            </div>
                          ) : (
                            item.teacherReply && (
                              <p className="text-xs text-[#0C4A6E] bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl px-3 py-2">
                                <strong>선생님 답장:</strong> {item.teacherReply}
                              </p>
                            )
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Column 2: Counseling Requests */}
              <div
                id="counseling-request"
                className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                      <HeartHandshake className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        선생님 상담 신청 현황 ({filteredCounselings.length}건)
                      </h2>
                      <p className="text-xs text-slate-600">
                        상담 완료된 건은 아래 버튼으로 완료 처리할 수 있어요.
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex p-0.5 rounded-lg bg-slate-200/70 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setCounselingFilter('all')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        counselingFilter === 'all'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      전체
                    </button>
                    <button
                      type="button"
                      onClick={() => setCounselingFilter('active')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        counselingFilter === 'active'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      미완료
                    </button>
                    <button
                      type="button"
                      onClick={() => setCounselingFilter('completed')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        counselingFilter === 'completed'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      완료됨
                    </button>
                  </div>
                </div>

                {filteredCounselings.length === 0 ? (
                  <div className="rounded-xl bg-white border border-dashed border-slate-300 p-6 text-center">
                    <p className="text-sm font-semibold text-slate-800">
                      해당하는 상담 신청 내역이 없어요.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      학생용 보기 화면에서 상담을 신청하면 이곳에서 확인하고 완료 처리할 수 있어요.
                    </p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {filteredCounselings.map((req) => {
                      const avatar = getStudentAvatar(req.studentId);
                      return (
                        <li
                          key={req.id}
                          className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col gap-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              {avatar && <CharacterAvatar character={avatar} size="sm" />}
                              <div>
                                <p className="text-sm font-bold text-slate-900">
                                  {req.studentName}
                                  <span className="mx-1.5 text-slate-300" aria-hidden="true">
                                    ·
                                  </span>
                                  <span className="text-[#4F46E5]">{req.topic}</span>
                                </p>
                                <p className="text-xs text-slate-500 tabular-nums">
                                  희망: {req.preferredTime} · {req.createdAt} 신청
                                  {req.status === 'completed' && req.completedAt
                                    ? ` · ${req.completedAt} 완료`
                                    : ''}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`text-xs font-bold whitespace-nowrap ${
                                req.status === 'completed'
                                  ? 'text-emerald-700'
                                  : req.status === 'confirmed'
                                  ? 'text-[#0284C7]'
                                  : 'text-amber-700'
                              }`}
                            >
                              {req.status === 'completed'
                                ? '상담 완료'
                                : req.status === 'confirmed'
                                ? '확인 완료'
                                : '대기 중'}
                            </span>
                          </div>

                          <p className="text-sm text-slate-800 bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                            {req.message}
                          </p>

                          {req.status !== 'completed' ? (
                            <div className="flex items-center gap-2 pt-1">
                              {req.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateCounselingStatus(req.id, 'confirmed')}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-10 px-3 py-2 text-xs font-semibold text-[#0369A1] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                                >
                                  <Check className="w-4 h-4" aria-hidden="true" />
                                  <span>확인 완료</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onUpdateCounselingStatus(req.id, 'completed')}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-10 px-3 py-2 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                                <span>상담 완료 처리</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end pt-0.5">
                              <button
                                type="button"
                                onClick={() => onUpdateCounselingStatus(req.id, 'confirmed')}
                                className="inline-flex items-center gap-1 min-h-9 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>완료 취소</span>
                              </button>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </section>

          {/* Teacher Monthly Morning Greeting Calendar */}
          <MorningGreetingCalendar
            mode="teacher"
            activeDate={activeDate}
            greetings={morningGreetings}
            students={students}
            onCheckMorningGreeting={onCheckMorningGreeting}
          />
        </>
      )}
    </div>
  );
}
