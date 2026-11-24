import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || '알 수 없는 오류가 발생했습니다.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                데이터 연결 중 문제가 발생했어요
              </h1>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                잠시 후 다시 시도하거나 새로고침해 주세요. 권한 또는 네트워크 상태 문제일 수 있습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-2 text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>새로고침</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
