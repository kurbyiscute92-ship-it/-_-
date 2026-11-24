export type AppRole = 'teacher' | 'student' | null;

export function getRoleFromUrl(): AppRole {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const role = params.get('role');
  if (role === 'teacher') return 'teacher';
  if (role === 'student') return 'student';
  return null;
}

export function buildRoleUrl(role: 'teacher' | 'student'): string {
  if (typeof window === 'undefined') return `?role=${role}`;
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('role', role);
  return url.toString();
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textarea);
      return copied;
    } catch {
      return false;
    }
  }

  return false;
}
