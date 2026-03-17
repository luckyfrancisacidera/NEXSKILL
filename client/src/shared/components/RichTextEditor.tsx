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
      "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition",
      isActive
        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
        : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white",
    );

  return (
    <div className={cn("rich-text-editor", className)}>
      <div className="rich-text-toolbar flex flex-wrap items-center gap-2 rounded-t-2xl border border-b-0 border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
        <button type="button" aria-label="Bold" title="Bold" className={toolbarButtonClassName(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Italic" title="Italic" className={toolbarButtonClassName(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Underline" title="Underline" className={toolbarButtonClassName(editor.isActive("underline"))} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Bullet list" title="Bullet list" className={toolbarButtonClassName(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Numbered list" title="Numbered list" className={toolbarButtonClassName(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Add link" title="Add link" className={toolbarButtonClassName(editor.isActive("link"))} onClick={applyLink}>
          <Link2 className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Clear formatting" title="Clear formatting" className={toolbarButtonClassName()} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <RemoveFormatting className="h-4 w-4" />
        </button>
        <div className="ml-auto flex items-center gap-2">
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
          "rich-text-content rich-text-editor-content rounded-b-2xl border border-zinc-200 bg-white px-0 py-0 dark:border-zinc-700 dark:bg-zinc-950",
          minHeightClassName,
          editorClassName,
          error ? "is-invalid" : "",
        )}
      />
      {error ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p> : null}
    </div>
  );
};
