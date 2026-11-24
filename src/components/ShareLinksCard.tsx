import { useState } from 'react';
import { Check, Copy, ExternalLink, GraduationCap, Link2, Users } from 'lucide-react';
import { buildRoleUrl, copyTextToClipboard } from '../utils/urlLinks';

export function ShareLinksCard() {
  const [copiedRole, setCopiedRole] = useState<'teacher' | 'student' | null>(null);
  const [copyFailedRole, setCopyFailedRole] = useState<'teacher' | 'student' | null>(null);

  const teacherUrl = buildRoleUrl('teacher');
  const studentUrl = buildRoleUrl('student');

  const handleCopy = async (role: 'teacher' | 'student', url: string) => {
    const ok = await copyTextToClipboard(url);
    if (ok) {
      setCopyFailedRole(null);
      setCopiedRole(role);
      window.setTimeout(() => {
        setCopiedRole((prev) => (prev === role ? null : prev));
      }, 2500);
    } else {
      setCopyFailedRole(role);
    }
  };

  return (
    <section
      aria-label="교사용 및 학생용 접속 링크"
      className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 flex flex-col gap-5"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-11 h-11 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] shrink-0">
          <Link2 className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">교사용 · 학생용 접속 링크</h2>
          <p className="text-sm text-slate-600">
            선생님 화면과 학생 화면 링크가 구별되어 있습니다. 학생에게는 학생용 링크만 공유해 주세요.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Teacher Link */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#0284C7] shrink-0" aria-hidden="true" />
              <h3 className="text-base font-bold text-slate-900">교사용 링크</h3>
            </div>
            <span className="text-xs font-semibold text-[#0369A1]">선생님 전용</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            전체 학생의 아침인사, 달력 기록, 상담 신청 확인 및 명단·날짜 설정을 관리할 수 있어요.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={teacherUrl}
              aria-label="교사용 접속 링크"
              onClick={(e) => e.currentTarget.select()}
              className="flex-1 min-h-10 rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
            />
            <button
              type="button"
              onClick={() => handleCopy('teacher', teacherUrl)}
              className={`inline-flex items-center justify-center gap-1.5 min-h-10 px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                copiedRole === 'teacher'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0284C7] hover:bg-[#0369A1] text-white'
              }`}
            >
              {copiedRole === 'teacher' ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>교사용 복사</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            {copyFailedRole === 'teacher' ? (
              <span className="text-xs text-amber-700 font-medium">
                위 주소창을 눌러 직접 복사해 주세요.
              </span>
            ) : (
              <span className="text-xs text-slate-500">?role=teacher 로 바로 접속</span>
            )}
            <a
              href={teacherUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0284C7] hover:underline whitespace-nowrap"
            >
              <span>새 탭으로 열기</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Student Link */}
        <div className="rounded-2xl bg-[#F0F9FF]/70 border border-[#BAE6FD] p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#4F46E5] shrink-0" aria-hidden="true" />
              <h3 className="text-base font-bold text-slate-900">학생용 링크</h3>
            </div>
            <span className="text-xs font-semibold text-[#4F46E5]">학생 배포용</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            교사 관리 메뉴가 숨겨지고, 학생이 자신의 번호와 이름을 선택해 아침인사·상담 신청만 이용할 수 있어요.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={studentUrl}
              aria-label="학생용 접속 링크"
              onClick={(e) => e.currentTarget.select()}
              className="flex-1 min-h-10 rounded-xl bg-white border border-[#BAE6FD] px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
            <button
              type="button"
              onClick={() => handleCopy('student', studentUrl)}
              className={`inline-flex items-center justify-center gap-1.5 min-h-10 px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                copiedRole === 'student'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white'
              }`}
            >
              {copiedRole === 'student' ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>학생용 복사</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            {copyFailedRole === 'student' ? (
              <span className="text-xs text-amber-700 font-medium">
                위 주소창을 눌러 직접 복사해 주세요.
              </span>
            ) : (
              <span className="text-xs text-slate-500">?role=student 로 바로 접속</span>
            )}
            <a
              href={studentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5] hover:underline whitespace-nowrap"
            >
              <span>새 탭으로 미리보기</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
