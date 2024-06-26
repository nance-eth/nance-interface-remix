import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import ReactMarkdown from "react-markdown";
import { h } from "hastscript";
import rehypeHighlightText from "./highlight-text-plugin";

export default function MarkdownWithTOC({
  body,
  highlightPattern = undefined,
}: {
  body: string;
  highlightPattern?: string;
}) {
  return (
    <article className="prose prose-indigo prose-table:table-fixed mx-auto break-words text-gray-500">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSanitize,
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              content() {
                return [h("span.ml-2.hidden.group-hover:inline", "#")];
              },
              behavior: "append",
            },
          ],
          [rehypeHighlightText, highlightPattern],
        ]}
        components={{
          h2: ({ node, ...props }) => <h2 className="group" {...props} />,
          h3: ({ node, ...props }) => <h3 className="group" {...props} />,
          h4: ({ node, ...props }) => <h4 className="group" {...props} />,
          h5: ({ node, ...props }) => <h5 className="group" {...props} />,
          h6: ({ node, ...props }) => <h6 className="group" {...props} />,
        }}
      >
        {body}
      </ReactMarkdown>
    </article>
  );
}
