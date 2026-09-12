'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Code2, Eye } from 'lucide-react';

// Dynamic import with SSR disabled — required for react-quill in Next.js
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="h-72 border border-[#E2DDD5] rounded-b-xl bg-[#FAF8F5] flex items-center justify-center text-slate-400 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-[#1F3A2E] border-t-transparent rounded-full animate-spin" />
        <span>Loading visual editor...</span>
      </div>
    </div>
  ),
});

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

export default function RichEditor({
  value,
  onChange,
  placeholder = 'Type your content here...',
  height = 320,
}: RichEditorProps) {
  const [showSource, setShowSource] = useState(false);

  const modules = useMemo(
    () => ({
      toolbar: [
        // Group 1: Typography pickers
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        // Group 2: Inline styles
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        // Group 3: Scripts & format reset
        [{ script: 'sub' }, { script: 'super' }],
        ['clean'],
        // Group 4: Lists & Indents
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        // Group 5: Alignments
        [{ align: [] }],
        // Group 6: Blocks & Inserts
        ['blockquote', 'code-block'],
        ['link', 'image'],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'script',
    'clean',
    'list',
    'bullet',
    'indent',
    'align',
    'blockquote',
    'code-block',
    'link',
    'image',
  ];

  return (
    <div className="ck-editor-container rounded-xl border border-[#DCD5C9] overflow-hidden bg-white shadow-xs">
      {/* ── CKEditor Style Header Bar ─────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#F5F2EB] border-b border-[#E0D9CD]">
        <div className="flex items-center gap-2">
          {/* CKEditor Classic Source button */}
          <button
            type="button"
            onClick={() => setShowSource(!showSource)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-all ${
              showSource
                ? 'bg-[#1F3A2E] text-white border-[#1F3A2E] shadow-inner'
                : 'bg-white text-slate-700 border-[#D2C9BB] hover:bg-[#EFEAE0] hover:text-[#1F3A2E] shadow-2xs'
            }`}
            title={showSource ? 'Switch to Visual Editor' : 'Switch to Source Code'}
          >
            {showSource ? (
              <>
                <Eye className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Visual Mode</span>
              </>
            ) : (
              <>
                <Code2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Source</span>
              </>
            )}
          </button>
        </div>

        <span className="text-[11px] font-medium text-slate-500">
          {showSource ? 'Source HTML Mode' : 'WYSIWYG Mode'}
        </span>
      </div>

      <div className="ck-quill-wrapper">
        <style>{`
          /* ── Container & Toolbar Background ────────────────────── */
          .ck-quill-wrapper .ql-toolbar.ql-snow {
            border: none !important;
            border-bottom: 1px solid #E0D9CD !important;
            background: #FAF8F5 !important;
            padding: 6px 10px !important;
            display: flex !important;
            flex-wrap: wrap !important;
            align-items: center !important;
            gap: 4px 6px !important;
          }

          /* ── Groups / Separators ──────────────────────────────── */
          .ck-quill-wrapper .ql-snow .ql-formats {
            display: inline-flex !important;
            align-items: center !important;
            margin: 2px 4px 2px 0 !important;
            padding-right: 6px !important;
            border-right: 1px solid #E2DCD1 !important;
            gap: 2px !important;
          }
          .ck-quill-wrapper .ql-snow .ql-formats:last-child {
            border-right: none !important;
          }

          /* ── Buttons (Bold, Italic, Lists, etc.) ──────────────── */
          .ck-quill-wrapper .ql-snow.ql-toolbar button,
          .ck-quill-wrapper .ql-snow .ql-toolbar button {
            width: 28px !important;
            height: 28px !important;
            padding: 3px !important;
            border-radius: 4px !important;
            border: 1px solid transparent !important;
            background: transparent !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            transition: all 0.15s ease !important;
            float: none !important;
          }

          .ck-quill-wrapper .ql-snow.ql-toolbar button svg,
          .ck-quill-wrapper .ql-snow .ql-toolbar button svg {
            width: 16px !important;
            height: 16px !important;
            float: none !important;
          }

          .ck-quill-wrapper .ql-snow.ql-toolbar button:hover,
          .ck-quill-wrapper .ql-snow .ql-toolbar button:hover {
            background: #EFEAE0 !important;
            border-color: #D5CCC0 !important;
          }

          .ck-quill-wrapper .ql-snow.ql-toolbar button.ql-active,
          .ck-quill-wrapper .ql-snow .ql-toolbar button.ql-active {
            background: #1F3A2E !important;
            border-color: #1F3A2E !important;
          }

          .ck-quill-wrapper .ql-snow.ql-toolbar button.ql-active svg .ql-stroke,
          .ck-quill-wrapper .ql-snow.ql-toolbar button.ql-active svg .ql-stroke-miter {
            stroke: #D4A373 !important;
          }
          .ck-quill-wrapper .ql-snow.ql-toolbar button.ql-active svg .ql-fill {
            fill: #D4A373 !important;
          }

          /* ── Pickers (Header, Font, Size Dropdowns) ────────────── */
          .ck-quill-wrapper .ql-snow .ql-picker {
            position: relative !important;
            display: inline-flex !important;
            align-items: center !important;
            height: 28px !important;
            font-size: 12px !important;
            float: none !important;
          }

          /* Specific widths so text never wraps or squishes */
          .ck-quill-wrapper .ql-snow .ql-picker.ql-header {
            width: 115px !important;
          }
          .ck-quill-wrapper .ql-snow .ql-picker.ql-font {
            width: 110px !important;
          }
          .ck-quill-wrapper .ql-snow .ql-picker.ql-size {
            width: 95px !important;
          }

          /* Dropdown label styling */
          .ck-quill-wrapper .ql-snow .ql-picker.ql-header .ql-picker-label,
          .ck-quill-wrapper .ql-snow .ql-picker.ql-font .ql-picker-label,
          .ck-quill-wrapper .ql-snow .ql-picker.ql-size .ql-picker-label {
            width: 100% !important;
            height: 28px !important;
            padding: 0 22px 0 8px !important;
            border: 1px solid #D5CCC0 !important;
            border-radius: 4px !important;
            background: #FFFFFF !important;
            display: flex !important;
            align-items: center !important;
            font-size: 12px !important;
            font-weight: 500 !important;
            color: #333333 !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.04) !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }

          .ck-quill-wrapper .ql-snow .ql-picker.ql-header .ql-picker-label:hover,
          .ck-quill-wrapper .ql-snow .ql-picker.ql-font .ql-picker-label:hover,
          .ck-quill-wrapper .ql-snow .ql-picker.ql-size .ql-picker-label:hover {
            border-color: #BDB2A3 !important;
            background: #FAFAF7 !important;
          }

          /* Dropdown arrow placement */
          .ck-quill-wrapper .ql-snow .ql-picker.ql-header .ql-picker-label svg,
          .ck-quill-wrapper .ql-snow .ql-picker.ql-font .ql-picker-label svg,
          .ck-quill-wrapper .ql-snow .ql-picker.ql-size .ql-picker-label svg {
            position: absolute !important;
            right: 6px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            width: 12px !important;
            height: 12px !important;
            stroke: #666666 !important;
            fill: none !important;
          }

          /* Pickers for Color, Background, Alignment (Icon Pickers) */
          .ck-quill-wrapper .ql-snow .ql-color-picker,
          .ck-quill-wrapper .ql-snow .ql-icon-picker {
            width: 28px !important;
            height: 28px !important;
          }
          .ck-quill-wrapper .ql-snow .ql-color-picker .ql-picker-label,
          .ck-quill-wrapper .ql-snow .ql-icon-picker .ql-picker-label {
            width: 28px !important;
            height: 28px !important;
            padding: 3px !important;
            border-radius: 4px !important;
            border: 1px solid transparent !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .ck-quill-wrapper .ql-snow .ql-color-picker .ql-picker-label:hover,
          .ck-quill-wrapper .ql-snow .ql-icon-picker .ql-picker-label:hover {
            background: #EFEAE0 !important;
            border-color: #D5CCC0 !important;
          }

          /* Options Popups */
          .ck-quill-wrapper .ql-snow .ql-picker-options {
            border: 1px solid #D5CCC0 !important;
            border-radius: 6px !important;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1) !important;
            background: #FFFFFF !important;
            padding: 5px !important;
            z-index: 99999 !important;
          }
          .ck-quill-wrapper .ql-snow .ql-picker-options .ql-picker-item {
            padding: 5px 10px !important;
            border-radius: 4px !important;
            font-size: 12px !important;
            cursor: pointer !important;
          }
          .ck-quill-wrapper .ql-snow .ql-picker-options .ql-picker-item:hover,
          .ck-quill-wrapper .ql-snow .ql-picker-options .ql-picker-item.ql-selected {
            background: #F4EFE6 !important;
            color: #1F3A2E !important;
            font-weight: 600 !important;
          }

          /* ── Editor Body ───────────────────────────────────────── */
          .ck-quill-wrapper .ql-container.ql-snow {
            border: none !important;
            font-family: inherit !important;
            font-size: 14.5px !important;
          }

          .ck-quill-wrapper .ql-editor {
            min-height: ${height}px;
            max-height: 650px;
            overflow-y: auto;
            color: #1A201C;
            line-height: 1.75;
            padding: 20px 24px !important;
            background: #FFFFFF;
          }

          .ck-quill-wrapper .ql-editor.ql-blank::before {
            color: #94A3B8 !important;
            font-style: normal !important;
            font-size: 13.5px !important;
            left: 24px !important;
          }

          /* Content formatting */
          .ck-quill-wrapper .ql-editor h1 { font-size: 1.85rem; font-weight: 700; margin: 1.2rem 0 0.5rem; color: #1F3A2E; }
          .ck-quill-wrapper .ql-editor h2 { font-size: 1.45rem; font-weight: 700; margin: 1rem 0 0.4rem; color: #1F3A2E; }
          .ck-quill-wrapper .ql-editor h3 { font-size: 1.2rem; font-weight: 600; margin: 0.85rem 0 0.35rem; color: #2d5441; }
          .ck-quill-wrapper .ql-editor h4 { font-size: 1.05rem; font-weight: 600; margin: 0.7rem 0 0.25rem; }
          .ck-quill-wrapper .ql-editor p { margin: 0.5rem 0; }
          .ck-quill-wrapper .ql-editor ul,
          .ck-quill-wrapper .ql-editor ol { padding-left: 1.5rem; margin: 0.5rem 0; }
          .ck-quill-wrapper .ql-editor li { margin: 0.25rem 0; }
          .ck-quill-wrapper .ql-editor blockquote {
            border-left: 4px solid #D4A373;
            padding: 0.6rem 1.2rem;
            margin: 0.8rem 0;
            color: #4A5568;
            background: #FAF8F5;
            border-radius: 0 6px 6px 0;
            font-style: italic;
          }
          .ck-quill-wrapper .ql-editor code,
          .ck-quill-wrapper .ql-editor pre {
            background: #FAF8F5;
            border: 1px solid #E5DFD5;
            border-radius: 6px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 13px;
          }
          .ck-quill-wrapper .ql-editor pre {
            padding: 14px 18px;
            margin: 0.8rem 0;
          }
          .ck-quill-wrapper .ql-editor a {
            color: #1F3A2E;
            text-decoration: underline;
            font-weight: 500;
          }
          .ck-quill-wrapper .ql-editor img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 0.8rem 0;
          }
        `}</style>

        {showSource ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={14}
            className="w-full p-5 font-mono text-xs text-slate-800 bg-[#FAF9F6] focus:outline-none focus:bg-white resize-y"
            placeholder="Edit raw HTML source code here..."
            style={{ minHeight: `${height}px` }}
          />
        ) : (
          <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
          />
        )}
      </div>
    </div>
  );
}
