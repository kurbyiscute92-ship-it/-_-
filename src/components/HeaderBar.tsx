import { LogOut } from 'lucide-react';

interface HeaderBarProps {
  isAuthenticated: boolean;
  onSignOut: () => void;
}

export function HeaderBar({ isAuthenticated, onSignOut }: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] rounded-md"
        >
          학급경영
        </a>

        <nav
          aria-label="주요 영역 바로가기"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <a
            href="#top"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            화면 선택
          </a>
          <a
            href="#morning-greeting"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            아침인사
          </a>
          <a
            href="#greeting-calendar"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            달력 기록
          </a>
          <a
            href="#counseling-request"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            상담 신청
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 min-h-10 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7]"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>로그아웃</span>
            </button>
          ) : (
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
              Google 로그인 필요
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
