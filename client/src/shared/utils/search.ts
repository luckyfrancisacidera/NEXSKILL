const SHORT_QUERY_LENGTH = 2;

const SEARCH_TOKEN_PATTERN = /[a-z0-9]+/g;

export const normalizeSearchInput = (value?: string | null) =>
  value?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";

export const tokenizeSearchText = (value?: string | null) =>
  normalizeSearchInput(value).match(SEARCH_TOKEN_PATTERN) ?? [];

// Keeps short queries strict so tiny tokens do not match unrelated words too aggressively.
const fieldMatchesToken = (field: string, fieldTokens: string[], token: string) => {
  if (token.length <= SHORT_QUERY_LENGTH) {
    return fieldTokens.includes(token);
  }

  return field.includes(token);
};

// Evaluates one field against the normalized query used by shared list filtering.
const fieldMatchesQuery = (fieldValue: string, normalizedQuery: string, queryTokens: string[]) => {
  const normalizedField = normalizeSearchInput(fieldValue);
  if (!normalizedField) {
    return false;
  }

  if (queryTokens.length > 1 && normalizedField.includes(normalizedQuery)) {
    return true;
  }

  const fieldTokens = tokenizeSearchText(normalizedField);
  return queryTokens.every((token) => fieldMatchesToken(normalizedField, fieldTokens, token));
};

// Reuses the same search matching rules across recruiter and shared list filters.
export const matchesSearchFields = (fieldValues: Array<string | null | undefined>, query: string) => {
  const normalizedQuery = normalizeSearchInput(query);
  if (!normalizedQuery) {
    return true;
  }

  const queryTokens = tokenizeSearchText(normalizedQuery);
  if (queryTokens.length === 0) {
    return true;
  }

  return fieldValues.some((fieldValue) => fieldMatchesQuery(fieldValue ?? "", normalizedQuery, queryTokens));
};
