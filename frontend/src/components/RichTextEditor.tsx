'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { adminApi } from '@/lib/api';

const CONTENT_CLASS =
  'min-h-[300px] px-4 py-3 text-sm focus:outline-none ' +
  '[&_h2]:font-heading [&_h2]:text-navy-primary [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 ' +
  '[&_h3]:font-heading [&_h3]:text-navy-primary [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 ' +
  '[&_p]:mb-3 [&_p]:leading-relaxed ' +
  '[&_a]:text-blue-primary [&_a]:underline ' +
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_li]:mb-1 ' +
  '[&_img]:rounded-xl [&_img]:my-4 [&_strong]:font-semibold ' +
  '[&_blockquote]:border-l-4 [&_blockquote]:border-blue-accent [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-text-soft';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`px-2.5 py-1.5 rounded-sm text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active ? 'bg-navy-primary text-white' : 'text-navy-primary hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  function addLink() {
    const url = window.prompt('Link URL');
    if (!url) return;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  // External-URL option — kept alongside direct upload below, since
  // sometimes the image already lives somewhere else (e.g. a CDN).
  function addImageByUrl() {
    const url = window.prompt('Image URL');
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    setUploading(true);
    setUploadError('');
    try {
      const res = await adminApi.uploadImage(file);
      editor.chain().focus().setImage({ src: res.data.url }).run();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="border-b border-slate-200 bg-slate-50">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
        <ToolbarButton
          label="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          &ldquo; &rdquo;
        </ToolbarButton>
        <ToolbarButton label="Link" active={editor.isActive('link')} onClick={addLink}>
          Link
        </ToolbarButton>
        <ToolbarButton label="Image by URL" onClick={addImageByUrl}>
          Image URL
        </ToolbarButton>
        <ToolbarButton
          label="Upload image"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          onChange={handleFileSelected}
          className="hidden"
        />
        <span className="w-px h-5 bg-slate-300 mx-1" />
        <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          ↺
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          ↻
        </ToolbarButton>
      </div>
      {uploadError && <p className="text-danger text-xs px-2 pb-2">{uploadError}</p>}
    </div>
  );
}

/**
 * Controlled HTML editor: `value`/`onChange` behave like a textarea, and
 * the HTML produced (`editor.getHTML()`) is exactly what BlogPost.content
 * already expects — no backend or storage changes needed to adopt this in
 * place of the old raw-HTML textarea.
 */
export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: placeholder ?? 'Write your post…' }),
    ],
    content: value,
    editorProps: {
      attributes: { class: CONTENT_CLASS },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keep the editor in sync if `value` changes from outside (e.g. the
  // parent swaps from "New Post" to loading an existing post's content
  // into the same mounted editor instance).
  useEffect(() => {
  if (editor && value !== editor.getHTML()) {
    editor.commands.setContent(value, {
      emitUpdate: false,
    });
  }
}, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border border-slate-300 rounded-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-accent">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}