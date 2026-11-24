import { useEffect, useMemo, useRef, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
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
import { CHARACTER_THEME_OPTIONS, INITIAL_STUDENTS } from './data/classroomData';
import { db, handleFirestoreError, OperationType } from './firebase';
import type {
  CharacterId,
  CharacterTheme,
  CounselingRequest,
  CounselingStatus,
  CounselingTopic,
  FeedbackNotice,
  MoodId,
  MoodOption,
  MorningGreeting,
  Student,
  ViewMode,
} from './types/classroom';
import { formatKoreanDate, getTodayIsoDate } from './utils/dateUtils';
import { clearAllStoredData } from './utils/storage';

const SELECTED_STUDENT_KEY = 'classroom-selected-student-v1';
const VIEW_MODE_KEY = 'classroom-view-mode-v1';

function formatTimeNow(): string {
  return new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function getCharacterById(characterId: unknown): CharacterTheme {
  const found = CHARACTER_THEME_OPTIONS.find((c) => c.id === characterId);
  return found ?? CHARACTER_THEME_OPTIONS[0];
}

function timestampToMs(val: unknown): number {
  if (val instanceof Timestamp) return val.toMillis();
  if (
    val &&
    typeof val === 'object' &&
    'toMillis' in val &&
    typeof (val as { toMillis: () => number }).toMillis === 'function'
  ) {
    return (val as { toMillis: () => number }).toMillis();
  }
  return 0;
}

function loadLocalString(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function saveLocalString(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage error
  }
}

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoaded, setStudentsLoaded] = useState<boolean>(false);
  const [activeDate, setActiveDate] = useState<string>(getTodayIsoDate());
  const [rawGreetings, setRawGreetings] = useState<
    Array<MorningGreeting & { createdAtMs: number }>
  >([]);
  const [rawCounselings, setRawCounselings] = useState<
    Array<CounselingRequest & { createdAtMs: number }>
  >([]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    () => loadLocalString(SELECTED_STUDENT_KEY) ?? INITIAL_STUDENTS[0].id
  );
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = loadLocalString(VIEW_MODE_KEY);
    return saved === 'teacher' || saved === 'student' ? saved : 'teacher';
  });

  const [notice, setNotice] = useState<FeedbackNotice | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [resetVersion, setResetVersion] = useState<number>(0);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  const hasBootstrappedStudentsRef = useRef<boolean>(false);
  const hasBootstrappedSettingsRef = useRef<boolean>(false);

  if (fatalError) {
    throw fatalError;
  }

  // Persist lightweight UI selection locally
  useEffect(() => {
    saveLocalString(SELECTED_STUDENT_KEY, selectedStudentId);
  }, [selectedStudentId]);

  useEffect(() => {
    saveLocalString(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  // Subscribe directly to Firestore collections (no login required)
  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'classroom');
    const unsubSettings = onSnapshot(
      settingsRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (typeof data.activeDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.activeDate)) {
            setActiveDate(data.activeDate);
          }
        } else if (!hasBootstrappedSettingsRef.current) {
          hasBootstrappedSettingsRef.current = true;
          void setDoc(settingsRef, {
            activeDate: getTodayIsoDate(),
            updatedBy: 'classroom',
            updatedAt: serverTimestamp(),
          }).catch((err) => {
            try {
              handleFirestoreError(err, OperationType.WRITE, 'settings/classroom');
            } catch (wrapped) {
              setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
            }
          });
        }
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.GET, 'settings/classroom');
        } catch (wrapped) {
          setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    );

    const studentsQuery = query(collection(db, 'students'), orderBy('number', 'asc'));
    const unsubStudents = onSnapshot(
      studentsQuery,
      (snap) => {
        if (snap.empty && !hasBootstrappedStudentsRef.current) {
          hasBootstrappedStudentsRef.current = true;
          const batch = writeBatch(db);
          for (const st of INITIAL_STUDENTS) {
            batch.set(doc(db, 'students', st.id), {
              name: st.name,
              number: st.number,
              characterId: st.character.id,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          void batch.commit().catch((err) => {
            try {
              handleFirestoreError(err, OperationType.WRITE, 'students');
            } catch (wrapped) {
              setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
            }
          });
          return;
        }

        const loaded: Student[] = snap.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: typeof data.name === 'string' ? data.name : '학생',
            number: typeof data.number === 'number' ? data.number : 1,
            character: getCharacterById(data.characterId),
            balance: 0,
            coupons: [],
          };
        });
        setStudents(loaded);
        setStudentsLoaded(true);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'students');
        } catch (wrapped) {
          setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    );

    const greetingsQuery = query(collection(db, 'morningGreetings'), orderBy('createdAt', 'desc'));
    const unsubGreetings = onSnapshot(
      greetingsQuery,
      (snap) => {
        const items = snap.docs
          .map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              studentId: String(data.studentId ?? ''),
              studentName: String(data.studentName ?? ''),
              date: String(data.date ?? getTodayIsoDate()),
              moodId: (data.moodId ?? 'happy') as MoodId,
              moodEmoji: String(data.moodEmoji ?? '😊'),
              moodLabel: String(data.moodLabel ?? '행복해요'),
              reason: String(data.reason ?? ''),
              messageToTeacher: String(data.messageToTeacher ?? ''),
              createdAt: String(data.timeLabel ?? ''),
              teacherChecked: Boolean(data.teacherChecked),
              teacherReply: data.teacherReply ? String(data.teacherReply) : undefined,
              createdAtMs: timestampToMs(data.createdAt),
            };
          })
          .sort((a, b) => b.createdAtMs - a.createdAtMs);
        setRawGreetings(items);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'morningGreetings');
        } catch (wrapped) {
          setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    );

    const counselingsQuery = query(
      collection(db, 'counselingRequests'),
      orderBy('createdAt', 'desc')
    );
    const unsubCounselings = onSnapshot(
      counselingsQuery,
      (snap) => {
        const items = snap.docs
          .map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              studentId: String(data.studentId ?? ''),
              studentName: String(data.studentName ?? ''),
              topic: (data.topic ?? '마음 이야기') as CounselingTopic,
              preferredTime: String(data.preferredTime ?? '쉬는시간'),
              message: String(data.message ?? ''),
              createdAt: String(data.timeLabel ?? ''),
              status: (data.status ?? 'pending') as CounselingStatus,
              completedAt: data.completedTimeLabel ? String(data.completedTimeLabel) : undefined,
              createdAtMs: timestampToMs(data.createdAt),
            };
          })
          .sort((a, b) => b.createdAtMs - a.createdAtMs);
        setRawCounselings(items);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'counselingRequests');
        } catch (wrapped) {
          setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    );

    return () => {
      unsubSettings();
      unsubStudents();
      unsubGreetings();
      unsubCounselings();
    };
  }, []);

  // Keep student names synchronized dynamically with latest roster
  const studentNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of students) {
      map.set(s.id, s.name);
    }
    return map;
  }, [students]);

  const morningGreetings: MorningGreeting[] = useMemo(
    () =>
      rawGreetings.map(({ createdAtMs: _ignore, ...item }) => ({
        ...item,
        studentName: studentNameMap.get(item.studentId) ?? item.studentName,
      })),
    [rawGreetings, studentNameMap]
  );

  const counselingRequests: CounselingRequest[] = useMemo(
    () =>
      rawCounselings.map(({ createdAtMs: _ignore, ...item }) => ({
        ...item,
        studentName: studentNameMap.get(item.studentId) ?? item.studentName,
      })),
    [rawCounselings, studentNameMap]
  );

  const selectedStudent =
    students.find((student) => student.id === selectedStudentId) ?? students[0] ?? null;

  useEffect(() => {
    if (students.length > 0 && !students.some((s) => s.id === selectedStudentId)) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const showNotice = (type: FeedbackNotice['type'], message: string) => {
    setNotice({ id: Date.now(), type, message });
  };

  // Teacher Setting 1: Student Roster Management (Add / Update / Delete in Firestore)
  const handleAddStudent = async (name: string, number: number, character: CharacterTheme) => {
    const validName = name.trim().slice(0, 30);
    const validNumber = Math.min(999, Math.max(1, Math.floor(number)));
    const validCharId: CharacterId = character.id;
    const newId = `student-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    try {
      await setDoc(doc(db, 'students', newId), {
        name: validName,
        number: validNumber,
        characterId: validCharId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showNotice('success', `${validNumber}번 ${validName} 학생을 우리 반 명단에 추가했어요.`);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, `students/${newId}`);
      } catch (wrapped) {
        setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  };

  const handleUpdateStudent = async (
    studentId: string,
    name: string,
    number: number,
    character: CharacterTheme
  ) => {
    const validName = name.trim().slice(0, 30);
    const validNumber = Math.min(999, Math.max(1, Math.floor(number)));
    const validCharId: CharacterId = character.id;

    try {
      await updateDoc(doc(db, 'students', studentId), {
        name: validName,
        number: validNumber,
        characterId: validCharId,
        updatedAt: serverTimestamp(),
      });
      showNotice('success', `학생 정보를 '${validNumber}번 ${validName}'(으)로 수정했어요.`);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `students/${studentId}`);
      } catch (wrapped) {
        setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (students.length <= 1) {
      showNotice('warning', '최소 1명의 학생은 명단에 남아 있어야 해요.');
      return;
    }

    const target = students.find((s) => s.id === studentId);

    try {
      await deleteDoc(doc(db, 'students', studentId));

      // Clean up greetings & counseling records belonging to the removed student
      const relatedGreetings = rawGreetings.filter((g) => g.studentId === studentId);
      const relatedCounselings = rawCounselings.filter((c) => c.studentId === studentId);

      if (relatedGreetings.length > 0 || relatedCounselings.length > 0) {
        const batch = writeBatch(db);
        for (const g of relatedGreetings) {
          batch.delete(doc(db, 'morningGreetings', g.id));
        }
        for (const c of relatedCounselings) {
          batch.delete(doc(db, 'counselingRequests', c.id));
        }
        await batch.commit();
      }

      if (target) {
        showNotice('info', `${target.number}번 ${target.name} 학생을 명단에서 삭제했어요.`);
      }
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `students/${studentId}`);
      } catch (wrapped) {
        setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  };

  // Teacher Setting 3: Active Morning Greeting Date
  const handleChangeActiveDate = async (nextDate: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nextDate)) return;

    try {
      await setDoc(doc(db, 'settings', 'classroom'), {
        activeDate: nextDate,
        updatedBy: 'classroom',
        updatedAt: serverTimestamp(),
      });
      showNotice(
        'success',
        `아침인사 날짜를 ${formatKoreanDate(nextDate)}로 설정했어요. 모든 기기에도 바로 반영됩니다.`
      );
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'settings/classroom');
      } catch (wrapped) {
        setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  };

  // Student Action: Submit Morning Greeting on activeDate
  const handleSubmitMorningGreeting = async (
    studentId: string,
    mood: MoodOption,
    reason: string,
    messageToTeacher: string
  ) => {
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) return;

    const cleanReason = reason.trim().slice(0, 500);
    if (!cleanReason) return;

    const greetingId = `greeting-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    try {
      await setDoc(doc(db, 'morningGreetings', greetingId), {
        studentId: targetStudent.id,
        studentName: targetStudent.name.slice(0, 30),
        authorUid: 'classroom',
        date: activeDate,
        moodId: mood.id,
        moodEmoji: mood.emoji.slice(0, 10),
        moodLabel: mood.label.slice(0, 20),
        reason: cleanReason,
        messageToTeacher: messageToTeacher.trim().slice(0, 500),
        timeLabel: formatTimeNow(),
        teacherChecked: false,
        teacherReply: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showNotice(
        'success',
        `${targetStudent.name} 학생의 ${formatKoreanDate(activeDate)} 아침인사(${mood.emoji} ${mood.label})가 저장되었어요.`
      );
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, `morningGreetings/${greetingId}`);
      } catch (wrapped) {
        setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  };

  const handleCheckMorningGreeting = async (greetingId: string, replyText: string) => {
    const targetGreeting = morningGreetings.find((g) => g.id === greetingId);
    if (!targetGreeting || targetGreeting.teacherChecked) return;

    const cleanReply = replyText.trim().slice(0, 500);

    try {
      await updateDoc(doc(db, 'morningGreetings', greetingId), {
        teacherChecked: true,
        teacherReply: cleanReply,
        updatedAt: serverTimestamp(),
      });
      showNotice(
        'success',
        cleanReply
          ? `${targetGreeting.studentName} 학생의 아침인사를 확인하고 따뜻한 답장을 남겼어요.`
          : `${targetGreeting.studentName} 학생의 아침인사를 확인 완료했어요.`
      );
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `morningGreetings/${greetingId}`);
      } catch (wrapped) {
        setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  };

  const handleSubmitCounseling = async (
    studentId: string,
    topic: CounselingTopic,
    preferredTime: string,
    message: string
  ) => {
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) return;

    const cleanMessage = message.trim().slice(0, 1000);
    if (!cleanMessage) return;

    const requestId = `counseling-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    try {
      await setDoc(doc(db, 'counselingRequests', requestId), {
        studentId: targetStudent.id,
        studentName: targetStudent.name.slice(0, 30),
        authorUid: 'classroom',
        topic,
        preferredTime: preferredTime.slice(0, 30),
        message: cleanMessage,
        timeLabel: formatTimeNow(),
        status: 'pending',
        completedTimeLabel: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showNotice(
        'success',
        `${targetStudent.name} 학생의 상담 신청이 안전하게 저장되었어요. (다른 친구 화면에는 보이지 않아요)`
      );
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, `counselingRequests/${requestId}`);
      } catch (wrapped) {
        setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  };

  // Teacher Setting 2: Update Counseling Status (including completion & undo)
  const handleUpdateCounselingStatus = async (requestId: string, status: CounselingStatus) => {
    const targetReq = counselingRequests.find((c) => c.id === requestId);
    if (!targetReq) return;

    const completedTimeLabel = status === 'completed' ? formatTimeNow() : '';

    try {
      await updateDoc(doc(db, 'counselingRequests', requestId), {
        status,
        completedTimeLabel,
        updatedAt: serverTimestamp(),
      });
      showNotice(
        status === 'completed' ? 'success' : 'info',
        `${targetReq.studentName} 학생의 상담 신청을 '${
          status === 'completed' ? '상담 완료' : '확인 완료'
        }' 상태로 변경했어요.`
      );
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `counselingRequests/${requestId}`);
      } catch (wrapped) {
        setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  };

  const handleConfirmResetAll = async () => {
    try {
      const [greetingsSnap, counselingsSnap, studentsSnap] = await Promise.all([
        getDocs(collection(db, 'morningGreetings')),
        getDocs(collection(db, 'counselingRequests')),
        getDocs(collection(db, 'students')),
      ]);

      const batch = writeBatch(db);
      for (const docSnap of greetingsSnap.docs) {
        batch.delete(docSnap.ref);
      }
      for (const docSnap of counselingsSnap.docs) {
        batch.delete(docSnap.ref);
      }
      for (const docSnap of studentsSnap.docs) {
        batch.delete(docSnap.ref);
      }

      for (const st of INITIAL_STUDENTS) {
        batch.set(doc(db, 'students', st.id), {
          name: st.name,
          number: st.number,
          characterId: st.character.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      batch.set(doc(db, 'settings', 'classroom'), {
        activeDate: getTodayIsoDate(),
        updatedBy: 'classroom',
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      clearAllStoredData();
      setSelectedStudentId(INITIAL_STUDENTS[0].id);
      setResetVersion((v) => v + 1);
      setIsResetModalOpen(false);

      showNotice(
        'info',
        '모든 기기의 데이터를 초기화하고 기본 가상 학생 4명과 오늘 날짜 상태로 되돌렸어요.'
      );
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'reset-all');
      } catch (wrapped) {
        setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  };

  const submittedOnActiveDateCount = new Set(
    morningGreetings.filter((g) => g.date === activeDate).map((g) => g.studentId)
  ).size;
  const pendingCounselingCount = counselingRequests.filter(
    (c) => c.status !== 'completed'
  ).length;

  const selectedStudentGreetings = selectedStudent
    ? morningGreetings.filter((g) => g.studentId === selectedStudent.id)
    : [];
  const selectedStudentCounselings = selectedStudent
    ? counselingRequests.filter((c) => c.studentId === selectedStudent.id)
    : [];

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <HeaderBar />

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
                ? '학생 명단과 아침인사 날짜를 설정하고, 모든 기기에서 들어온 아침인사·상담 내역을 실시간 관리해요.'
                : '선생님이 설정한 날짜에 맞춰 아침인사와 상담 신청을 작성하면 선생님 기기에서도 바로 확인할 수 있어요.'}
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
                {selectedStudent && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>
                      내 화면 · <strong className="text-[#0284C7]">{selectedStudent.name}</strong>
                    </span>
                  </>
                )}
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

        {!studentsLoaded ? (
          <section className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-sm text-slate-600">
            우리 반 명단과 기록을 실시간으로 불러오고 있어요...
          </section>
        ) : viewMode === 'student' ? (
          selectedStudent ? (
            <>
              {/* Private Student Switcher (names & avatars only, zero peer data) */}
              <section
                aria-label="내 이름 선택하기"
                className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-2.5 text-sm text-slate-600">
                  <Lock
                    className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5 sm:mt-0"
                    aria-hidden="true"
                  />
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
            <section className="rounded-2xl bg-white border border-slate-200 p-8 text-center flex flex-col gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                아직 학생 명단이 비어 있어요
              </h2>
              <p className="text-sm text-slate-600">
                교사용 관리 화면의 설정에서 학생을 추가하면 바로 사용할 수 있습니다.
              </p>
            </section>
          )
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
            onRequestResetAll={() => setIsResetModalOpen(true)}
          />
        )}
      </main>
    </div>
  );
}
