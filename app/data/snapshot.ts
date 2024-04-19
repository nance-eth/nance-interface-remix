import { skipToken, useQuery } from "@tanstack/react-query";
import { GraphQLClient, gql } from "graphql-request";
import { ProposalType, getChoiceLabel } from "~/utils/snapshot";

const endpoint = "https://hub.snapshot.org/graphql";

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    "x-api-key":
      "36ecfc8801efa1a398ffd200e31c5015999f76e8c783fb8bb10adcf38cb59190",
  },
});

const votesOfProposalQuery = gql`
  query votesOfProposal(
    $id: String!
    $skip: Int
    $orderBy: String
    $first: Int
  ) {
    votes(
      first: $first
      skip: $skip
      where: { proposal: $id }
      orderBy: $orderBy
      orderDirection: desc
    ) {
      id
      app
      created
      voter
      choice
      vp
      reason
    }

    proposal(id: $id) {
      id
      state
      end
      type
      choices
      scores
      votes
      quorum
      scores_total
      ipfs
      snapshot
    }
  }
`;

const votingInfoOfProposalsQuery = gql`
  query ProposalsByID($first: Int, $proposalIds: [String]) {
    proposals(
      first: $first
      skip: 0
      where: { id_in: $proposalIds }
      orderBy: "created"
      orderDirection: desc
    ) {
      id
      state
      end
      type
      choices
      scores
      votes
      quorum
      scores_total
      ipfs
      snapshot
    }
  }
`;

export type SnapshotGraphqlProposalVotingInfo = {
  id: string;
  // active or
  state: string;
  end: number;
  // voting type
  type: ProposalType;
  choices: string[];
  // scores by choice
  scores: number[];
  // vote count
  votes: number;
  quorum: number;
  scores_total: number;
};

export type SnapshotGraphqlVote = {
  id: string;
  // metadata
  app: string;
  created: number;
  end: number;
  // voting
  voter: string;
  vp: number;
  reason: string;
  choice: number | { [k: string]: number };
  choiceLabel?: string;
  aha: string;
};

export function useVotingInfoOfProposals(
  proposalIds: string[],
  shouldFetch: boolean = true,
) {
  return useQuery({
    queryKey: [endpoint + "=> getVotingInfoOfProposals"],
    queryFn: shouldFetch
      ? async () => getVotingInfoOfProposals(proposalIds)
      : skipToken,
  });
}

export async function getVotingInfoOfProposals(
  proposalIds: string[],
): Promise<SnapshotGraphqlProposalVotingInfo[]> {
  const variable = { first: proposalIds.length, proposalIds };
  const data = await graphQLClient.request<{
    proposals: SnapshotGraphqlProposalVotingInfo[];
  }>(votingInfoOfProposalsQuery, variable);

  return data.proposals;
}

interface VotesOfProposal {
  votes: SnapshotGraphqlVote[];
  proposal: SnapshotGraphqlProposalVotingInfo;
}

export function useVotesOfProposal(
  id?: string,
  first: number = 10,
  skip: number = 0,
  orderBy: "created" | "vp" = "created",
  shouldFetch: boolean = true,
) {
  return useQuery({
    queryKey: [endpoint + "=> getVotesOfProposal"],
    queryFn: shouldFetch
      ? async () => getVotesOfProposal(id, first, skip, orderBy)
      : skipToken,
  });
}

export async function getVotesOfProposal(
  id?: string,
  first: number = 10,
  skip: number = 0,
  orderBy: "created" | "vp" = "created",
): Promise<VotesOfProposal | undefined> {
  if (!id) {
    return undefined;
  }

  const variable = { id, skip, orderBy, first };
  const data = await graphQLClient.request<VotesOfProposal>(
    votesOfProposalQuery,
    variable,
  );

  const votes = data.votes.map((vote) => {
    return {
      ...vote,
      choiceLabel: getChoiceLabel(
        data.proposal.type,
        data.proposal.choices,
        vote.choice,
      ),
    };
  });

  return {
    votes,
    proposal: data.proposal,
  };
}
