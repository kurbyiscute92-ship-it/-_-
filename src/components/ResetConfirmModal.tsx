import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResetConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
}: ResetConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-confirm-title"
        aria-describedby="reset-confirm-desc"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-xl flex flex-col gap-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="reset-confirm-title" className="text-lg font-bold text-slate-900">
                전체 데이터를 초기화할까요?
              </h2>
              <p className="text-xs font-medium text-red-700 mt-0.5">
                초기화 후에는 되돌릴 수 없어요
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="확인 창 닫기"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div
          id="reset-confirm-desc"
          className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed space-y-1.5"
        >
          <p>
            저장된 <strong>학생 명단 수정 내용, 설정 날짜, 모든 아침인사 기록, 상담 신청 내역, 작성 중인 내용</strong>이 모두 삭제됩니다.
          </p>
          <p className="text-slate-600 text-xs">
            초기화하면 처음의 가상 학생 4명(민준, 서아, 지우, 하준)과 기본 상태로 돌아갑니다.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className="min-h-11 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-11 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            전체 초기화 실행
          </button>
        </div>
      </div>
    </div>
  );
}
