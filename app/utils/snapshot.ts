import snapshot from "@snapshot-labs/snapshot.js";
import { Address, Hex } from "viem";

const hub = "https://hub.snapshot.org"; // or https://testnet.hub.snapshot.org for testnet

export type ProposalType =
  | "approval"
  | "ranked-choice" // choice = [1,2,3]
  | "basic"
  | "single-choice" // choice = 1
  | "weighted"
  | "quadratic"; // choice = {"1": 1, "2": 2, "3": 3}

export interface CastVoteArgs {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signTypedDataAsyncFunc: (data: any) => Promise<Hex>;
  address: Address;
  choice:
    | number
    | number[]
    | string
    | {
        [key: string]: number;
      };
  reason: string | undefined;
  space: string;
  proposal: string;
  type: ProposalType;
}

type SnapshotResponse = {
  id: string;
  // https://snapshot.4everland.link/ipfs/<ipfs>
  ipfs: string;
  relayer: {
    address: string;
    receipt: string;
  };
};

export async function castVote({
  signTypedDataAsyncFunc,
  address,
  choice,
  reason,
  space,
  proposal,
  type,
}: CastVoteArgs): Promise<SnapshotResponse> {
  const client = new snapshot.Client712(hub);

  // mocking the web3 just for snapshot.js
  // usage in their repo:
  //   const sig = await signer._signTypedData(domain, data.types, message);
  const web3 = {
    getSigner: () => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _signTypedData: (domain: any, types: any, message: any) =>
          signTypedDataAsyncFunc({
            types,
            primaryType: "Vote",
            domain,
            message,
            account: address,
          }),
      };
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await client.vote(web3 as any, address, {
    space,
    proposal,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type,
    choice: choice,
    reason,
    app: "nance.app",
  });
  return res as SnapshotResponse;
}

// map indexed choice number to choice string
export function getChoiceLabel(
  type: ProposalType,
  choices: string[] | undefined,
  choice: number | number[] | { [key: string]: number } | undefined,
): string {
  if (typeof choice === "string") return "🔐";

  if (!type || !choices || !choice) return "Unknown";

  if (type == "approval") {
    // choice = [1,2,3]
    const choiceArr = choice as number[];
    return choiceArr.map((c: number) => choices[c - 1]).join(", ");
  } else if (type == "ranked-choice") {
    // choice = [1,2,3]
    const choiceArr = choice as number[];
    return choiceArr.map((c, i) => `(${i + 1}th) ${choices[c - 1]}`).join(", ");
  } else if (["quadratic", "weighted"].includes(type)) {
    // choice = {"1": 1, "2": 2, "3": 3}
    const choiceObj = choice as { [key: string]: number };
    const totalUnits = Object.values(choiceObj).reduce((a, b) => a + b, 0);
    return Object.entries(choiceObj)
      .map(
        ([key, value]) =>
          `${Math.round((value / totalUnits) * 100)}% for ${choices[parseInt(key) - 1]}`,
      )
      .join(", ");
  } else {
    // choice = 1
    return choices[(choice as number) - 1];
  }
}
