import { Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import MarkdownWithTOC from "./markdown-with-toc";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import NewVote from "./new-vote";
import { ClientOnly } from "remix-utils/client-only";
import { getProposal, getSpaceConfig } from "@nance/nance-sdk";
import ErrorPage from "~/components/error-page";
import toast from "react-hot-toast";
import VoteList from "./vote-list";
import { getVotesOfProposal } from "~/data/snapshot";
import ProposalInfo from "~/components/proposal-info";
import ActionLabel from "~/components/action-label";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.spaceName, "Missing spaceName param");
  invariant(params.proposalIdOrUuid, "Missing proposalIdOrUuid param");
  const url = new URL(request.url);
  const quote = url.searchParams.get("quote");

  const proposalPacket = await getProposal({
    space: params.spaceName,
    uuid: params.proposalIdOrUuid,
  });

  let cycleStageLengths;
  if (proposalPacket.actions?.find((action) => action.type === "Payout")) {
    const spaceConfig = await getSpaceConfig(params.spaceName);
    cycleStageLengths = spaceConfig.cycleStageLengths;
  }

  const votes = await getVotesOfProposal(proposalPacket.voteURL, 1000);

  return json({ proposalPacket, votes, cycleStageLengths, quote });
};

export function ErrorBoundary() {
  return <ErrorPage />;
}

export default function Proposal() {
  const { proposalPacket, votes, cycleStageLengths, quote } =
    useLoaderData<typeof loader>();

  return (
    <>
      <header className="relative isolate">
        <div
          className="absolute inset-0 -z-10 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute left-16 top-full -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
            <div
              className="aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#FF80B5] to-[#9089FC]"
              style={{
                clipPath:
                  "polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)",
              }}
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gray-900/5" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto flex max-w-2xl flex-wrap justify-between gap-x-8 gap-y-4 lg:mx-0 lg:max-w-none">
            <ProposalInfo
              proposalPacket={proposalPacket}
              votingInfo={votes?.proposal}
              linkDisabled
            />
            <div className="flex items-center justify-end gap-x-4 sm:justify-center sm:gap-x-6">
              <button
                type="button"
                onClick={() => {
                  toast.success("Copied!")
                }}
                className="text-sm font-semibold leading-6 text-gray-900 sm:block"
              >
                Copy URL
              </button>
              <Link
                to={{
                  pathname: "../edit",
                  search: `?proposal=${proposalPacket.uuid}`,
                }}
                className="text-sm font-semibold leading-6 text-gray-900 sm:block"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => {
                  toast.error("DELETE TODO!");
                }}
                className="text-sm font-semibold leading-6 text-gray-900 sm:block"
              >
                Delete
              </button>
              <a
                href="#votes"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Vote
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {/* Proposal */}
          <div className="-mx-4 px-4 py-8 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-16 xl:pb-20 xl:pt-16">
            {proposalPacket.actions && proposalPacket.actions.length > 0 && (
              <div className="mb-6 break-words ">
                <p className="text-gray-400">Proposed Transactions</p>
                <div className="mt-2 space-y-2 text-sm">
                  {proposalPacket.actions?.map((action) => (
                    <ActionLabel
                      action={action}
                      key={action.uuid}
                      proposalCycle={proposalPacket.governanceCycle}
                      cycleStageLengths={cycleStageLengths}
                    />
                  ))}
                </div>
                <div className="mt-2 w-full border-t border-gray-300" />
              </div>
            )}
            <MarkdownWithTOC
              body={proposalPacket.body || "--- No content ---"}
              highlightPattern={quote || undefined}
            />
          </div>

          {/* Votes */}
          {proposalPacket.voteURL && (
            <div className="lg:col-start-3">
              <h2
                className="text-sm font-semibold leading-6 text-gray-900"
                id="votes"
              >
                Votes
              </h2>
              <ClientOnly fallback={<p>loading</p>}>
                {() => (
                  <NewVote
                    snapshotSpace={"jbdao.eth"}
                    proposalSnapshotId={proposalPacket.voteURL as string}
                  />
                )}
              </ClientOnly>
              <VoteList votes={votes?.votes} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
