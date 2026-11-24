import { useState, type FormEvent } from 'react';
import { ArrowRight, Calendar, Lock, UserCheck } from 'lucide-react';
import type { Student } from '../types/classroom';
import { formatKoreanDate } from '../utils/dateUtils';
import { CharacterAvatar } from './CharacterAvatar';

interface StudentConnectScreenProps {
  students: Student[];
  activeDate: string;
  onConnect: (studentId: string) => void;
}

export function StudentConnectScreen({
  students,
  activeDate,
  onConnect,
}: StudentConnectScreenProps) {
  const [selectedId, setSelectedId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const sortedStudents = [...students].sort((a, b) => a.number - b.number);
  const chosenStudent = sortedStudents.find((s) => s.id === selectedId) ?? null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!chosenStudent) {
      setError('본인의 번호와 이름을 먼저 선택해 주세요.');
      return;
    }
    setError('');
    onConnect(chosenStudent.id);
  };

  return (
    <section
      aria-labelledby="student-connect-heading"
      className="max-w-3xl w-full mx-auto rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 flex flex-col gap-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] shrink-0">
            <UserCheck className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 id="student-connect-heading" className="text-xl sm:text-2xl font-bold text-slate-900">
              내 번호와 이름 선택해서 접속하기
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              본인의 번호와 이름을 선택하면 나만의 아침인사와 상담 신청 화면으로 들어가요.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0 tabular-nums">
          <Calendar className="w-4 h-4 text-[#0284C7]" aria-hidden="true" />
          <span>{formatKoreanDate(activeDate)}</span>
        </div>
      </div>

      <div className="rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] px-4 py-3 flex items-center gap-2.5 text-sm text-[#0C4A6E]">
        <Lock className="w-4 h-4 shrink-0 text-[#0284C7]" aria-hidden="true" />
        <span>접속 후 내가 남긴 기분과 상담 이야기는 선생님만 확인할 수 있고, 다른 친구에게는 보이지 않아요.</span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Dropdown Selector (Number + Name) */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="student-number-name-select" className="text-sm font-bold text-slate-900">
            1. 번호와 이름으로 빠르게 찾기
          </label>
          <select
            id="student-number-name-select"
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              if (error) setError('');
            }}
            className="w-full min-h-12 rounded-xl bg-white border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0284C7] cursor-pointer"
          >
            <option value="">-- 내 번호와 이름을 선택해 주세요 --</option>
            {sortedStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.number}번 · {student.name}
              </option>
            ))}
          </select>
        </div>

        {/* Visual Grid Picker */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-slate-900">
            2. 또는 아래 명단에서 내 이름 누르기
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {sortedStudents.map((student) => {
              const isSelected = student.id === selectedId;
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(student.id);
                    if (error) setError('');
                  }}
                  aria-pressed={isSelected}
                  className={`rounded-2xl border p-3.5 flex flex-col items-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] ${
                    isSelected
                      ? 'bg-[#E0F2FE] border-[#0284C7] ring-2 ring-[#0284C7]/30'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CharacterAvatar character={student.character} size="sm" />
                  <div className="text-center">
                    <p className="text-xs font-bold text-[#0369A1] tabular-nums">
                      {student.number}번
                    </p>
                    <p className="text-sm font-bold text-slate-900">{student.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-xs font-semibold text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={!chosenStudent}
          className="inline-flex items-center justify-center gap-2 min-h-12 px-5 py-3 text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-slate-300 disabled:text-slate-500 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7]"
        >
          <span>
            {chosenStudent
              ? `${chosenStudent.number}번 ${chosenStudent.name} 학생으로 접속하기`
              : '번호와 이름을 선택해 주세요'}
          </span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
