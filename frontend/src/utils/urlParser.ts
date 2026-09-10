/**
 * URL Parser and Formatter Utility for Yojana Dvar Frontend
 * Automatically identifies URLs, PDF links, and converts raw narrative text into hyperlinked React segments.
 */

export interface ExtractedLink {
  url: string;
  isPdf: boolean;
  domain: string;
}

const URL_REGEX = /(https?:\/\/[^\s"'\)<>]+|www\.[^\s"'\)<>]+)/gi;

export function extractUrls(text: string): ExtractedLink[] {
  if (!text) return [];
  const matches = text.match(URL_REGEX) || [];
  return matches.map((m) => {
    let clean = m.trim().replace(/[.,;:!?)'"`>]+$/, '');
    if (clean.startsWith('www.')) {
      clean = `https://${clean}`;
    }
    let domain = '';
    try {
      const parsed = new URL(clean);
      domain = parsed.hostname.replace(/^www\./, '');
    } catch {
      domain = clean;
    }
    return {
      url: clean,
      isPdf: clean.toLowerCase().endsWith('.pdf') || clean.toLowerCase().includes('.pdf?'),
      domain,
    };
  });
}

export function isGovDomain(url: string): boolean {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return (
      hostname.endsWith('.gov.in') ||
      hostname.endsWith('.nic.in') ||
      hostname.endsWith('.gov') ||
      hostname.endsWith('.nic') ||
      hostname.endsWith('.org.in') ||
      hostname.endsWith('.res.in') ||
      hostname.endsWith('.ac.in') ||
      hostname.endsWith('.edu.in')
    );
  } catch {
    return false;
  }
}
