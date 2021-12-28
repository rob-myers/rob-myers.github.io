import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

export default function Markdown(props: ReactMarkdown.ReactMarkdownOptions) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]} // Permits html; +60kb gzipped
      remarkPlugins={[remarkGfm]}
      {...props}
    />
  );
}
