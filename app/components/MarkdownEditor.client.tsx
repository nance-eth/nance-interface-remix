// wrapper for the Nance editor to be used in the client
import { FileUploadIPFSProps, NanceEditor } from "@nance/nance-editor";

export default function Editor({
  initialValue = "Hello, world",
  onEditorChange = (md) => {
    console.log(md);
  },
  fileUploadIPFS,
}: {
  initialValue?: string;
  onEditorChange?: (md: string) => void;
  fileUploadIPFS?: FileUploadIPFSProps;
}) {
  return (
    <NanceEditor
      initialValue={initialValue}
      onEditorChange={onEditorChange}
      fileUploadIPFS={fileUploadIPFS}
    />
  );
}
