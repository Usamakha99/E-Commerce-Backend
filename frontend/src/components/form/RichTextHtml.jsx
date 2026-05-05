import './rich-text-content.scss';

const RichTextHtml = ({ html, className = '', style }) => {
  if (html == null || html === '') return null;

  return (
    <div
      className={`rich-text-content ${className}`.trim()}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default RichTextHtml;
