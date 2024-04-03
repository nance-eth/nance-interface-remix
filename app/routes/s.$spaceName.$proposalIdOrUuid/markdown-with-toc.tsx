import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import ReactMarkdown from "react-markdown";
import { h } from "hastscript";

export default function MarkdownWithTOC({ body }: { body: string }) {
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
        ]}
      >
        {body}
      </ReactMarkdown>
    </article>
  );
}
