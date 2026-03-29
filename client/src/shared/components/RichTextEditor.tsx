import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  RemoveFormatting,
  RotateCcw,
  Underline as UnderlineIcon,
} from "lucide-react";
import { useMediaQuery } from "@shared/hooks/useMediaQuery";
import { cn } from "@shared/utils/cn";

interface RichTextEditorProps {
  id?: string;
  label?: string;
  describedBy?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  minHeightClassName?: string;
  error?: string;
}

export const RichTextEditor = ({
  id,
  label,
  describedBy,
  value,
  onChange,
  placeholder,
  className,
  editorClassName,
  minHeightClassName = "min-h-[180px]",
  error,
}: RichTextEditorProps) => {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "",
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id: id ?? "",
        "aria-label": label ?? placeholder ?? "Rich text editor",
        "aria-describedby": describedBy ?? "",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentHtml = editor.getHTML();
    if (currentHtml !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const applyLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const nextUrl = window.prompt("Enter a link URL", previousUrl ?? "https://");

    if (nextUrl === null) {
      return;
    }

    const normalized = nextUrl.trim();
    if (!normalized) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: normalized }).run();
  };

  const toolbarButtonClassName = (isActive = false) =>
    cn(
      "inline-flex shrink-0 items-center justify-center rounded-lg border transition",
      isMobile ? "h-8 w-8" : "h-9 w-9",
      isActive
        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
        : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white",
    );

  const toolbarActions = [
    {
      key: "bold",
      label: "Bold",
      isActive: editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
      icon: <Bold className="h-4 w-4" />,
    },
    {
      key: "italic",
      label: "Italic",
      isActive: editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
      icon: <Italic className="h-4 w-4" />,
    },
    {
      key: "underline",
      label: "Underline",
      isActive: editor.isActive("underline"),
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      icon: <UnderlineIcon className="h-4 w-4" />,
    },
    {
      key: "bullet-list",
      label: "Bullet list",
      isActive: editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      icon: <List className="h-4 w-4" />,
    },
    {
      key: "ordered-list",
      label: "Numbered list",
      isActive: editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      icon: <ListOrdered className="h-4 w-4" />,
    },
    {
      key: "link",
      label: "Add link",
      isActive: editor.isActive("link"),
      onClick: applyLink,
      icon: <Link2 className="h-4 w-4" />,
    },
    ...(!isMobile
      ? [
          {
            key: "clear-formatting",
            label: "Clear formatting",
            isActive: false,
            onClick: () => editor.chain().focus().unsetAllMarks().clearNodes().run(),
            icon: <RemoveFormatting className="h-4 w-4" />,
          },
        ]
      : []),
  ];

  return (
    <div className={cn("rich-text-editor min-w-0 overflow-hidden", className)}>
      <div className="rich-text-toolbar flex items-center justify-between gap-2 rounded-t-2xl border border-b-0 border-zinc-200 bg-zinc-50 px-2.5 py-2 dark:border-zinc-700 dark:bg-zinc-900 sm:px-3">
        <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto overflow-y-hidden pr-2 sm:flex-wrap sm:overflow-visible">
          {toolbarActions.map((action) => (
            <button
              key={action.key}
              type="button"
              aria-label={action.label}
              title={action.label}
              className={toolbarButtonClassName(action.isActive)}
              onClick={action.onClick}
            >
              {action.icon}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button type="button" aria-label="Undo" title="Undo" className={toolbarButtonClassName()} onClick={() => editor.chain().focus().undo().run()}>
            <RotateCcw className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Redo" title="Redo" className={toolbarButtonClassName()} onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <EditorContent
        editor={editor}
        className={cn(
          "rich-text-content rich-text-editor-content min-w-0 rounded-b-2xl border border-zinc-200 bg-white px-0 py-0 dark:border-zinc-700 dark:bg-zinc-950",
          minHeightClassName,
          editorClassName,
          error ? "is-invalid" : "",
        )}
      />
      {error ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p> : null}
    </div>
  );
};
