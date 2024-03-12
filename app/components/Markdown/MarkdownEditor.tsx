import { RefObject } from "react";
import { Editor } from "@toast-ui/react-editor";

export default function MarkdownEditor({
  parentRef,
  initialValue,
}: {
  parentRef: RefObject<Editor>;
  onEditorChange?: (md: string) => void;
  initialValue?: string;
}) {

  return (
    <div>
      <Editor
        ref={parentRef}
        initialValue={initialValue}
        previewStyle="tab"
        height="600px"
        initialEditType="wysiwyg"
        useCommandShortcut={true}
      />
    </div>
  );
}
