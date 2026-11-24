import { CheckCircle2, Coins, History, RotateCcw, ShoppingBag, Ticket } from 'lucide-react';
import type {
  CouponCatalogItem,
  PurchaseHistoryRecord,
  Student,
  ViewMode,
} from '../types/classroom';
import { CharacterAvatar } from './CharacterAvatar';
import { CouponIcon } from './CouponIcon';

interface CouponShopSectionProps {
  viewMode: ViewMode;
  students: Student[];
  selectedStudent: Student;
  couponCatalog: CouponCatalogItem[];
  purchaseHistory: PurchaseHistoryRecord[];
  onSelectStudent?: (studentId: string) => void;
  onAdjustBalance?: (studentId: string, delta: number) => void;
  onBuyCoupon: (coupon: CouponCatalogItem) => void;
  onUseCoupon: (studentId: string, instanceId: string) => void;
  onRefundCoupon?: (studentId: string, instanceId: string) => void;
}

export function CouponShopSection({
  viewMode,
  students,
  selectedStudent,
  couponCatalog,
  purchaseHistory,
  onSelectStudent,
  onAdjustBalance,
  onBuyCoupon,
  onUseCoupon,
  onRefundCoupon,
}: CouponShopSectionProps) {
  const unusedCoupons = selectedStudent.coupons.filter((c) => c.status === 'unused');
  const usedCoupons = selectedStudent.coupons.filter((c) => c.status === 'used');

  return (
    <section
      id="coupon-shop"
      aria-labelledby="coupon-shop-heading"
      className="flex flex-col gap-6"
    >
      {/* Teacher-only: Student Balances Overview & +/- Adjust */}
      {viewMode === 'teacher' && onSelectStudent && onAdjustBalance && (
        <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">학생별 잔액 관리</h2>
                <p className="text-xs text-slate-600">
                  학생을 선택해 쿠폰을 대신 구매·사용·환불하거나 잔액(P)을 지급·차감할 수 있어요.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500 tabular-nums">
              선택된 학생: <strong className="text-[#0284C7]">{selectedStudent.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {students.map((student) => {
              const isSelected = student.id === selectedStudent.id;
              const studentUnusedCount = student.coupons.filter(
                (c) => c.status === 'unused'
              ).length;

              return (
                <div
                  key={student.id}
                  onClick={() => onSelectStudent(student.id)}
                  className={`rounded-2xl border p-4 flex flex-col gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#F0F9FF] border-[#0284C7]'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CharacterAvatar character={student.character} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {student.number}번 {student.name}
                        </p>
                        <p className="text-xs text-slate-500 tabular-nums">
                          미사용 쿠폰 {studentUnusedCount}장
                        </p>
                      </div>
                    </div>

                    <span className="text-base font-bold text-amber-700 tabular-nums whitespace-nowrap">
                      {student.balance}P
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onAdjustBalance(student.id, -1)}
                      disabled={student.balance <= 0}
                      className="flex-1 min-h-9 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      -1P 차감
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdjustBalance(student.id, 1)}
                      className="flex-1 min-h-9 px-2.5 py-1 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-xl transition-colors cursor-pointer"
                    >
                      +1P 지급
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Coupon Shop + Selected Student's Coupon Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Coupon Shop */}
        <div className="lg:col-span-8 rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id="coupon-shop-heading" className="text-xl font-bold text-slate-900">
                  학급 쿠폰 상점 ({couponCatalog.length}종)
                </h2>
                <p className="text-sm text-slate-600">
                  쿠폰을 구매하면 잔액이 차감되고 내 쿠폰함에 바로 저장됩니다.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-900 tabular-nums self-start sm:self-auto whitespace-nowrap">
              {selectedStudent.name} 잔액:{' '}
              <strong className="text-amber-700">{selectedStudent.balance}P</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {couponCatalog.map((coupon) => {
              const canAfford = selectedStudent.balance >= coupon.price;
              const shortage = coupon.price - selectedStudent.balance;

              return (
                <article
                  key={coupon.id}
                  className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${coupon.iconBgClass} ${coupon.iconTextClass}`}
                      >
                        <CouponIcon iconKey={coupon.iconKey} className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-amber-700 tabular-nums whitespace-nowrap">
                        {coupon.price}P
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">{coupon.name}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {coupon.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onBuyCoupon(coupon)}
                    className={`w-full min-h-10 px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                      canAfford
                        ? 'text-white bg-[#0284C7] hover:bg-[#0369A1]'
                        : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {canAfford
                      ? `구매하기 (${coupon.price}P)`
                      : `잔액 부족 (${shortage}P 더 필요)`}
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Student's Coupon Box */}
        <div className="lg:col-span-4 rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] text-[#4F46E5] flex items-center justify-center shrink-0">
                <Ticket className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedStudent.name}의 쿠폰함
                </h2>
                <p className="text-xs text-slate-500 tabular-nums">
                  미사용 {unusedCoupons.length}장 · 사용 완료 {usedCoupons.length}장
                </p>
              </div>
            </div>
            <CharacterAvatar character={selectedStudent.character} size="xs" />
          </div>

          {selectedStudent.coupons.length === 0 ? (
            <div className="rounded-xl bg-slate-50 border border-dashed border-slate-300 p-5 text-center">
              <p className="text-sm font-semibold text-slate-700">보유한 쿠폰이 아직 없어요.</p>
              <p className="text-xs text-slate-500 mt-1">
                쿠폰 상점에서 원하는 쿠폰을 구매해 보세요.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-0.5">
              {selectedStudent.coupons.map((owned) => {
                const isUsed = owned.status === 'used';
                return (
                  <li
                    key={owned.instanceId}
                    className={`rounded-2xl border p-3.5 flex flex-col gap-2.5 ${
                      isUsed
                        ? 'bg-slate-50/70 border-slate-200 opacity-80'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CouponIcon
                          iconKey={owned.iconKey}
                          className="w-4 h-4 text-slate-700 shrink-0"
                        />
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {owned.name}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold whitespace-nowrap ${
                          isUsed ? 'text-emerald-700' : 'text-[#0284C7]'
                        }`}
                      >
                        {isUsed ? '사용 완료' : '미사용'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 tabular-nums">
                      {owned.price}P · {owned.purchasedAt} 구매
                      {isUsed && owned.usedAt ? ` · ${owned.usedAt} 사용` : ''}
                    </p>

                    {!isUsed ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onUseCoupon(selectedStudent.id, owned.instanceId)}
                          className="flex-1 inline-flex items-center justify-center gap-1 min-h-9 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>사용하기</span>
                        </button>
                        {viewMode === 'teacher' && onRefundCoupon && (
                          <button
                            type="button"
                            onClick={() => onRefundCoupon(selectedStudent.id, owned.instanceId)}
                            className="inline-flex items-center justify-center gap-1 min-h-9 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>환불</span>
                          </button>
                        )}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Purchase & Usage History */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <History className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {viewMode === 'student'
                  ? `${selectedStudent.name}의 최근 구매 · 사용 기록`
                  : '우리 반 최근 구매 · 사용 기록'}
              </h3>
              <p className="text-xs text-slate-500">
                {viewMode === 'student'
                  ? '내가 구매하거나 사용한 쿠폰 기록만 표시됩니다.'
                  : '쿠폰 구매, 사용, 환불 내역이 자동으로 저장됩니다.'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 tabular-nums whitespace-nowrap">
            {purchaseHistory.length}건
          </span>
        </div>

        {purchaseHistory.length === 0 ? (
          <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            아직 쿠폰 구매나 사용 기록이 없어요.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {purchaseHistory.slice(0, 12).map((record) => (
              <li
                key={record.id}
                className="py-2.5 flex items-center justify-between gap-3 text-sm"
              >
                <div className="min-w-0 flex items-center gap-2">
                  <span
                    className={`text-xs font-bold whitespace-nowrap ${
                      record.action === 'purchase'
                        ? 'text-[#0284C7]'
                        : record.action === 'use'
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {record.action === 'purchase'
                      ? '구매'
                      : record.action === 'use'
                      ? '사용'
                      : '환불'}
                  </span>
                  <span className="text-slate-300" aria-hidden="true">
                    ·
                  </span>
                  <span className="font-semibold text-slate-900 truncate">
                    {viewMode === 'teacher' ? `${record.studentName} · ` : ''}
                    {record.couponName}
                  </span>
                </div>
                <div className="text-xs text-slate-500 tabular-nums whitespace-nowrap shrink-0">
                  {record.price}P · {record.timestamp}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
