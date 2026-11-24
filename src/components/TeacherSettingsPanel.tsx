import { useState, type FormEvent } from 'react';
import {
  Calendar,
  Check,
  CheckCircle2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { CHARACTER_THEME_OPTIONS } from '../data/classroomData';
import type {
  CharacterId,
  CharacterTheme,
  CounselingRequest,
  CounselingStatus,
  Student,
} from '../types/classroom';
import { formatKoreanDate, getTodayIsoDate } from '../utils/dateUtils';
import { CharacterAvatar } from './CharacterAvatar';
import { ShareLinksCard } from './ShareLinksCard';

interface TeacherSettingsPanelProps {
  students: Student[];
  activeDate: string;
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
  onUpdateCounselingStatus: (requestId: string, status: CounselingStatus) => void;
  onRequestResetAll: () => void;
}

export function TeacherSettingsPanel({
  students,
  activeDate,
  counselingRequests,
  onChangeActiveDate,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onUpdateCounselingStatus,
  onRequestResetAll,
}: TeacherSettingsPanelProps) {
  // Add student state
  const nextDefaultNumber =
    students.length > 0 ? Math.max(...students.map((s) => s.number)) + 1 : 1;
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState<string>(String(nextDefaultNumber));
  const [newCharId, setNewCharId] = useState<CharacterId>('squirrel');
  const [addError, setAddError] = useState('');

  // Edit student state
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editCharId, setEditCharId] = useState<CharacterId>('squirrel');
  const [editError, setEditError] = useState('');

  // Delete confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setAddError('추가할 학생 이름을 입력해 주세요.');
      return;
    }

    const parsedNum = Number(newNumber);
    const validNum = Number.isFinite(parsedNum) && parsedNum > 0 ? Math.floor(parsedNum) : nextDefaultNumber;
    const chosenChar =
      CHARACTER_THEME_OPTIONS.find((c) => c.id === newCharId) ?? CHARACTER_THEME_OPTIONS[0];

    setAddError('');
    onAddStudent(trimmed, validNum, chosenChar);
    setNewName('');
    setNewNumber(String(validNum + 1));
  };

  const startEditing = (student: Student) => {
    setEditingStudentId(student.id);
    setEditName(student.name);
    setEditNumber(String(student.number));
    setEditCharId(student.character.id);
    setEditError('');
    setConfirmDeleteId(null);
  };

  const handleSaveEdit = (studentId: string) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditError('학생 이름은 비워 둘 수 없어요.');
      return;
    }
    const parsedNum = Number(editNumber);
    const validNum = Number.isFinite(parsedNum) && parsedNum > 0 ? Math.floor(parsedNum) : 1;
    const chosenChar =
      CHARACTER_THEME_OPTIONS.find((c) => c.id === editCharId) ?? CHARACTER_THEME_OPTIONS[0];

    onUpdateStudent(studentId, trimmed, validNum, chosenChar);
    setEditingStudentId(null);
    setEditError('');
  };

  const pendingCounselings = counselingRequests.filter((c) => c.status !== 'completed');
  const completedCounselings = counselingRequests.filter((c) => c.status === 'completed');

  return (
    <section
      aria-label="교사용 설정"
      className="flex flex-col gap-6"
    >
      <ShareLinksCard />

      {/* Top Row: Morning Greeting Date Setting + Counseling Completion Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Setting 3: Morning Greeting Date */}
        <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 flex flex-col gap-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-11 h-11 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] shrink-0">
              <Calendar className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">아침인사 날짜 설정</h2>
              <p className="text-sm text-slate-600">
                여기서 설정한 날짜가 학생 화면에도 표시되며, 아침인사가 해당 날짜로 달력에 저장됩니다.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] p-4 flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#0369A1]">
              현재 학생들에게 보이는 날짜
            </span>
            <p className="text-lg font-bold text-slate-900 tabular-nums">
              {formatKoreanDate(activeDate)}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label htmlFor="teacher-active-date-input" className="text-sm font-bold text-slate-900">
                날짜 선택
              </label>
              <input
                id="teacher-active-date-input"
                type="date"
                value={activeDate}
                onChange={(e) => {
                  if (e.target.value) {
                    onChangeActiveDate(e.target.value);
                  }
                }}
                className="w-full min-h-11 rounded-xl bg-white border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>

            <button
              type="button"
              onClick={() => onChangeActiveDate(getTodayIsoDate())}
              className="min-h-11 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              오늘 날짜로 맞추기
            </button>
          </div>
        </div>

        {/* Setting 2: Counseling Completion Management */}
        <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#4F46E5] shrink-0">
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">상담 완료 처리 관리</h2>
                <p className="text-sm text-slate-600">
                  상담이 끝난 신청 건을 완료 처리하거나 완료 상태를 되돌릴 수 있어요.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-600 tabular-nums whitespace-nowrap">
              대기·진행 {pendingCounselings.length}건 · 완료 {completedCounselings.length}건
            </span>
          </div>

          {counselingRequests.length === 0 ? (
            <div className="rounded-xl bg-slate-50 border border-dashed border-slate-300 p-6 text-center">
              <p className="text-sm font-semibold text-slate-700">
                아직 접수된 상담 신청이 없어요.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                학생이 상담을 신청하면 이곳에서 바로 완료 처리할 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto pr-0.5">
              {pendingCounselings.map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {req.studentName} · <span className="text-[#4F46E5]">{req.topic}</span>
                    </p>
                    <p className="text-xs text-slate-600 truncate mt-0.5">{req.message}</p>
                    <p className="text-xs text-slate-500 tabular-nums mt-0.5">
                      희망: {req.preferredTime} · {req.createdAt} 신청
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUpdateCounselingStatus(req.id, 'completed')}
                    className="inline-flex items-center justify-center gap-1.5 min-h-10 px-3.5 py-2 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    <span>상담 완료 처리</span>
                  </button>
                </div>
              ))}

              {completedCounselings.map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl bg-emerald-50/50 border border-emerald-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {req.studentName} · <span className="text-emerald-700">상담 완료</span>
                    </p>
                    <p className="text-xs text-slate-600 truncate mt-0.5">{req.message}</p>
                    <p className="text-xs text-slate-500 tabular-nums mt-0.5">
                      {req.topic} · {req.completedAt ? `${req.completedAt} 완료` : `${req.createdAt} 신청`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUpdateCounselingStatus(req.id, 'confirmed')}
                    className="inline-flex items-center justify-center gap-1.5 min-h-10 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>완료 취소</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Setting 1: Student Roster Management (Add / Edit / Delete) */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <Users className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">학생 명단 설정</h2>
              <p className="text-sm text-slate-600">
                우리 반 학생 이름을 새로 추가하거나 수정·삭제할 수 있습니다. 변경 내용은 학생 화면에도 바로 적용됩니다.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 tabular-nums whitespace-nowrap">
            등록 학생 {students.length}명
          </span>
        </div>

        {/* Add Student Form */}
        <form
          onSubmit={handleAddSubmit}
          className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col gap-4"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <UserPlus className="w-4 h-4 text-[#0284C7]" aria-hidden="true" />
            <span>새 학생 추가</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-2 flex flex-col gap-1">
              <label htmlFor="add-student-number" className="text-xs font-semibold text-slate-700">
                번호
              </label>
              <input
                id="add-student-number"
                type="number"
                min={1}
                max={99}
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                className="w-full min-h-11 rounded-xl bg-white border border-slate-300 px-3 py-2 text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>

            <div className="md:col-span-4 flex flex-col gap-1">
              <label htmlFor="add-student-name" className="text-xs font-semibold text-slate-700">
                학생 이름
              </label>
              <input
                id="add-student-name"
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (addError) setAddError('');
                }}
                placeholder="예: 예준"
                className="w-full min-h-11 rounded-xl bg-white border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>

            <div className="md:col-span-4 flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-700">캐릭터 아이콘</span>
              <div className="flex items-center gap-2">
                {CHARACTER_THEME_OPTIONS.map((charOpt) => (
                  <button
                    key={charOpt.id}
                    type="button"
                    onClick={() => setNewCharId(charOpt.id)}
                    aria-label={charOpt.label}
                    aria-pressed={newCharId === charOpt.id}
                    className={`p-1 rounded-xl border transition-colors cursor-pointer ${
                      newCharId === charOpt.id
                        ? 'border-[#0284C7] bg-[#E0F2FE] ring-2 ring-[#0284C7]/40'
                        : 'border-slate-200 bg-white hover:bg-slate-100'
                    }`}
                  >
                    <CharacterAvatar character={charOpt} size="xs" />
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 min-h-11 px-4 py-2 text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>추가</span>
              </button>
            </div>
          </div>

          {addError && <p className="text-xs font-semibold text-red-700">{addError}</p>}
        </form>

        {/* Student Roster List */}
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {students.map((student) => {
            const isEditing = editingStudentId === student.id;
            const isConfirmingDelete = confirmDeleteId === student.id;

            return (
              <li
                key={student.id}
                className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col gap-3"
              >
                {isEditing ? (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-3">
                        <label
                          htmlFor={`edit-num-${student.id}`}
                          className="block text-[11px] font-semibold text-slate-600 mb-1"
                        >
                          번호
                        </label>
                        <input
                          id={`edit-num-${student.id}`}
                          type="number"
                          min={1}
                          max={99}
                          value={editNumber}
                          onChange={(e) => setEditNumber(e.target.value)}
                          className="w-full min-h-10 rounded-xl bg-white border border-slate-300 px-2.5 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                        />
                      </div>
                      <div className="col-span-9">
                        <label
                          htmlFor={`edit-name-${student.id}`}
                          className="block text-[11px] font-semibold text-slate-600 mb-1"
                        >
                          이름
                        </label>
                        <input
                          id={`edit-name-${student.id}`}
                          type="text"
                          value={editName}
                          onChange={(e) => {
                            setEditName(e.target.value);
                            if (editError) setEditError('');
                          }}
                          className="w-full min-h-10 rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {CHARACTER_THEME_OPTIONS.map((charOpt) => (
                          <button
                            key={charOpt.id}
                            type="button"
                            onClick={() => setEditCharId(charOpt.id)}
                            aria-label={charOpt.label}
                            aria-pressed={editCharId === charOpt.id}
                            className={`p-1 rounded-xl border transition-colors cursor-pointer ${
                              editCharId === charOpt.id
                                ? 'border-[#0284C7] bg-[#E0F2FE]'
                                : 'border-slate-200 bg-white'
                            }`}
                          >
                            <CharacterAvatar character={charOpt} size="xs" />
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingStudentId(null)}
                          className="min-h-10 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(student.id)}
                          className="inline-flex items-center gap-1 min-h-10 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-xl transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>저장</span>
                        </button>
                      </div>
                    </div>

                    {editError && <p className="text-xs font-semibold text-red-700">{editError}</p>}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <CharacterAvatar character={student.character} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {student.number}번 {student.name}
                        </p>
                        <p className="text-xs text-slate-500">{student.character.label}</p>
                      </div>
                    </div>

                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteStudent(student.id);
                            setConfirmDeleteId(null);
                          }}
                          className="min-h-10 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                        >
                          삭제 확인
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="min-h-10 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditing(student)}
                          aria-label={`${student.name} 학생 정보 수정`}
                          className="inline-flex items-center gap-1 min-h-10 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>수정</span>
                        </button>
                        <button
                          type="button"
                          disabled={students.length <= 1}
                          onClick={() => setConfirmDeleteId(student.id)}
                          aria-label={`${student.name} 학생 삭제`}
                          title={
                            students.length <= 1
                              ? '최소 1명의 학생은 남아 있어야 합니다.'
                              : undefined
                          }
                          className="inline-flex items-center gap-1 min-h-10 px-3 py-1.5 text-xs font-semibold text-red-700 bg-white hover:bg-red-50 border border-slate-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>삭제</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Setting 4: Full Classroom Data Reset (Protected by Confirm Modal) */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">전체 데이터 초기화</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            서버에 저장된 학생 명단·아침인사·상담 내역을 모두 비우고 기본 가상 학생 4명 상태로 되돌립니다.
          </p>
        </div>

        <button
          type="button"
          onClick={onRequestResetAll}
          className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>전체 초기화</span>
        </button>
      </div>
    </section>
  );
}
