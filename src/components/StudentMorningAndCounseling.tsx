import { useEffect, useState, type FormEvent } from 'react';
import { Calendar, CheckCircle2, HeartHandshake, Lock, MessageCircleHeart, Sun } from 'lucide-react';
import { MOOD_OPTIONS } from '../data/classroomData';
import type {
  CounselingRequest,
  CounselingTopic,
  MoodId,
  MoodOption,
  MorningGreeting,
  Student,
} from '../types/classroom';
import { formatKoreanDate } from '../utils/dateUtils';
import { loadDrafts, saveDrafts, type StudentFormDraft } from '../utils/storage';
import { CharacterAvatar } from './CharacterAvatar';

interface StudentMorningAndCounselingProps {
  student: Student;
  activeDate: string;
  morningGreetings: MorningGreeting[];
  counselingRequests: CounselingRequest[];
  onSubmitMorningGreeting: (
    studentId: string,
    mood: MoodOption,
    reason: string,
    messageToTeacher: string
  ) => void;
  onSubmitCounseling: (
    studentId: string,
    topic: CounselingTopic,
    preferredTime: string,
    message: string
  ) => void;
}

const TOPICS: CounselingTopic[] = ['친구 고민', '공부·숙제', '마음 이야기', '기타'];
const PREFERRED_TIMES = ['쉬는시간', '점심시간', '방과 후', '언제든 좋아요'];

const DEFAULT_STUDENT_DRAFT: StudentFormDraft = {
  selectedMoodId: null,
  moodReason: '',
  messageToTeacher: '',
  topic: '마음 이야기',
  preferredTime: '쉬는시간',
  counselingMessage: '',
};

