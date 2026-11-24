export type ViewMode = 'teacher' | 'student';
export type TeacherTab = 'care' | 'coupons' | 'settings';

export type CharacterId = 'squirrel' | 'cat' | 'bear' | 'puppy';

export type CouponIconKey =
  | 'music'
  | 'notebook'
  | 'book'
  | 'briefcase'
  | 'pencil'
  | 'cookie'
  | 'footprints'
  | 'gift'
  | 'armchair';

export interface CharacterTheme {
  id: CharacterId;
  label: string;
  pngSrc: string | null;
  avatarBg: string;
  avatarBorder: string;
  accentText: string;
  selectedRing: string;
}

export interface OwnedCoupon {
  instanceId: string;
  couponId: string;
  name: string;
  price: number;
  iconKey: CouponIconKey;
  purchasedAt: string;
  status: 'unused' | 'used';
  usedAt?: string;
}

export interface CouponCatalogItem {
  id: string;
  name: string;
  price: number;
  description: string;
  iconKey: CouponIconKey;
  iconBgClass: string;
  iconTextClass: string;
}

export interface PurchaseHistoryRecord {
  id: string;
  action: 'purchase' | 'use' | 'refund';
  studentId: string;
  studentName: string;
  couponName: string;
  price: number;
  timestamp: string;
}

export interface Student {
  id: string;
  name: string;
  number: number;
  character: CharacterTheme;
  balance: number;
  coupons: OwnedCoupon[];
}

export type MoodId =
  | 'happy'
  | 'excited'
  | 'calm'
  | 'sleepy'
  | 'okay'
  | 'sad'
  | 'angry'
  | 'worried';

export interface MoodOption {
  id: MoodId;
  emoji: string;
  label: string;
}

export interface MorningGreeting {
  id: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  moodId: MoodId;
  moodEmoji: string;
  moodLabel: string;
  reason: string;
  messageToTeacher: string;
  createdAt: string;
  teacherChecked: boolean;
  teacherReply?: string;
}

export type CounselingTopic = '친구 고민' | '공부·숙제' | '마음 이야기' | '기타';
export type CounselingStatus = 'pending' | 'confirmed' | 'completed';

export interface CounselingRequest {
  id: string;
  studentId: string;
  studentName: string;
  topic: CounselingTopic;
  preferredTime: string;
  message: string;
  createdAt: string;
  status: CounselingStatus;
  completedAt?: string;
}

export interface FeedbackNotice {
  id: number;
  type: 'success' | 'warning' | 'info';
  message: string;
}
