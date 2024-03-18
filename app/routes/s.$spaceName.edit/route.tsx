import { LinksFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import { ClientOnly } from "remix-utils/client-only";
import { cssBundleHref } from "@remix-run/css-bundle";
import NanceEditor from "~/components/MarkdownEditor.client";
import { useLoaderData } from "@remix-run/react";

// css for the Nance editor
import "@nance/nance-editor/lib/editor.css";
import invariant from "tiny-invariant";
import { Proposal, getProposal } from "@nance/nance-sdk";
export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export async function loader({ params, request }: LoaderFunctionArgs) {
  invariant(params.spaceName, "Missing spaceName param");

  const url = new URL(request.url);
  const proposalIdOrHash = url.searchParams.get("proposal");
  if (proposalIdOrHash === null) {
    return json({
      IPFS_GATEWAY: process.env.IPFS_GATEWAY,
      IPFS_ID: process.env.INFURA_IPFS_ID,
      IPFS_SECRET: process.env.INFURA_IPFS_SECRET,
      loadedProposal: undefined,
    });
  }

  const proposal = await getProposal({
    space: params.spaceName,
    hash: proposalIdOrHash,
  });
  return json({
    IPFS_GATEWAY: process.env.IPFS_GATEWAY,
    IPFS_ID: process.env.INFURA_IPFS_ID,
    IPFS_SECRET: process.env.INFURA_IPFS_SECRET,
    loadedProposal: proposal,
  });
}

export default function ProposalEditor() {
  const { IPFS_GATEWAY, IPFS_ID, IPFS_SECRET, loadedProposal } = useLoaderData<{
    IPFS_GATEWAY: string;
    IPFS_ID: string;
    IPFS_SECRET: string;
    loadedProposal?: Proposal;
  }>();

  return (
    <ClientOnly fallback={"Loading..."}>
      {() => (
        <NanceEditor
          initialValue={loadedProposal ? loadedProposal.body : "New proposal"}
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
