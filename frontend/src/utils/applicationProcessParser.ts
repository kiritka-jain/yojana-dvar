/**
 * Utility to parse narrative government application guidelines into structured steps (Ticket YD-I18N-203).
 * Supports bilingual step markers ('Step 1', 'चरण 1', '1.', etc.) and preserves embedded URLs/PDFs.
 */

export interface StepLink {
  url: string;
  label: string;
  isPdf: boolean;
  domain: string;
}

export interface ProcessStep {
  stepIndex: number;
  stepNumberLabel: string; // e.g. "1" or "१"
  stepBadge: string; // e.g. "Step 1" or "चरण 1"
  content: string;
  links: StepLink[];
}

const DEVANAGARI_DIGITS: Record<string, string> = {
  '0': '०',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९'
};

export const toDevanagariNumber = (num: number | string): string => {
  return String(num)
    .split('')
    .map((ch) => DEVANAGARI_DIGITS[ch] || ch)
    .join('');
};

/**
 * Extracts and categorizes links and emails from raw text.
 */
export const extractStepLinks = (text: string): StepLink[] => {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s"'\)<>]+|www\.[^\s"'\)<>]+|[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/gi;
  const matches = text.match(urlRegex) || [];
  const links: StepLink[] = [];
  const seen = new Set<string>();

  for (const raw of matches) {
    let clean = raw.trim().replace(/[.,;:!?)'"`>]+$/, '');
    if (seen.has(clean.toLowerCase())) continue;
    seen.add(clean.toLowerCase());

    const isEmail = clean.includes('@') && !clean.startsWith('http');
    let fullUrl = clean;
    if (clean.startsWith('www.')) {
      fullUrl = `https://${clean}`;
    } else if (isEmail) {
      fullUrl = `mailto:${clean}`;
    }

    let domain = clean;
    try {
      if (!isEmail) {
        const parsed = new URL(fullUrl);
        domain = parsed.hostname;
      }
    } catch {
      domain = clean;
    }

    const isPdf = clean.toLowerCase().endsWith('.pdf') || clean.toLowerCase().includes('.pdf?');
    links.push({
      url: fullUrl,
      label: isPdf ? 'Download Form PDF' : (isEmail ? clean : domain),
      isPdf,
      domain
    });
  }

  return links;
};

/**
 * Parses application process narrative into structured step objects.
 */
export const parseApplicationSteps = (
  text: string,
  language: 'en' | 'hi' = 'en'
): ProcessStep[] => {
  if (!text || !text.trim()) return [];

  const rawText = text.trim();

  // Pattern matching: Step X: or चरण X: or 1. or 1)
  const stepSplitRegex = /(?:^|\s+|\n+)(?:(?:Step|चरण)\s*(\d+)|(\d+)\s*[\.\)\]])[\s*:\.\-]+/gi;

  const stepSegments: { stepNum: number; content: string }[] = [];
  let match: RegExpExecArray | null;
  const indices: { index: number; stepNum: number; fullMatchLen: number }[] = [];

  while ((match = stepSplitRegex.exec(rawText)) !== null) {
    const num = parseInt(match[1] || match[2], 10);
    indices.push({
      index: match.index,
      stepNum: isNaN(num) ? indices.length + 1 : num,
      fullMatchLen: match[0].length
    });
  }

  if (indices.length > 0) {
    for (let i = 0; i < indices.length; i++) {
      const current = indices[i];
      const startContent = current.index + current.fullMatchLen;
      const endContent = i + 1 < indices.length ? indices[i + 1].index : rawText.length;
      const content = rawText.substring(startContent, endContent).trim();

      if (content) {
        stepSegments.push({
          stepNum: current.stepNum,
          content
        });
      }
    }
  }

  // If regex found structured steps
  if (stepSegments.length > 0) {
    return stepSegments.map((segment, idx) => {
      const stepIndex = idx + 1;
      const stepNum = segment.stepNum || stepIndex;
      const numLabel = language === 'hi' ? toDevanagariNumber(stepNum) : String(stepNum);
      const prefix = language === 'hi' ? 'चरण' : 'Step';
      const stepBadge = `${prefix} ${numLabel}`;

      return {
        stepIndex,
        stepNumberLabel: numLabel,
        stepBadge,
        content: segment.content,
        links: extractStepLinks(segment.content)
      };
    });
  }

  // Fallback: split by sentences or paragraphs if no explicit "Step 1" markers
  const sentences = rawText
    .split(/(?<=[.।\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length > 1) {
    return sentences.map((sentence, idx) => {
      const stepIndex = idx + 1;
      const numLabel = language === 'hi' ? toDevanagariNumber(stepIndex) : String(stepIndex);
      const prefix = language === 'hi' ? 'चरण' : 'Step';
      const stepBadge = `${prefix} ${numLabel}`;

      return {
        stepIndex,
        stepNumberLabel: numLabel,
        stepBadge,
        content: sentence,
        links: extractStepLinks(sentence)
      };
    });
  }

  // Single block fallback
  const numLabel = language === 'hi' ? '१' : '1';
  const prefix = language === 'hi' ? 'चरण' : 'Step';
  return [
    {
      stepIndex: 1,
      stepNumberLabel: numLabel,
      stepBadge: `${prefix} ${numLabel}`,
      content: rawText,
      links: extractStepLinks(rawText)
    }
  ];
};
