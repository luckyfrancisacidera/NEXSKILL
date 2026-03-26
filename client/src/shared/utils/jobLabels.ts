const JOB_LABEL_MAP: Record<string, string> = {
  fulltime: 'Full-time',
  'full-time': 'Full-time',
  parttime: 'Part-time',
  'part-time': 'Part-time',
  internship: 'Internship',
  temporary: 'Temporary',
  freelance: 'Freelance',
  contract: 'Contract',
  onsite: 'On-site',
  'on-site': 'On-site',
  remote: 'Remote',
  hybrid: 'Hybrid',
};

const toDisplayWords = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_\s]+/g, ' ')
    .replace(/full\s*time/gi, 'Full-time')
    .replace(/part\s*time/gi, 'Part-time')
    .replace(/on\s*site/gi, 'On-site')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((segment) => {
      if (/^[A-Z]{2,}$/.test(segment)) {
        return segment;
      }

      return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
    })
    .join(' ');

export const formatJobLabel = (value?: string | null, fallback = 'Not specified') => {
  if (!value?.trim()) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase().replace(/[_\s]+/g, '');
  const mapped = JOB_LABEL_MAP[normalized] ?? JOB_LABEL_MAP[value.trim().toLowerCase()];

  if (mapped) {
    return mapped;
  }

  return toDisplayWords(value);
};

