import { useState } from 'react';
import type { CharacterId, CharacterTheme } from '../types/classroom';

interface CharacterAvatarProps {
  character: CharacterTheme;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<CharacterAvatarProps['size']>, string> = {
  xs: 'w-7 h-7 rounded-lg',
  sm: 'w-11 h-11 rounded-xl',
  md: 'w-16 h-16 rounded-2xl',
  lg: 'w-20 h-20 rounded-2xl',
};

function CharacterSvg({ id }: { id: CharacterId }) {
  switch (id) {
    case 'squirrel':
      return (
        <svg viewBox="0 0 64 64" className="w-[82%] h-[82%]" aria-hidden="true">
          {/* Fluffy tail hint */}
          <circle cx="48" cy="40" r="11" fill="#FDBA74" />
          {/* Ears */}
          <ellipse cx="21" cy="18" rx="5.5" ry="9" fill="#EA8C46" />
          <ellipse cx="43" cy="18" rx="5.5" ry="9" fill="#EA8C46" />
          <ellipse cx="21" cy="18" rx="2.8" ry="5" fill="#FDE0C6" />
          <ellipse cx="43" cy="18" rx="2.8" ry="5" fill="#FDE0C6" />
          {/* Head */}
          <circle cx="32" cy="35" r="18" fill="#F59E56" />
          {/* Cheeks & muzzle */}
          <ellipse cx="32" cy="41" rx="11" ry="8" fill="#FFF4EA" />
          <circle cx="21" cy="38" r="3.2" fill="#FDA4AF" opacity="0.7" />
          <circle cx="43" cy="38" r="3.2" fill="#FDA4AF" opacity="0.7" />
          {/* Eyes */}
          <circle cx="25" cy="32" r="2.6" fill="#3E2723" />
          <circle cx="39" cy="32" r="2.6" fill="#3E2723" />
          <circle cx="25.8" cy="31.2" r="0.9" fill="#FFFFFF" />
          <circle cx="39.8" cy="31.2" r="0.9" fill="#FFFFFF" />
          {/* Nose & smile */}
          <ellipse cx="32" cy="37" rx="2.5" ry="1.8" fill="#5D4037" />
          <path d="M29 40.5 Q32 43 35 40.5" fill="none" stroke="#5D4037" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'cat':
      return (
        <svg viewBox="0 0 64 64" className="w-[82%] h-[82%]" aria-hidden="true">
          {/* Pointy ears */}
          <polygon points="15,30 18,12 29,22" fill="#F9A8D4" />
          <polygon points="49,30 46,12 35,22" fill="#F9A8D4" />
          <polygon points="18,27 20,16 26,23" fill="#FFF1F5" />
          <polygon points="46,27 44,16 38,23" fill="#FFF1F5" />
          {/* Head */}
          <ellipse cx="32" cy="36" rx="19" ry="17" fill="#FBCFE8" />
          {/* Forehead stripes */}
          <path d="M32 20 V25 M27 21 L28 25 M37 21 L36 25" stroke="#EC4899" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
          {/* Cheeks */}
          <circle cx="20" cy="39" r="3.4" fill="#F472B6" opacity="0.45" />
          <circle cx="44" cy="39" r="3.4" fill="#F472B6" opacity="0.45" />
          {/* Eyes */}
          <circle cx="25" cy="34" r="2.6" fill="#3B2F2F" />
          <circle cx="39" cy="34" r="2.6" fill="#3B2F2F" />
          <circle cx="25.8" cy="33.2" r="0.9" fill="#FFFFFF" />
          <circle cx="39.8" cy="33.2" r="0.9" fill="#FFFFFF" />
          {/* Whiskers */}
          <path d="M12 36 H18 M12 40 H18 M46 36 H52 M46 40 H52" stroke="#9D174D" strokeWidth="1.3" strokeLinecap="round" opacity="0.45" />
          {/* Nose & mouth */}
          <polygon points="30,38 34,38 32,40.5" fill="#BE185D" />
          <path d="M29 42 Q32 44.5 35 42" fill="none" stroke="#831843" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'bear':
      return (
        <svg viewBox="0 0 64 64" className="w-[82%] h-[82%]" aria-hidden="true">
          {/* Round ears */}
          <circle cx="18" cy="21" r="7" fill="#93C5FD" />
          <circle cx="46" cy="21" r="7" fill="#93C5FD" />
          <circle cx="18" cy="21" r="3.8" fill="#EFF6FF" />
          <circle cx="46" cy="21" r="3.8" fill="#EFF6FF" />
          {/* Head */}
          <circle cx="32" cy="36" r="18.5" fill="#BFDBFE" />
          {/* Muzzle */}
          <ellipse cx="32" cy="41" rx="8.5" ry="6.5" fill="#FFFFFF" />
          {/* Cheeks */}
          <circle cx="20" cy="39" r="3.2" fill="#FDA4AF" opacity="0.6" />
          <circle cx="44" cy="39" r="3.2" fill="#FDA4AF" opacity="0.6" />
          {/* Eyes */}
          <circle cx="24.5" cy="33" r="2.5" fill="#1E293B" />
          <circle cx="39.5" cy="33" r="2.5" fill="#1E293B" />
          <circle cx="25.3" cy="32.2" r="0.9" fill="#FFFFFF" />
          <circle cx="40.3" cy="32.2" r="0.9" fill="#FFFFFF" />
          {/* Nose & smile */}
          <ellipse cx="32" cy="38.5" rx="2.8" ry="2" fill="#1E3A8A" />
          <path d="M29 42.5 Q32 44.8 35 42.5" fill="none" stroke="#1E3A8A" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'puppy':
      return (
        <svg viewBox="0 0 64 64" className="w-[82%] h-[82%]" aria-hidden="true">
          {/* Floppy ears */}
          <ellipse cx="15" cy="34" rx="5.5" ry="11" transform="rotate(14 15 34)" fill="#6EE7B7" />
          <ellipse cx="49" cy="34" rx="5.5" ry="11" transform="rotate(-14 49 34)" fill="#6EE7B7" />
          {/* Head */}
          <circle cx="32" cy="35" r="18" fill="#D1FAE5" />
          {/* Eye patch */}
          <circle cx="25" cy="33" r="5.5" fill="#A7F3D0" />
          {/* Muzzle */}
          <ellipse cx="32" cy="41" rx="8.5" ry="6" fill="#FFFFFF" />
          {/* Cheeks */}
          <circle cx="20" cy="39" r="3" fill="#FDA4AF" opacity="0.6" />
          <circle cx="44" cy="39" r="3" fill="#FDA4AF" opacity="0.6" />
          {/* Eyes */}
          <circle cx="25" cy="33" r="2.6" fill="#1F2937" />
          <circle cx="39" cy="33" r="2.6" fill="#1F2937" />
          <circle cx="25.8" cy="32.2" r="0.9" fill="#FFFFFF" />
          <circle cx="39.8" cy="32.2" r="0.9" fill="#FFFFFF" />
          {/* Nose & happy mouth */}
          <ellipse cx="32" cy="38.5" rx="2.8" ry="2" fill="#065F46" />
          <path d="M29 42 Q32 45 35 42" fill="none" stroke="#065F46" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
  }
}

export function CharacterAvatar({ character, size = 'md', className = '' }: CharacterAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showPng = Boolean(character.pngSrc) && !imgFailed;

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 overflow-hidden border ${character.avatarBg} ${character.avatarBorder} ${SIZE_CLASSES[size]} ${className}`}
    >
      {showPng ? (
        <img
          src={character.pngSrc!}
          alt={`${character.label} 캐릭터`}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain p-0.5"
        />
      ) : (
        <CharacterSvg id={character.id} />
      )}
    </div>
  );
}
