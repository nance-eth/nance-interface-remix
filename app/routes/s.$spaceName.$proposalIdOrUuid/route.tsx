import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import MarkdownWithTOC from "./markdown-with-toc";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import NewVote from "./new-vote";
import { ClientOnly } from "remix-utils/client-only";
import { getProposal } from "@nance/nance-sdk";
import ErrorPage from "~/components/error-page";
import VoteList from "./vote-list";
import ProposalInfo from "~/components/proposal-info";
import ActionLabel from "~/components/action-label";
import DropDownMenu from "./dropdown-menu";
import { useVotesOfProposal } from "~/data/snapshot";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.spaceName, "Missing spaceName param");
  invariant(params.proposalIdOrUuid, "Missing proposalIdOrUuid param");
  const url = new URL(request.url);
  const quote = url.searchParams.get("quote");

  const proposalPacket = await getProposal({
    space: params.spaceName,
    uuid: params.proposalIdOrUuid,
  });

  return json({ proposalPacket, quote });
};

export function ErrorBoundary() {
  return <ErrorPage />;
}

export default function Proposal() {
  const { proposalPacket, quote } = useLoaderData<typeof loader>();
  const { data } = useVotesOfProposal(
    proposalPacket.voteURL,
    1000,
    0,
    "created",
    proposalPacket.voteURL !== undefined,
  );

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
          <div className="flex flex-row justify-between">
            <ProposalInfo
              proposalPacket={proposalPacket}
              votingInfo={data?.proposal}
              linkDisabled
            />
            <ClientOnly fallback={<p>loading</p>}>
              {() => <DropDownMenu proposalPacket={proposalPacket} />}
            </ClientOnly>
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
              <VoteList votes={data?.votes} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
