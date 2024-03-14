import { LinksFunction, json } from "@remix-run/node";
import { ClientOnly } from "remix-utils/client-only";
import { cssBundleHref } from "@remix-run/css-bundle";
import NanceEditor from "~/components/MarkdownEditor.client";
import { useLoaderData } from "@remix-run/react";

// css for the Nance editor
import "@nance/nance-editor/lib/editor.css";
export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export async function loader() {
  return json({
    IPFS_GATEWAY: process.env.IPFS_GATEWAY,
    IPFS_ID: process.env.INFURA_IPFS_ID,
    IPFS_SECRET: process.env.INFURA_IPFS_SECRET,
  });
}

export default function ProposalEditor() {
  const { IPFS_GATEWAY, IPFS_ID, IPFS_SECRET } = useLoaderData<typeof loader>();

  return (
    <ClientOnly fallback={"Loading..."}>
      {() => (
        <NanceEditor
          fileUploadIPFS={
            IPFS_GATEWAY && IPFS_ID && IPFS_SECRET
              ? {
                  gateway: IPFS_GATEWAY,
                  auth: `Basic ${Buffer.from(`${IPFS_ID}:${IPFS_SECRET}`).toString("base64")}`,
                }
              : undefined
          }
        />
      )}
    </ClientOnly>
  );
}
