import { SyntheticEvent } from "react";
import { useAccount } from "wagmi";
import { z } from "zod";
import { fromZodIssue } from "zod-validation-error";
import useCastVote from "~/hooks/snapshot-cast-vote";
import toast from "react-hot-toast";
import { useRevalidator } from "@remix-run/react";

const BaseVoteSchema = z.object({
  reason: z.string(),
});

const BasicVoteSchema = BaseVoteSchema.extend({
  type: z.enum(["basic", "single-choice"]),
  choice: z.string().transform((val, ctx) => {
    const parsed = parseInt(val);
    if (isNaN(parsed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Not a number",
      });

      return z.NEVER;
    }
    return parsed;
  }),
});

const WeightedQuadraticVoteSchema = BaseVoteSchema.extend({
  type: z.enum(["quadratic", "weighted"]),
  choice: z.record(z.string().min(1), z.number()),
});

const ApprovalRankedVoteSchema = BaseVoteSchema.extend({
  type: z.enum(["approval", "ranked-choice"]),
  choice: z
    .string()
    .transform((val, ctx) => {
      const parsed = parseInt(val);
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Not a number",
        });

        return z.NEVER;
      }
      return parsed;
    })
    .array(),
});

const VoteSchema = z.union([
  BasicVoteSchema,
  WeightedQuadraticVoteSchema,
  ApprovalRankedVoteSchema,
]);
// type VoteFormType = z.infer<typeof VoteSchema>;

// TODO only basic voting is supported
export default function NewVote({
  snapshotSpace,
  proposalSnapshotId,
}: {
  snapshotSpace: string;
  proposalSnapshotId?: string;
}) {
  const account = useAccount();
  const { trigger } = useCastVote();
  const revalidator = useRevalidator();

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();

    const data = Object.fromEntries(
      new FormData(event.currentTarget, event.nativeEvent.submitter),
    );

    const result = VoteSchema.safeParse(data);
    if (!result.success) {
      toast.error(fromZodIssue(result.error.issues[0]).toString());
      return;
    }
    if (proposalSnapshotId) {
      toast.promise(
        trigger({
          space: snapshotSpace,
          proposal: proposalSnapshotId,
          choice: result.data.choice,
          reason: result.data.reason,
          type: "basic",
        }).then(() => revalidator.revalidate()),
        {
          loading: "Submitting...",
          success: "Voted!",
          error: (err) => `${err?.error_description || err.toString()}`,
        },
      );
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
        <input type="hidden" name="type" value="basic" />

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
            value="1"
            className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            For
          </button>
          <button
            type="submit"
            name="choice"
            value="2"
            className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Abstain
          </button>
          <button
            type="submit"
            name="choice"
            value="3"
            className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Against
          </button>
        </div>
      </form>
    </div>
  );
}
