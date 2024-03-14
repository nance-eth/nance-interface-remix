// wrapper for the Nance editor to be used in the client
import { FileUploadIPFSProps, NanceEditor } from "@nance/nance-editor";

export default function Editor({ fileUploadIPFS }: { fileUploadIPFS?: FileUploadIPFSProps }) {
  return (
    <NanceEditor
      initialValue="Hello, world!"
      onEditorChange={(md) => { console.log(md); }}
      fileUploadIPFS={fileUploadIPFS}
    />
  );
}
