import { FormEvent, useState } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { castVote } from "~/utils/signing";
import { z } from "zod";

const VoteFormSchema = z.object({
  reason: z.string(),
  choice: z.number(),
});

export function NewVote({
  snapshotSpace,
  proposalSnapshotId,
}: {
  snapshotSpace: string;
  proposalSnapshotId: string;
}) {
  const account = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const [error, setError] = useState<string>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    // const data = Object.fromEntries(new FormData(event.currentTarget));
    // const result = VoteFormSchema.safeParse(data);
    // if (!result.success) {
    //   // handle error then return
    //   console.debug(result.error);
    //   setError(result.error.issues[0].message);
    //   return;
    // }

    console.debug("account", account);
    if (account.status === "connected") {
      setError(undefined);
      const { value, error } = await castVote({
        signTypedDataAsyncFunc: signTypedDataAsync,
        address: account.address,
        choice: 1, //result.data.choice,
        reason: "123", //result.data.reason,
        snapshotSpace,
        snapshotProposal: proposalSnapshotId,
        votingType: "basic",
      });
      if (error) {
        setError(error);
      } else {
        console.debug("success with signing", value);
      }
    } else {
      setError("wallet not connected");
    }
  }

  return (
    <div className="mt-6 flex gap-x-3">
      <img
        src={`https://cdn.stamp.fyi/avatar/${account.address}`}
        alt=""
        className="h-6 w-6 flex-none rounded-full bg-gray-50"
      />
      <form onSubmit={handleSubmit} className="relative flex-auto">
        <div className="overflow-hidden rounded-lg pb-12 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
          <label htmlFor="reason" className="sr-only">
            Add your comment
          </label>
          <textarea
            rows={2}
            name="reason"
            className="block w-full resize-none border-0 bg-transparent p-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            placeholder="Add your comment..."
            defaultValue={""}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
          <button
            type="submit"
            name="choice"
            value={1}
            className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            For
          </button>
          <button
            type="submit"
            name="choice"
            value={2}
            className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Abstain
          </button>
          <button
            type="submit"
            name="choice"
            value={3}
            className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Against
          </button>
        </div>
      </form>
      {error && <p className="text-red-500">Error: {error}</p>}
    </div>
  );
}
