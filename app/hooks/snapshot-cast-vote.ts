import { useCallback } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { CastVoteArgs, castVote } from "~/utils/signing";

type CastVoteHookArgs = Pick<
  CastVoteArgs,
  "space" | "proposal" | "type" | "reason" | "choice"
>;

export default function useCastVote() {
  const { address, status } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const trigger = useCallback(
    async (args: CastVoteHookArgs) => {
      if (status === "connected") {
        return await castVote({
          ...args,
          signTypedDataAsyncFunc: signTypedDataAsync,
          address,
        });
      } else {
        throw new Error("wallet " + status);
      }
    },
    [address, signTypedDataAsync, status],
  );

  return { trigger };
}
