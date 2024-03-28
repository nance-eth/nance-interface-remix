import { Link } from "@remix-run/react";
import ProposalStatusIcon from "./proposal-status-icon";
import AddressLink from "./address-link";
import { CalendarDaysIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { Payout, Proposal, Transfer } from "@nance/nance-sdk";
import { SnapshotGraphqlProposalVotingInfo } from "~/data/snapshot";
import { formatDistanceToNow, fromUnixTime } from "date-fns";
import { formatNumber } from "~/utils/number";
import TokenSymbol from "./token-symbol";
import VotingInfo from "./voting-info";

function RequestingTokensOfProposal({ proposal }: { proposal: Proposal }) {
  // we only parse Payout and Transfer actions here
  const usd =
    proposal.actions
      ?.filter((action) => action.type === "Payout")
      .map(
        (action) =>
          (action.payload as Payout).amountUSD *
          (action.payload as Payout).count,
      )
      .reduce((sum, val) => sum + val, 0) || 0;
  const transferMap: { [key: string]: number } = {};
  proposal.actions
    ?.filter((action) => action.type === "Transfer")
    .map((action) => action.payload as Transfer)
    .forEach(
      (transfer) =>
        (transferMap[transfer.contract] =
          (transferMap[transfer.contract] || 0) + parseInt(transfer.amount)),
    );

  if (usd === 0 && Object.entries(transferMap).length === 0) return null;

  const tokens = [];
  if (usd > 0) tokens.push(`${formatNumber(usd)} USD`);
  Object.entries(transferMap).forEach((val) => {
    const [contract, amount] = val;
    if (tokens.length > 0) tokens.push(" + ");
    tokens.push(
      <span key={contract}>
        {formatNumber(amount)} <TokenSymbol address={contract} />
      </span>,
    );
  });

  return (
    <div className="flex items-center gap-x-1">
      <BanknotesIcon className="h-6 w-6 flex-none rounded-full bg-gray-50" />
      <div>
        <p className="text-gray-500">Requesting</p>
        <div className="text-center text-black">{tokens}</div>
      </div>
    </div>
  );
}

export default function ProposalInfo({
  proposal,
  votingInfo,
  linkDisabled = false,
}: {
  proposal: Proposal;
  votingInfo: SnapshotGraphqlProposalVotingInfo | undefined;
  linkDisabled: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-x-4 sm:flex-row">
      <ProposalStatusIcon status={proposal.status} />
      <div className="min-w-0 flex-auto">
        {/* Title */}
        <p className="text-base font-semibold text-gray-900">
          {!linkDisabled ? (
            <Link
              prefetch="intent"
              to={proposal.proposalId?.toString() || proposal.hash}
            >
              <span className="absolute inset-x-0 -top-px bottom-0" />
              {`${proposal.proposalId || "tbd"}: ${proposal.title}`}
            </Link>
          ) : (
            <span>{`${proposal.proposalId || "tbd"}: ${proposal.title}`}</span>
          )}
        </p>
        {/* Metadata */}
        <div className="mt-2 flex flex-wrap items-center gap-x-6 text-xs">
          {/* Author */}
          <div className="flex items-center gap-x-1">
            <img
              src={`https://cdn.stamp.fyi/avatar/${proposal.authorAddress}`}
              alt=""
              className="h-6 w-6 flex-none rounded-full bg-gray-50"
            />
            <div>
              <p className="text-gray-500">Author</p>
              <div className="text-center text-black">
                <AddressLink address={proposal.authorAddress} />
              </div>
            </div>
          </div>
          {/* Due / Cycle */}
          <div className="flex items-center gap-x-1">
            <CalendarDaysIcon className="h-6 w-6 flex-none rounded-full bg-gray-50" />
            {["Voting"].includes(proposal.status) && votingInfo ? (
              <div>
                <p className="text-gray-500">Due</p>
                <div className="text-center text-black">
                  {formatDistanceToNow(fromUnixTime(votingInfo.end), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-500">Cycle</p>
                <div className="text-center text-black">
                  {proposal.governanceCycle}
                </div>
              </div>
            )}
          </div>
          {/* Tokens */}
          <RequestingTokensOfProposal proposal={proposal} />
        </div>
        <div className="mt-2">
          <VotingInfo votingInfo={votingInfo} />
        </div>
      </div>
    </div>
  );
}
