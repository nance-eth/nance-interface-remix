import { useRef } from "react";
import { LinksFunction } from "@remix-run/node";
import { ClientOnly } from "remix-utils/client-only";
import { cssBundleHref } from "@remix-run/css-bundle";
import type { Editor } from "@toast-ui/react-editor";
import MarkdownEditor from "~/components/Markdown/MarkdownEditor.client";
import "@nance/nance-editor/lib/editor.css";

export const links: LinksFunction = () => [
  ...(cssBundleHref
    ? [{ rel: "stylesheet", href: cssBundleHref }]
    : []),
];

export default function ProposalEditor() {
  const editorRef = useRef<Editor>(null);
  return (
    <ClientOnly fallback={"Loading..."}>
      {() => <MarkdownEditor
        parentRef={editorRef}
        initialValue="Hello, world!"
        onEditorChange={(md) => { console.log(md); }}
      />}
    </ClientOnly>
  );
}
