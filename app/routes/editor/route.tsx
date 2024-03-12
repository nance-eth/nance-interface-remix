import "@toast-ui/editor/dist/toastui-editor.css";
import { Suspense, lazy } from "react";


export default function ProposalEditor() {
  const MDEditor = lazy(async () => {
    const { Editor } = await import("@toast-ui/react-editor");
  return { default: Editor };
});

  return (
    <div>
      <Suspense fallback="Loading...">
        <MDEditor 
          initialValue="Hello, world!"
        />
      </Suspense>
    </div>
  );
}