export function StudentMorningAndCounseling({
  student,
  activeDate,
  morningGreetings,
  counselingRequests,
  onSubmitMorningGreeting,
  onSubmitCounseling,
}: StudentMorningAndCounselingProps) {
  const initialDraft = loadDrafts().studentForms[student.id] ?? DEFAULT_STUDENT_DRAFT;

  const [selectedMoodId, setSelectedMoodId] = useState<MoodId | null>(initialDraft.selectedMoodId);
  const [moodReason, setMoodReason] = useState(initialDraft.moodReason);
  const [messageToTeacher, setMessageToTeacher] = useState(initialDraft.messageToTeacher);
  const [greetingError, setGreetingError] = useState('');

  const [topic, setTopic] = useState<CounselingTopic>(initialDraft.topic);
  const [preferredTime, setPreferredTime] = useState<string>(initialDraft.preferredTime);
  const [counselingMessage, setCounselingMessage] = useState(initialDraft.counselingMessage);
  const [counselingError, setCounselingError] = useState('');

  useEffect(() => {
    const current = loadDrafts();
    saveDrafts({
      ...current,
      studentForms: {
        ...current.studentForms,
        [student.id]: {
          selectedMoodId,
          moodReason,
          messageToTeacher,
          topic,
          preferredTime,
          counselingMessage,
        },
      },
    });
  }, [
    student.id,
    selectedMoodId,
    moodReason,
    messageToTeacher,
    topic,
    preferredTime,
    counselingMessage,
  ]);

  // Privacy guard: only show entries owned by the currently selected student
  const myGreetings = morningGreetings.filter((item) => item.studentId === student.id);
  const myGreetingsOnActiveDate = myGreetings.filter((item) => item.date === activeDate);
  const myCounselings = counselingRequests.filter((item) => item.studentId === student.id);

  const handleMorningGreetingSubmit = (e: FormEvent) => {
    e.preventDefault();
    const chosenMood = MOOD_OPTIONS.find((m) => m.id === selectedMoodId);
    if (!chosenMood) {
      setGreetingError('오늘의 기분 이모티콘을 먼저 선택해 주세요.');
      return;
    }

    const trimmedReason = moodReason.trim();
    if (!trimmedReason) {
      setGreetingError('기분이 든 간단한 이유를 적어 주세요.');
      return;
    }

    setGreetingError('');
    onSubmitMorningGreeting(
      student.id,
      chosenMood,
      trimmedReason,
      messageToTeacher.trim()
    );
    setSelectedMoodId(null);
    setMoodReason('');
    setMessageToTeacher('');
  };

  const handleCounselingSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedMsg = counselingMessage.trim();
    if (!trimmedMsg) {
      setCounselingError('선생님께 전하고 싶은 이야기를 간단히 적어 주세요.');
      return;
    }

    setCounselingError('');
    onSubmitCounseling(student.id, topic, preferredTime, trimmedMsg);
    setCounselingMessage('');
  };

  return (
    <section
      aria-label="학생 아침인사 및 선생님 상담 신청"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
    >
      {/* Left: Morning Greeting */}
      <div
        id="morning-greeting"
        className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 flex flex-col gap-5"
      >
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] shrink-0">
              <Sun className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {student.name}의 아침인사
              </h1>
              <p className="text-sm text-slate-600">
                오늘의 기분과 선생님께 전하고 싶은 한마디를 적어 보세요.
              </p>
            </div>
          </div>
          <CharacterAvatar character={student.character} size="sm" />
        </div>

        {/* Configured Morning Date Banner + Privacy Banner */}
        <div className="flex flex-col gap-2">
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 flex items-center justify-between gap-2 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold text-slate-800">
              <Calendar className="w-4 h-4 text-[#0284C7] shrink-0" aria-hidden="true" />
              <span>아침인사 날짜</span>
            </span>
            <span className="font-bold text-[#0369A1] tabular-nums">
              {formatKoreanDate(activeDate)}
            </span>
          </div>

          <div className="rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] px-4 py-3 flex items-center gap-2.5 text-sm text-[#0C4A6E]">
            <Lock className="w-4 h-4 shrink-0 text-[#0284C7]" aria-hidden="true" />
            <span>내가 쓴 아침인사는 선생님만 볼 수 있고, 다른 친구에게는 보이지 않아요.</span>
          </div>
        </div>

        <form onSubmit={handleMorningGreetingSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-900">
              1. 오늘의 기분을 이모티콘으로 선택해요
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MOOD_OPTIONS.map((mood) => {
                const isActive = selectedMoodId === mood.id;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => {
                      setSelectedMoodId(mood.id);
                      if (greetingError) setGreetingError('');
                    }}
                    aria-pressed={isActive}
                    className={`min-h-14 px-3 py-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] ${
                      isActive
                        ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0C4A6E] font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span className="text-2xl leading-none" aria-hidden="true">
                      {mood.emoji}
                    </span>
                    <span className="text-xs whitespace-nowrap">{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="mood-reason-input" className="text-sm font-bold text-slate-900">
              2. 왜 이런 기분이 들었나요? (간단한 이유)
            </label>
            <textarea
              id="mood-reason-input"
              rows={2}
              value={moodReason}
              onChange={(e) => {
                setMoodReason(e.target.value);
                if (greetingError) setGreetingError('');
              }}
              placeholder="예: 어제 푹 자서 개운해요 / 오늘 체육 시간이 기대돼요 / 아침에 조금 졸려요"
              className="w-full rounded-xl bg-white border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="teacher-word-input" className="text-sm font-bold text-slate-900">
              3. 선생님에게 하고 싶은 한마디
            </label>
            <textarea
              id="teacher-word-input"
              rows={2}
              value={messageToTeacher}
              onChange={(e) => setMessageToTeacher(e.target.value)}
              placeholder="예: 선생님 오늘도 좋은 하루 보내세요! / 오늘 급식이 기대돼요"
              className="w-full rounded-xl bg-white border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
            />
          </div>

          {greetingError && (
            <p className="text-xs font-semibold text-red-700">{greetingError}</p>
          )}

          <button
            type="submit"
            className="min-h-11 px-5 py-2.5 text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-xl transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7]"
          >
            선생님께 아침인사 보내기
          </button>
        </form>

        {/* Student's own morning greetings for the active date */}
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-800">
              {formatKoreanDate(activeDate)} 내가 보낸 아침인사 ({myGreetingsOnActiveDate.length})
            </h2>
            <a
              href="#greeting-calendar"
              className="text-xs font-semibold text-[#0284C7] hover:underline whitespace-nowrap"
            >
              달력에서 전체 보기
            </a>
          </div>
          {myGreetingsOnActiveDate.length === 0 ? (
            <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              아직 이 날짜에 보낸 아침인사가 없어요. 위 칸에서 기분을 골라 인사를 전해 보세요!
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {myGreetingsOnActiveDate.map((item) => (
                <li
                  key={item.id}
                  className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-900 tabular-nums">
                      {item.moodEmoji} {item.moodLabel} · {item.createdAt} 제출
                    </span>
                    {item.teacherChecked ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>선생님 확인 완료</span>
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-700 whitespace-nowrap">
                        선생님 확인 대기 중
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-800 space-y-1.5">
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
                  {item.teacherReply && (
                    <div className="rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] px-3.5 py-2.5 text-xs text-[#0C4A6E]">
                      <strong>선생님 답장:</strong> {item.teacherReply}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right: Teacher Counseling Request */}
      <div
        id="counseling-request"
        className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 flex flex-col gap-5"
      >
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#4F46E5] shrink-0">
              <HeartHandshake className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                선생님께 상담 신청하기
              </h2>
              <p className="text-sm text-slate-600">
                비밀이 보장되며, 신청 내역은 나와 선생님만 볼 수 있어요.
              </p>
            </div>
          </div>
          <MessageCircleHeart className="w-6 h-6 text-[#4F46E5] shrink-0" aria-hidden="true" />
        </div>

        <form onSubmit={handleCounselingSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-900">어떤 이야기를 나누고 싶나요?</span>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTopic(item)}
                  aria-pressed={topic === item}
                  className={`min-h-10 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
                    topic === item
                      ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-900">원하는 시간</span>
            <div className="flex flex-wrap gap-2">
              {PREFERRED_TIMES.map((timeOption) => (
                <button
                  key={timeOption}
                  type="button"
                  onClick={() => setPreferredTime(timeOption)}
                  aria-pressed={preferredTime === timeOption}
                  className={`min-h-10 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
                    preferredTime === timeOption
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {timeOption}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="counseling-message-input" className="text-sm font-bold text-slate-900">
              선생님께 전할 말
            </label>
            <textarea
              id="counseling-message-input"
              rows={2}
              value={counselingMessage}
              onChange={(e) => {
                setCounselingMessage(e.target.value);
                if (counselingError) setCounselingError('');
              }}
              placeholder="예: 쉬는시간에 잠깐 이야기 나누고 싶어요 / 친구 일로 고민이 있어요"
              className="w-full rounded-xl bg-white border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          {counselingError && (
            <p className="text-xs font-semibold text-red-700">{counselingError}</p>
          )}

          <button
            type="submit"
            className="min-h-11 px-5 py-2.5 text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
          >
            선생님께 상담 신청하기
          </button>
        </form>

        {/* Student's own counseling requests */}
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-slate-800">
            나의 상담 신청 내역 ({myCounselings.length})
          </h3>
          {myCounselings.length === 0 ? (
            <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              아직 신청한 상담이 없어요. 도움이 필요할 때 언제든 신청해 주세요.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {myCounselings.map((req) => (
                <li
                  key={req.id}
                  className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#4F46E5]">
                      {req.topic} · {req.preferredTime}
                    </span>
                    <span
                      className={`font-bold whitespace-nowrap ${
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
                        ? '선생님 확인 완료'
                        : '신청 완료 (대기 중)'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-800">{req.message}</p>
                  <p className="text-xs text-slate-500 tabular-nums">
                    {req.createdAt} 신청
                    {req.status === 'completed' && req.completedAt
                      ? ` · ${req.completedAt} 상담 완료`
                      : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
