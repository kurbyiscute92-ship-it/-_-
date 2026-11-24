import {
  Armchair,
  BookOpen,
  Briefcase,
  Cookie,
  Footprints,
  Gift,
  Music,
  NotebookPen,
  PencilLine,
} from 'lucide-react';
import type { CouponIconKey } from '../types/classroom';

interface CouponIconProps {
  iconKey: CouponIconKey;
  className?: string;
}

export function CouponIcon({ iconKey, className = 'w-5 h-5' }: CouponIconProps) {
  switch (iconKey) {
    case 'music':
      return <Music className={className} aria-hidden="true" />;
    case 'notebook':
      return <NotebookPen className={className} aria-hidden="true" />;
    case 'book':
      return <BookOpen className={className} aria-hidden="true" />;
    case 'briefcase':
      return <Briefcase className={className} aria-hidden="true" />;
    case 'pencil':
      return <PencilLine className={className} aria-hidden="true" />;
    case 'cookie':
      return <Cookie className={className} aria-hidden="true" />;
    case 'footprints':
      return <Footprints className={className} aria-hidden="true" />;
    case 'gift':
      return <Gift className={className} aria-hidden="true" />;
    case 'armchair':
      return <Armchair className={className} aria-hidden="true" />;
  }
}
