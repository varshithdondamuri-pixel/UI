import { DatasetCategory, DesignStyleLabel, IndustryLabel } from './DatasetTypes';

export const VALID_DATASET_CATEGORIES: DatasetCategory[] = [
  'ui_understanding',
  'semantic_understanding',
  'intent_understanding',
  'layout',
  'components',
  'responsive',
  'typography',
  'colors',
  'spacing',
  'ux',
  'accessibility',
  'animation',
  'visual_design',
  'design_system',
  'industry',
  'design_style',
  'trend',
  'preference',
  'iteration',
  'quality',
  'code_generation',
  'code_repair'
];

export const VALID_INDUSTRIES: IndustryLabel[] = [
  'SaaS',
  'AI',
  'Fintech',
  'Healthcare',
  'Education',
  'E-commerce',
  'Travel',
  'Food',
  'Social',
  'Productivity',
  'Developer Tools',
  'Media',
  'Portfolio',
  'Agency',
  'Enterprise',
  'Other'
];

export const VALID_DESIGN_STYLES: DesignStyleLabel[] = [
  'Minimal',
  'Modern SaaS',
  'Enterprise',
  'Editorial',
  'Luxury',
  'Playful',
  'Brutalist',
  'Neobrutalist',
  'Glass',
  'Dark',
  'Light',
  'Material',
  'Apple-inspired',
  'Dashboard',
  'Bento',
  'Experimental',
  'Other'
];

/**
 * Privacy Sanitizer: Strips sensitive credentials, API keys, passwords,
 * tokens, credit card patterns, SSNs, and unnecessary personal data.
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  let sanitized = String(text);

  // API Key patterns (e.g. sk-..., gcp-..., Bearer ...)
  sanitized = sanitized.replace(/(api[_-]?key|secret|token|password|auth|bearer)\s*[:=]\s*['"]?[a-zA-Z0-9_\-\.]{8,}['"]?/gi, '$1: [REDACTED]');
  sanitized = sanitized.replace(/sk-[a-zA-Z0-9]{20,}/g, '[REDACTED_API_KEY]');

  // Email addresses
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');

  // Phone numbers (basic international/us patterns)
  sanitized = sanitized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED_PHONE]');

  // Credit card patterns
  sanitized = sanitized.replace(/\b(?:\d[ -]*?){13,16}\b/g, '[REDACTED_CARD]');

  return sanitized;
}

export function sanitizeSampleData<T>(data: T): T {
  if (!data) return data;
  if (typeof data === 'string') {
    return sanitizeText(data) as any;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeSampleData(item)) as any;
  }
  if (typeof data === 'object') {
    const copy: any = {};
    for (const key of Object.keys(data as any)) {
      // Omit sensitive field keys if accidentally present
      if (/password|secret|token|apikey|auth_token|credit_card|ssn/i.test(key)) {
        copy[key] = '[REDACTED]';
      } else {
        copy[key] = sanitizeSampleData((data as any)[key]);
      }
    }
    return copy;
  }
  return data;
}

export function isValidCategory(cat: string): cat is DatasetCategory {
  return VALID_DATASET_CATEGORIES.includes(cat as DatasetCategory);
}

export function isValidIndustry(ind: string): ind is IndustryLabel {
  return VALID_INDUSTRIES.includes(ind as IndustryLabel);
}

export function isValidStyle(style: string): style is DesignStyleLabel {
  return VALID_DESIGN_STYLES.includes(style as DesignStyleLabel);
}
