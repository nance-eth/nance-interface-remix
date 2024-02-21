import { ProposalsPacket } from "@nance/nance-sdk";
import {
  useLocation,
  useOutletContext,
  useParams,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

export default function Proposals() {
  const params = useParams();
  const proposalsPacket = useOutletContext<ProposalsPacket>();
  const proposalIdOrHash = params.proposalIdOrHash;
  const proposal = proposalsPacket.proposals.find(
    (p) =>
      p.proposalId?.toString() === proposalIdOrHash ||
      p.hash === proposalIdOrHash,
  );
  invariant(proposal, "Can't find the proposal");

  return (
    <div>
      <h2 className="text-xl">
        {proposal.title} by {proposal.author}
      </h2>
      <p>{proposal.body}</p>
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
