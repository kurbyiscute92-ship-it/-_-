import { INITIAL_STUDENTS } from '../data/classroomData';
import type {
  CounselingRequest,
  CounselingTopic,
  MoodId,
  MorningGreeting,
  Student,
  ViewMode,
} from '../types/classroom';
import { getTodayIsoDate } from './dateUtils';

const APP_STATE_STORAGE_KEY = 'classroom-app-state-v2';
const DRAFTS_STORAGE_KEY = 'classroom-drafts-v1';

// Legacy v1 keys for seamless migration if user already saved data
const LEGACY_KEYS = {
  students: 'classroom-students-v1',
  activeDate: 'classroom-active-date-v1',
  greetings: 'classroom-morning-greetings-v1',
  counselings: 'classroom-counseling-requests-v1',
};

export interface PersistedAppState {
  students: Student[];
  activeDate: string;
  morningGreetings: MorningGreeting[];
  counselingRequests: CounselingRequest[];
  selectedStudentId: string;
  viewMode: ViewMode;
}

export interface StudentFormDraft {
  selectedMoodId: MoodId | null;
  moodReason: string;
  messageToTeacher: string;
  topic: CounselingTopic;
  preferredTime: string;
  counselingMessage: string;
}

export interface PersistedDrafts {
  studentForms: Record<string, StudentFormDraft>;
  teacherReplies: Record<string, string>;
  teacherTab: 'overview' | 'settings';
}

function isValidIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidStudentsArray(value: unknown): value is Student[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.number === 'number' &&
        item.character &&
        typeof item.character === 'object'
    )
  );
}

function normalizeGreetings(raw: unknown): MorningGreeting[] {
  if (!Array.isArray(raw)) return [];
  const fallbackDate = getTodayIsoDate();
  return raw
    .filter((item) => item && typeof item === 'object' && typeof item.id === 'string')
    .map((item) => ({
      ...item,
      date: isValidIsoDate(item.date) ? item.date : fallbackDate,
    }));
}

function normalizeCounselings(raw: unknown): CounselingRequest[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item) => item && typeof item === 'object' && typeof item.id === 'string');
}

export function getDefaultAppState(): PersistedAppState {
  return {
    students: INITIAL_STUDENTS,
    activeDate: getTodayIsoDate(),
    morningGreetings: [],
    counselingRequests: [],
    selectedStudentId: INITIAL_STUDENTS[0].id,
    viewMode: 'student',
  };
}

export function loadAppState(): PersistedAppState {
  const defaults = getDefaultAppState();

  try {
    const rawV2 = window.localStorage.getItem(APP_STATE_STORAGE_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (parsed && typeof parsed === 'object') {
        const students: Student[] = isValidStudentsArray(parsed.students)
          ? parsed.students
          : defaults.students;
        const activeDate = isValidIsoDate(parsed.activeDate)
          ? parsed.activeDate
          : defaults.activeDate;
        const morningGreetings = normalizeGreetings(parsed.morningGreetings);
        const counselingRequests = normalizeCounselings(parsed.counselingRequests);
        const selectedStudentId =
          typeof parsed.selectedStudentId === 'string' &&
          students.some((s) => s.id === parsed.selectedStudentId)
            ? parsed.selectedStudentId
            : students[0].id;
        const viewMode: ViewMode =
          parsed.viewMode === 'teacher' || parsed.viewMode === 'student'
            ? parsed.viewMode
            : defaults.viewMode;

        return {
          students,
          activeDate,
          morningGreetings,
          counselingRequests,
          selectedStudentId,
          viewMode,
        };
      }
    }

    // Check if legacy v1 data exists; if so, load it first
    const legacyStudentsRaw = window.localStorage.getItem(LEGACY_KEYS.students);
    const legacyDateRaw = window.localStorage.getItem(LEGACY_KEYS.activeDate);
    const legacyGreetingsRaw = window.localStorage.getItem(LEGACY_KEYS.greetings);
    const legacyCounselingsRaw = window.localStorage.getItem(LEGACY_KEYS.counselings);

    if (legacyStudentsRaw || legacyDateRaw || legacyGreetingsRaw || legacyCounselingsRaw) {
      const parsedStudents = legacyStudentsRaw ? JSON.parse(legacyStudentsRaw) : null;
      const students = isValidStudentsArray(parsedStudents) ? parsedStudents : defaults.students;
      const activeDate = isValidIsoDate(legacyDateRaw) ? legacyDateRaw : defaults.activeDate;
      const morningGreetings = legacyGreetingsRaw
        ? normalizeGreetings(JSON.parse(legacyGreetingsRaw))
        : [];
      const counselingRequests = legacyCounselingsRaw
        ? normalizeCounselings(JSON.parse(legacyCounselingsRaw))
        : [];

      return {
        students,
        activeDate,
        morningGreetings,
        counselingRequests,
        selectedStudentId: students[0].id,
        viewMode: defaults.viewMode,
      };
    }
  } catch {
    // Fallback cleanly to default 4 virtual students & base structure
  }

  return defaults;
}

export function saveAppState(state: PersistedAppState): void {
  try {
    window.localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota or iframe restrictions
  }
}

export function loadDrafts(): PersistedDrafts {
  try {
    const raw = window.localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          studentForms:
            parsed.studentForms && typeof parsed.studentForms === 'object'
              ? parsed.studentForms
              : {},
          teacherReplies:
            parsed.teacherReplies && typeof parsed.teacherReplies === 'object'
              ? parsed.teacherReplies
              : {},
          teacherTab: parsed.teacherTab === 'settings' ? 'settings' : 'overview',
        };
      }
    }
  } catch {
    // Ignore storage read error
  }

  return {
    studentForms: {},
    teacherReplies: {},
    teacherTab: 'overview',
  };
}

export function saveDrafts(drafts: PersistedDrafts): void {
  try {
    window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // Ignore storage write error
  }
}

export function clearAllStoredData(): void {
  try {
    window.localStorage.removeItem(APP_STATE_STORAGE_KEY);
    window.localStorage.removeItem(DRAFTS_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_KEYS.students);
    window.localStorage.removeItem(LEGACY_KEYS.activeDate);
    window.localStorage.removeItem(LEGACY_KEYS.greetings);
    window.localStorage.removeItem(LEGACY_KEYS.counselings);
  } catch {
    // Ignore storage remove error
  }
}
