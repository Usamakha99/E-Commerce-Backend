import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './rich-text-editor.scss';

const defaultToolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ header: [1, 2, 3, false] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['link', 'image'],
  ['clean'],
];

const defaultFormats = ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'align', 'link', 'image'];

const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  editorMinHeight = 260,
  className = '',
}) => {
  const modules = useMemo(
    () => ({
      toolbar: defaultToolbar,
    }),
    [],
  );

  return (
    <div className={`rich-text-editor-root ${className}`.trim()}>
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={defaultFormats}
        placeholder={placeholder}
        className="pb-sm-3 pb-4"
        style={{ minHeight: editorMinHeight }}
      />
    </div>
  );
};

export default RichTextEditor;
