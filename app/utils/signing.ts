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

interface CastVoteArgs {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signTypedDataAsyncFunc: (data: any) => Promise<Hex>;
  address: Address;
  choice: number | number[] | string;
  reason: string | undefined;
  snapshotSpace: string;
  snapshotProposal: string;
  votingType: ProposalType;
}

export async function castVote({
  signTypedDataAsyncFunc,
  address,
  choice,
  reason,
  snapshotSpace,
  snapshotProposal,
  votingType,
}: CastVoteArgs): Promise<{ value: unknown; error: string | undefined }> {
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

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const receipt = await client.vote(web3 as any, address, {
      space: snapshotSpace,
      proposal: snapshotProposal,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: votingType,
      choice: choice,
      reason,
      app: "nance.app",
    });
    return { value: receipt, error: undefined };
  } catch (e: Error) {
    return { value: undefined, error: e.message };
  }
}
