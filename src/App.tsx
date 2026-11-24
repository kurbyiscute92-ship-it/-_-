import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Eye,
  GraduationCap,
  Info,
  Lock,
  X,
} from 'lucide-react';
import { CharacterAvatar } from './components/CharacterAvatar';
import { HeaderBar } from './components/HeaderBar';
import { MorningGreetingCalendar } from './components/MorningGreetingCalendar';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { StudentMorningAndCounseling } from './components/StudentMorningAndCounseling';
import { TeacherCareOverview } from './components/TeacherCareOverview';
import type {
  CharacterTheme,
  CounselingRequest,
  CounselingStatus,
  CounselingTopic,
  FeedbackNotice,
  MoodOption,
  MorningGreeting,
  Student,
  ViewMode,
} from './types/classroom';
import { formatKoreanDate } from './utils/dateUtils';
import {
  clearAllStoredData,
  getDefaultAppState,
  loadAppState,
  saveAppState,
} from './utils/storage';

function formatTimeNow(): string {
  return new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function App() {
  const [initialState] = useState(loadAppState);

  const [students, setStudents] = useState<Student[]>(initialState.students);
  const [activeDate, setActiveDate] = useState<string>(initialState.activeDate);
  const [morningGreetings, setMorningGreetings] = useState<MorningGreeting[]>(
    initialState.morningGreetings
  );
  const [counselingRequests, setCounselingRequests] = useState<CounselingRequest[]>(
    initialState.counselingRequests
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialState.selectedStudentId
  );
  const [viewMode, setViewMode] = useState<ViewMode>(initialState.viewMode);
  const [notice, setNotice] = useState<FeedbackNotice | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [resetVersion, setResetVersion] = useState<number>(0);

  // Persist all user-entered & configured classroom state to localStorage
  useEffect(() => {
    saveAppState({
      students,
      activeDate,
      morningGreetings,
      counselingRequests,
      selectedStudentId,
      viewMode,
    });
  }, [students, activeDate, morningGreetings, counselingRequests, selectedStudentId, viewMode]);

  const selectedStudent =
    students.find((student) => student.id === selectedStudentId) ?? students[0];

  const showNotice = (type: FeedbackNotice['type'], message: string) => {
    setNotice({ id: Date.now(), type, message });
  };

  // Teacher Setting 1: Student Roster Management (Add / Update / Delete)
  const handleAddStudent = (name: string, number: number, character: CharacterTheme) => {
    const newStudent: Student = {
      id: `student-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      number,
      character,
      balance: 0,
      coupons: [],
    };

    setStudents((prev) => [...prev, newStudent].sort((a, b) => a.number - b.number));
    showNotice('success', `${number}번 ${name} 학생을 우리 반 명단에 추가했어요.`);
  };

  const handleUpdateStudent = (
    studentId: string,
    name: string,
    number: number,
    character: CharacterTheme
  ) => {
    setStudents((prev) =>
      prev
        .map((s) => (s.id === studentId ? { ...s, name, number, character } : s))
        .sort((a, b) => a.number - b.number)
    );
    setMorningGreetings((prev) =>
      prev.map((g) => (g.studentId === studentId ? { ...g, studentName: name } : g))
    );
    setCounselingRequests((prev) =>
      prev.map((c) => (c.studentId === studentId ? { ...c, studentName: name } : c))
    );
    showNotice('success', `학생 정보를 '${number}번 ${name}'(으)로 수정했어요.`);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (students.length <= 1) {
      showNotice('warning', '최소 1명의 학생은 명단에 남아 있어야 해요.');
      return;
    }

    const target = students.find((s) => s.id === studentId);
    const remaining = students.filter((s) => s.id !== studentId);

    setStudents(remaining);
    setMorningGreetings((prev) => prev.filter((g) => g.studentId !== studentId));
    setCounselingRequests((prev) => prev.filter((c) => c.studentId !== studentId));

    if (selectedStudentId === studentId && remaining[0]) {
      setSelectedStudentId(remaining[0].id);
    }

    if (target) {
      showNotice('info', `${target.number}번 ${target.name} 학생을 명단에서 삭제했어요.`);
    }
  };

  // Teacher Setting 3: Active Morning Greeting Date
  const handleChangeActiveDate = (nextDate: string) => {
    setActiveDate(nextDate);
    showNotice(
      'success',
      `아침인사 날짜를 ${formatKoreanDate(nextDate)}로 설정했어요. 학생 화면에도 반영됩니다.`
    );
  };

  // Student Action: Submit Morning Greeting on activeDate
  const handleSubmitMorningGreeting = (
    studentId: string,
    mood: MoodOption,
    reason: string,
    messageToTeacher: string
  ) => {
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) return;

    const newGreeting: MorningGreeting = {
      id: `greeting-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      date: activeDate,
      moodId: mood.id,
      moodEmoji: mood.emoji,
      moodLabel: mood.label,
      reason,
      messageToTeacher,
      createdAt: formatTimeNow(),
      teacherChecked: false,
    };

    setMorningGreetings((prev) => [newGreeting, ...prev]);
    showNotice(
      'success',
      `${targetStudent.name} 학생의 ${formatKoreanDate(activeDate)} 아침인사(${mood.emoji} ${mood.label})가 선생님께 전달되었어요.`
    );
  };

  const handleCheckMorningGreeting = (greetingId: string, replyText: string) => {
    if (viewMode !== 'teacher') return;

    const targetGreeting = morningGreetings.find((g) => g.id === greetingId);
    if (!targetGreeting || targetGreeting.teacherChecked) return;

    setMorningGreetings((prev) =>
      prev.map((g) =>
        g.id === greetingId
          ? {
              ...g,
              teacherChecked: true,
              teacherReply: replyText || undefined,
            }
          : g
      )
    );

    showNotice(
      'success',
      replyText
        ? `${targetGreeting.studentName} 학생의 아침인사를 확인하고 따뜻한 답장을 남겼어요.`
        : `${targetGreeting.studentName} 학생의 아침인사를 확인 완료했어요.`
    );
  };

  const handleSubmitCounseling = (
    studentId: string,
    topic: CounselingTopic,
    preferredTime: string,
    message: string
  ) => {
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) return;

    const newReq: CounselingRequest = {
      id: `counseling-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      topic,
      preferredTime,
      message,
      createdAt: formatTimeNow(),
      status: 'pending',
    };

    setCounselingRequests((prev) => [newReq, ...prev]);
    showNotice(
      'success',
      `${targetStudent.name} 학생의 상담 신청이 선생님께 안전하게 전달되었어요. (다른 친구는 볼 수 없어요)`
    );
  };

  // Teacher Setting 2: Update Counseling Status (including completion & undo)
  const handleUpdateCounselingStatus = (requestId: string, status: CounselingStatus) => {
    if (viewMode !== 'teacher') return;
    const targetReq = counselingRequests.find((c) => c.id === requestId);
    if (!targetReq) return;

    const completedAt = status === 'completed' ? formatTimeNow() : undefined;

    setCounselingRequests((prev) =>
      prev.map((c) => (c.id === requestId ? { ...c, status, completedAt } : c))
    );

    showNotice(
      status === 'completed' ? 'success' : 'info',
      `${targetReq.studentName} 학생의 상담 신청을 '${
        status === 'completed' ? '상담 완료' : '확인 완료'
      }' 상태로 변경했어요.`
    );
  };

  const handleConfirmResetAll = () => {
    clearAllStoredData();
    const defaults = getDefaultAppState();
    setStudents(defaults.students);
    setActiveDate(defaults.activeDate);
    setMorningGreetings(defaults.morningGreetings);
    setCounselingRequests(defaults.counselingRequests);
    setSelectedStudentId(defaults.selectedStudentId);
    setResetVersion((v) => v + 1);
    setIsResetModalOpen(false);

    showNotice(
      'info',
      '저장된 모든 데이터를 초기화하고 기본 가상 학생 4명과 초기 상태로 되돌렸어요.'
    );
  };

  const submittedOnActiveDateCount = new Set(
    morningGreetings.filter((g) => g.date === activeDate).map((g) => g.studentId)
  ).size;
  const pendingCounselingCount = counselingRequests.filter(
    (c) => c.status !== 'completed'
  ).length;

  // Strict privacy slice for Student View: ONLY selected student's greetings & counseling requests
  const selectedStudentGreetings = morningGreetings.filter(
    (g) => g.studentId === selectedStudent.id
  );
  const selectedStudentCounselings = counselingRequests.filter(
    (c) => c.studentId === selectedStudent.id
  );

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <HeaderBar onResetDemo={() => setIsResetModalOpen(true)} />

      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onConfirm={handleConfirmResetAll}
        onCancel={() => setIsResetModalOpen(false)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
        {/* Workspace Mode Toolbar */}
        <section
          aria-label="화면 모드 전환"
          className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div
              role="group"
              aria-label="화면 보기 전환"
              className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 self-start shrink-0"
            >
              <button
                type="button"
                onClick={() => {
                  setViewMode('student');
                  setNotice(null);
                }}
                aria-pressed={viewMode === 'student'}
                className={`inline-flex items-center gap-1.5 min-h-10 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] ${
                  viewMode === 'student'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-4 h-4" aria-hidden="true" />
                <span>학생용 보기 화면</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode('teacher');
                  setNotice(null);
                }}
                aria-pressed={viewMode === 'teacher'}
                className={`inline-flex items-center gap-1.5 min-h-10 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] ${
                  viewMode === 'teacher'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" aria-hidden="true" />
                <span>교사용 관리 화면</span>
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-snug">
              {viewMode === 'teacher'
                ? '학생 명단과 아침인사 날짜를 설정하고, 전체 학생의 아침인사·상담 내역을 관리해요.'
                : '선생님이 설정한 날짜에 맞춰 아침인사와 상담 신청을 작성하고 내 달력 기록을 확인해요.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 shrink-0">
            {viewMode === 'teacher' ? (
              <>
                <span className="tabular-nums">
                  아침인사{' '}
                  <strong className="text-[#0284C7]">
                    {submittedOnActiveDateCount}/{students.length}
                  </strong>
                  명
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  미완료 상담 <strong className="text-[#4F46E5]">{pendingCounselingCount}</strong>건
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Calendar className="w-4 h-4 text-[#0284C7]" aria-hidden="true" />
                  <strong className="text-slate-800">{formatKoreanDate(activeDate)}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  내 화면 · <strong className="text-[#0284C7]">{selectedStudent.name}</strong>
                </span>
              </>
            )}
          </div>
        </section>

        {/* Inline Action Feedback Notice */}
        {notice && (
          <div
            role="status"
            aria-live="polite"
            className={`rounded-2xl border px-4 py-3.5 flex items-center justify-between gap-3 ${
              notice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : notice.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0C4A6E]'
            }`}
          >
            <div className="flex items-center gap-2.5 text-sm font-medium">
              {notice.type === 'success' && (
                <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
              )}
              {notice.type === 'warning' && (
                <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
              )}
              {notice.type === 'info' && <Info className="w-5 h-5 shrink-0" aria-hidden="true" />}
              <span>{notice.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="안내 닫기"
              className="p-1.5 rounded-lg hover:bg-black/5 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Private Student Switcher (Student View only; names & avatars only, zero peer data) */}
        {viewMode === 'student' && (
          <section
            aria-label="내 이름 선택하기"
            className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-2.5 text-sm text-slate-600">
              <Lock className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
              <span>
                <strong className="text-slate-900">내 이름 선택:</strong> 다른 친구의 응답은 볼 수 없고 오직 선생님만 확인할 수 있어요.
              </span>
            </div>

            <div
              role="group"
              aria-label="내 이름 선택 버튼"
              className="flex flex-wrap items-center gap-2"
            >
              {students.map((student) => {
                const isActive = student.id === selectedStudent.id;
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(student.id);
                      setNotice(null);
                    }}
                    aria-pressed={isActive}
                    className={`inline-flex items-center gap-2 min-h-11 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CharacterAvatar character={student.character} size="xs" />
                    <span>
                      {student.number}번 {student.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Main Workspace */}
        {viewMode === 'student' ? (
          <>
            <StudentMorningAndCounseling
              key={`${selectedStudent.id}-${resetVersion}`}
              student={selectedStudent}
              activeDate={activeDate}
              morningGreetings={selectedStudentGreetings}
              counselingRequests={selectedStudentCounselings}
              onSubmitMorningGreeting={handleSubmitMorningGreeting}
              onSubmitCounseling={handleSubmitCounseling}
            />

            <MorningGreetingCalendar
              key={`student-cal-${resetVersion}`}
              mode="student"
              activeDate={activeDate}
              greetings={selectedStudentGreetings}
              selectedStudentName={selectedStudent.name}
            />
          </>
        ) : (
          <TeacherCareOverview
            key={`teacher-${resetVersion}`}
            students={students}
            activeDate={activeDate}
            morningGreetings={morningGreetings}
            counselingRequests={counselingRequests}
            onChangeActiveDate={handleChangeActiveDate}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onCheckMorningGreeting={handleCheckMorningGreeting}
            onUpdateCounselingStatus={handleUpdateCounselingStatus}
          />
        )}
      </main>
    </div>
  );
}
