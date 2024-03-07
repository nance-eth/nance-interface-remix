import { GraphQLClient, gql } from "graphql-request";

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
    }
  }
`;

export interface SnapshotVote {
  id: string;
  // metadata
  app: string;
  created: number;
  // voting
  voter: string;
  choice: any;
  vp: number;
  reason: string;
}

export default async function getVotesOfProposal(
  id: string,
  skip: number = 0,
  orderBy: "created" | "vp" = "created",
  first: number = 10,
) {
  if (!id) {
    return [];
  }

  const variable = { id, skip, orderBy, first };
  const data = await graphQLClient.request<{
    votes: SnapshotVote[];
    proposal: { choices: string[] };
  }>(votesOfProposalQuery, variable);

  const choices = ["-", ...data.proposal.choices];
  const votes = data.votes.map((vote) => {
    return {
      ...vote,
      choice: choices[vote.choice] || vote.choice,
    };
  });

  return votes;
}
