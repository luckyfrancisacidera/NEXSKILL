import { richTextToList, stripRichText } from "@shared/utils/richText";

export const splitToBullets = (text?: string | string[]) => richTextToList(text);

export const toList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => stripRichText(String(item)).split(/\r?\n|,|;|•|·/))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return stripRichText(value)
      .split(/\r?\n|,|;|•|·/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};
