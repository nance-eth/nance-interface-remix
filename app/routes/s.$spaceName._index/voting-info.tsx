import { formatDistanceToNow, fromUnixTime } from "date-fns";
import { SnapshotGraphqlProposalVotingInfo } from "~/data/snapshot";
import { formatNumber } from "~/utils/number";

export default function VotingInfo({
  votingInfo,
}: {
  votingInfo: SnapshotGraphqlProposalVotingInfo | undefined;
}) {
  if (votingInfo === undefined) return null;

  const quorumProgress = (
    (votingInfo.scores_total * 100) /
    votingInfo.quorum
  ).toFixed(0);
  const scoresLabel = votingInfo.choices
    .map(
      (choice, index) => `${choice} ${formatNumber(votingInfo.scores[index])}`,
    )
    .slice(0, 3)
    .join(", ");

  return (
    <p className="flex flex-wrap gap-x-1 text-xs text-gray-500">
      {`${quorumProgress}% of quorum, ${scoresLabel}`}
    </p>
  );
}
