import { useLoaderData, useRouteError } from "@remix-run/react";
import invariant from "tiny-invariant";
import MarkdownWithTOC from "./markdown-with-toc";
import { getProposal } from "~/data/nance";
import { LoaderFunctionArgs, json } from "@remix-run/node";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.spaceName, "Missing spaceName param");
  invariant(params.proposalIdOrHash, "Missing spaceName param");

  const proposal = await getProposal({
    space: params.spaceName,
    hash: params.proposalIdOrHash,
  });
  if (!proposal) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ proposal });
};

export default function Proposal() {
  const { proposal } = useLoaderData<typeof loader>();

  return (
    <div>
      <h2 className="text-xl">
        {proposal.title} by {proposal.author}
      </h2>
      <MarkdownWithTOC body={proposal.body || ""} />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  return (
    <div>
      <h2 className="text-xl text-red-500">Proposal not found</h2>
    </div>
  );
}
