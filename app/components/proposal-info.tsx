import { Link } from "@remix-run/react";
import ProposalStatusIcon from "./proposal-status-icon";
import AddressLink from "./address-link";
import { CalendarDaysIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { Payout, ProposalPacket, Transfer } from "@nance/nance-sdk";
import { SnapshotGraphqlProposalVotingInfo } from "~/data/snapshot";
import { formatDistanceToNow, fromUnixTime } from "date-fns";
import { formatNumber } from "~/utils/number";
import TokenSymbol from "./token-symbol";
import VotingInfo from "./voting-info";

function RequestingTokensOfProposal({ proposalPacket }: { proposalPacket: ProposalPacket }) {
  // we only parse Payout and Transfer actions here
  const usd =
  proposalPacket.actions
      ?.filter((action) => action.type === "Payout")
      .map(
        (action) =>
          (action.payload as Payout).amountUSD *
          (action.payload as Payout).count,
      )
      .reduce((sum, val) => sum + val, 0) || 0;
  const transferMap: { [key: string]: number } = {};
  proposalPacket.actions
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
  proposalPacket,
  votingInfo,
  linkDisabled = false,
}: {
  proposalPacket: ProposalPacket;
  votingInfo: SnapshotGraphqlProposalVotingInfo | undefined;
  linkDisabled?: boolean;
}) {
  const { proposalIdPrefix } = proposalPacket?.proposalInfo || "";
  const preTitleDisplay = proposalIdPrefix ? `${proposalIdPrefix}${proposalPacket.proposalId}: ` : "";
  return (
    <div className="flex min-w-0 flex-col gap-x-4 sm:flex-row">
      <ProposalStatusIcon status={proposalPacket.status} />
      <div className="min-w-0 flex-auto">
        {/* Title */}
        <p className="text-base font-semibold text-gray-900">
          {!linkDisabled ? (
            <Link
              prefetch="intent"
              to={proposalPacket.proposalId?.toString() || proposalPacket.uuid}
            >
              <span className="absolute inset-x-0 -top-px bottom-0" />
              {`${preTitleDisplay}${proposalPacket.title}`}
            </Link>
          ) : (
            <span>{`${preTitleDisplay}${proposalPacket.title}`}</span>
          )}
        </p>
        {/* Metadata */}
        <div className="mt-2 flex flex-wrap items-center gap-x-6 text-xs">
          {/* Author */}
          <div className="flex items-center gap-x-1">
            <img
              src={`https://cdn.stamp.fyi/avatar/${proposalPacket.authorAddress}`}
              alt=""
              className="h-6 w-6 flex-none rounded-full bg-gray-50"
            />
            <div>
              <p className="text-gray-500">Author</p>
              <div className="text-center text-black">
                <AddressLink address={proposalPacket.authorAddress} />
              </div>
            </div>
          </div>
          {/* Due / Cycle */}
          <div className="flex items-center gap-x-1">
            <CalendarDaysIcon className="h-6 w-6 flex-none rounded-full bg-gray-50" />
            {["Voting"].includes(proposalPacket.status) && votingInfo ? (
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
                  {proposalPacket.governanceCycle}
                </div>
              </div>
            )}
          </div>
          {/* Tokens */}
          <RequestingTokensOfProposal proposalPacket={proposalPacket} />
        </div>
        <div className="mt-2">
          <VotingInfo votingInfo={votingInfo} />
        </div>
      </div>
    </div>
  );
}
