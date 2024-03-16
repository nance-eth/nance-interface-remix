import { FormEvent } from "react";
import { useAccount } from "wagmi";
import { z } from "zod";
import useCastVote from "~/hooks/snapshot-cast-vote";
import toast from "react-hot-toast";
import { useRevalidator } from "@remix-run/react";

const VoteFormSchema = z.object({
  reason: z.string(),
  //choice: z.number(),
});

export default function NewVote({
  snapshotSpace,
  proposalSnapshotId,
}: {
  snapshotSpace: string;
  proposalSnapshotId: string;
}) {
  const account = useAccount();
  const { trigger } = useCastVote();
  const revalidator = useRevalidator();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(event.currentTarget));
    const result = VoteFormSchema.safeParse(data);
    if (!result.success) {
      // handle error then return
      console.debug("zod newVote", data, result);
      return;
    }

    toast.promise(
      trigger({
        space: snapshotSpace,
        proposal: proposalSnapshotId,
        choice: 1,
        reason: result.data.reason,
        type: "basic",
      }).then((res) => revalidator.revalidate()),
      {
        loading: "Submiting...",
        success: "Voted!",
        error: (err) => `${err?.error_description || err.toString()}`,
      },
    );
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
    </div>
  );
}
