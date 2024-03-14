import snapshot from "@snapshot-labs/snapshot.js";
import { Address, Hex } from "viem";

const hub = "https://hub.snapshot.org"; // or https://testnet.hub.snapshot.org for testnet

export type ProposalType =
  | "single-choice"
  | "approval"
  | "quadratic"
  | "ranked-choice"
  | "weighted"
  | "basic";

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
