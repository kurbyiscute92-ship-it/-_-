export function HeaderBar() {
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

        <span className="text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
          우리 반 실시간 기록장
        </span>
      </div>
    </header>
  );
}
