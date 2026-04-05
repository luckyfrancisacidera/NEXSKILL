import { cn } from "@shared/utils/cn";
import { sanitizeRichText } from "@shared/utils/richText";

interface RichTextContentProps {
  html?: string | null;
  className?: string;
  emptyFallback?: string;
}

export const RichTextContent = ({
  html,
  className,
  emptyFallback,
}: RichTextContentProps) => {
  const sanitized = sanitizeRichText(html);

  const renderHtml = (() => {
    if (!sanitized) {
      return "";
    }

    if (/<\/?[a-z][\s\S]*>/i.test(sanitized)) {
      return sanitized;
    }

    const container = document.createElement("div");
    container.textContent = sanitized;
    return container.innerHTML.replace(/\r?\n/g, "<br />");
  })();

  if (!renderHtml) {
    return emptyFallback ? (
      <p className={cn("text-sm text-zinc-500 dark:text-zinc-400", className)}>
        {emptyFallback}
      </p>
    ) : null;
  }

  return (
    <div
      className={cn("rich-text-content text-sm leading-7 text-zinc-700 dark:text-zinc-300", className)}
      dangerouslySetInnerHTML={{ __html: renderHtml }}
    />
  );
};
