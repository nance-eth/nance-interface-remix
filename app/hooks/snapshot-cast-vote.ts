import { useCallback, useState } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { CastVoteArgs, castVote } from "~/utils/signing";

type CastVoteHookArgs = Pick<
  CastVoteArgs,
  "space" | "proposal" | "type" | "reason" | "choice"
>;

export default function useCastVote() {
  // state
  const [value, setValue] = useState<unknown>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  // external state
  const { address, status } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const trigger = useCallback(
    async (args: CastVoteHookArgs) => {
      // reset states
      setError(undefined);
      setLoading(true);
      setValue(undefined);

      if (status === "connected") {
        try {
          const receipt = await castVote({
            ...args,
            signTypedDataAsyncFunc: signTypedDataAsync,
            address,
          });
          setValue(receipt);
        } catch (err) {
          if (typeof err === "string") {
            setError(err);
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            console.warn("snapshot castVote error", err);
            setError("unknown error");
          }
        } finally {
          setLoading(false);
        }
      } else {
        setError("no wallet connected");
      }
    },
    [address, signTypedDataAsync, status],
  );

  const reset = () => {
    setValue(undefined);
    setError(undefined);
    setLoading(false);
  };

  return { trigger, value, loading, error, reset };
}
