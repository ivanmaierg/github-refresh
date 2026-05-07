/**
 * Convert a glob-style URL pattern (with `*` and `?`) into a RegExp.
 * - `*` matches any character sequence (including `/`).
 * - `?` matches exactly one character.
 * - All other regex metacharacters are escaped.
 */
export function patternToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`);
}

export function matchesAny(url: string, patterns: string[]): boolean {
  return patterns.some((p) => {
    try {
      return patternToRegex(p).test(url);
    } catch {
      return false;
    }
  });
}

const GITHUB_HOST = /^https:\/\/([a-z0-9-]+\.)*github\.com(\/|$)/i;

export function isGitHubUrl(url: string | undefined): boolean {
  if (!url) return false;
  return GITHUB_HOST.test(url);
}

export function isValidPattern(pattern: string): boolean {
  if (!pattern.trim()) return false;
  if (!pattern.startsWith('https://') && !pattern.startsWith('http://')) return false;
  try {
    patternToRegex(pattern);
    return true;
  } catch {
    return false;
  }
}
