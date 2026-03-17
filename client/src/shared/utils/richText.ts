import DOMPurify from "dompurify";

const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "ul", "ol", "li", "a"];
const ALLOWED_ATTR = ["href", "target", "rel"];
const HAS_HTML_TAGS = /<\/?[a-z][\s\S]*>/i;

const parseHtml = (value: string) => {
  const container = document.createElement("div");
  container.innerHTML = value;
  return container;
};

const normalizeWhitespace = (value: string) =>
  value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

const getNodeText = (value?: string | null) => normalizeWhitespace(value ?? "");

export const sanitizeRichText = (value?: string | null) => {
  const raw = value ?? "";
  if (!raw.trim()) {
    return "";
  }

  const sanitized = DOMPurify.sanitize(raw, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  }).trim();

  if (!sanitized) {
    return "";
  }

  return stripRichText(sanitized) ? sanitized : "";
};

export const stripRichText = (value?: string | null) => {
  const raw = value ?? "";
  if (!raw.trim()) {
    return "";
  }

  const sanitized = DOMPurify.sanitize(raw, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
  const container = parseHtml(sanitized);
  return getNodeText(container.textContent);
};

export const hasRichTextContent = (value?: string | null) => stripRichText(value).length > 0;

export const normalizeStringArray = (values: Array<string | null | undefined>) => {
  const seen = new Set<string>();
  const normalized: string[] = [];

  values.forEach((value) => {
    const next = getNodeText(value);
    if (!next) {
      return;
    }

    const key = next.toLocaleLowerCase();
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    normalized.push(next);
  });

  return normalized;
};

export const extractListItemsFromHtml = (value?: string | null) => {
  const sanitized = sanitizeRichText(value);
  if (!sanitized) {
    return [];
  }

  const container = parseHtml(sanitized);
  const listItems = normalizeStringArray(
    Array.from(container.querySelectorAll("li")).map((item) => item.textContent ?? ""),
  );

  if (listItems.length > 0) {
    return listItems;
  }

  return normalizeStringArray(
    container.innerText
    .split(/\r?\n/)
      .map((item) => item.trim()),
  );
};

export const richTextToList = (value?: string | string[] | null) => {
  if (Array.isArray(value)) {
    return normalizeStringArray(value);
  }

  return extractListItemsFromHtml(value);
};

const blockToPlainText = (node: ChildNode, orderedIndex = 0): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return getNodeText(node.textContent);
  }

  if (!(node instanceof HTMLElement)) {
    return "";
  }

  if (node.tagName === "BR") {
    return "\n";
  }

  if (node.tagName === "LI") {
    const prefix = orderedIndex > 0 ? `${orderedIndex}. ` : "• ";
    return `${prefix}${getNodeText(node.textContent)}`;
  }

  if (node.tagName === "UL" || node.tagName === "OL") {
    const items: string[] = Array.from(node.children)
      .filter((child): child is HTMLLIElement => child instanceof HTMLLIElement)
      .map((child, index) => blockToPlainText(child, node.tagName === "OL" ? index + 1 : 0))
      .filter(Boolean);

    return items.join("\n");
  }

  return getNodeText(node.textContent);
};

export const richTextToPlainText = (value?: string | null) => {
  const sanitized = sanitizeRichText(value);
  if (!sanitized) {
    return "";
  }

  const container = parseHtml(sanitized);
  const blocks = Array.from(container.childNodes)
    .map((node) => blockToPlainText(node))
    .join("\n")
    .split(/\r?\n/)
    .map((line) => getNodeText(line))
    .filter(Boolean);

  if (blocks.length > 0) {
    return blocks.join("\n");
  }

  return getNodeText(container.textContent);
};

export const arrayToRichTextList = (value?: string | string[] | null) => {
  const items = richTextToList(value);
  if (items.length === 0) {
    return "";
  }

  return `<ul>${items
    .map((item) => {
      const escaped = document.createElement("div");
      escaped.textContent = item;
      return `<li><p>${escaped.innerHTML}</p></li>`;
    })
    .join("")}</ul>`;
};

export const plainTextToRichText = (value?: string | null) => {
  const raw = value ?? "";
  if (!raw.trim()) {
    return "";
  }

  if (HAS_HTML_TAGS.test(raw)) {
    return sanitizeRichText(raw);
  }

  const lines = raw
    .replace(/\u00a0/g, " ")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return "";
  }

  return lines
    .map((line) => {
      const escaped = document.createElement("div");
      escaped.textContent = line;
      return `<p>${escaped.innerHTML}</p>`;
    })
    .join("");
};
