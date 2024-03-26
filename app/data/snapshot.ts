import { GraphQLClient, gql } from "graphql-request";
import { ProposalType, getChoiceLabel } from "~/utils/snapshot";

const endpoint = "https://hub.snapshot.org/graphql";

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    "x-api-key": process.env.SNAPSHOT_API_KEY || "",
  },
});

const votesOfProposalQuery = gql`
  query votesOfProposal(
    $id: String
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
      choices
      type
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
  type: string;
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

export async function getVotingInfoOfProposals(
  proposalIds: string[],
): Promise<SnapshotGraphqlProposalVotingInfo[]> {
  const variable = { first: proposalIds.length, proposalIds };
  const data = await graphQLClient.request<{
    proposals: SnapshotGraphqlProposalVotingInfo[];
  }>(votingInfoOfProposalsQuery, variable);

  return data.proposals;
}

export async function getVotesOfProposal(
  id: string,
  first: number = 10,
  skip: number = 0,
  orderBy: "created" | "vp" = "created",
): Promise<SnapshotGraphqlVote[]> {
  if (!id) {
    return [];
  }

  const variable = { id, skip, orderBy, first };
  const data = await graphQLClient.request<{
    votes: SnapshotGraphqlVote[];
    proposal: {
      choices?: string[];
      type: ProposalType;
    };
  }>(votesOfProposalQuery, variable);

  return data.votes.map((vote) => {
    return {
      ...vote,
      choiceLabel: getChoiceLabel(
        data.proposal.type,
        data.proposal.choices,
        vote.choice,
      ),
    };
  });
}
