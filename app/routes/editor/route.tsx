import { LinksFunction } from "@remix-run/node";
import { Suspense, lazy, useRef } from "react";
import { cssBundleHref } from "@remix-run/css-bundle";
import type { Editor } from "@toast-ui/react-editor";
import "@nance/nance-editor/lib/editor.css";

const MDEditor = lazy(() => import("~/components/Markdown/MarkdownEditor"));

export const links: LinksFunction = () => [
  ...(cssBundleHref
    ? [{ rel: "stylesheet", href: cssBundleHref }]
    : []),
];

export default function ProposalEditor() {
  const editorRef = useRef<Editor>(null);
  return (
    <div>
      <Suspense fallback="Loading...">
        <MDEditor
          parentRef={editorRef}
          // initialValue="Hello, world!"
          onEditorChange={(md) => { console.log(md); }}
        />
      </Suspense>
    </div>
  );
}
