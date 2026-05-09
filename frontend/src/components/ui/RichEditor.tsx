import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

interface Props {
  content: string;
  onChange: (content: string) => void;
}

export default function RichEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content]);

  if (!editor) return null;

  return (
    <div className="flex flex-col flex-1">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b bg-gray-50 flex-wrap">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="B" style={{ fontWeight: "bold" }} />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="I" style={{ fontStyle: "italic" }} />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} label="S" style={{ textDecoration: "line-through" }} />
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} label="H1" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} label="H2" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} label="H3" />
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="• List" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="1. List" />
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} label="<>" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="❝" />
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="flex-1 px-16 py-8 overflow-y-auto prose prose-sm max-w-none"
      />
    </div>
  );
}

function ToolbarBtn({ onClick, active, label, style }: {
  onClick: () => void;
  active: boolean;
  label: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      style={style}
      className={`px-2 py-1 rounded text-sm transition-colors ${
        active ? "bg-[#7F77DD] text-white" : "text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}