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

type VotesOfProposal = {
  votes: {
    id: string;
    // metadata
    app: string;
    created: number;
    // voting
    voter: string;
    vp: number;
    reason: string;
    choice: number | { [k: string]: number };
    choiceLabel?: string;
    aha: string;
  }[];
  proposal: {
    choices?: string[];
    type: ProposalType;
  };
};

export default async function getVotesOfProposal(
  id: string,
  first: number = 10,
  skip: number = 0,
  orderBy: "created" | "vp" = "created",
) {
  if (!id) {
    return [];
  }

  const variable = { id, skip, orderBy, first };
  const data = await graphQLClient.request<VotesOfProposal>(
    votesOfProposalQuery,
    variable,
  );

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
