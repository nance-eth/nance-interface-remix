import { useLoaderData, useRouteError } from "@remix-run/react";
import invariant from "tiny-invariant";
import MarkdownWithTOC from "./markdown-with-toc";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { classNames } from "~/utils/tailwind";
import ActionLabel from "./action-label";
import AddressLink from "~/components/address-link";
import getVotesOfProposal from "~/data/snapshot";
import { formatDistanceStrict, fromUnixTime } from "date-fns";
import { NewVote } from "./new-vote";
import { ClientOnly } from "remix-utils/client-only";
import { getProposal, getSpaceConfig } from "@nance/nance-sdk";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.spaceName, "Missing spaceName param");
  invariant(params.proposalIdOrHash, "Missing spaceName param");

  const proposal = await getProposal({
    space: params.spaceName,
    hash: params.proposalIdOrHash,
  });
  if (!proposal) {
    throw new Response("Not Found", { status: 404 });
  }

  let cycleStageLengths;
  if (proposal.actions?.find((action) => action.type === "Payout")) {
    const spaceConfig = await getSpaceConfig(params.spaceName);
    cycleStageLengths = spaceConfig.cycleStageLengths;
  }

  const votes = await getVotesOfProposal(proposal.voteURL);

  return json({ proposal, votes, cycleStageLengths });
};

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  return (
    <div>
      <h2 className="text-xl text-red-500">Proposal not found</h2>
    </div>
  );
}

export default function Proposal() {
  const { proposal, votes, cycleStageLengths } = useLoaderData<typeof loader>();

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
          <div className="mx-auto flex max-w-2xl flex-col items-center justify-between gap-x-8 gap-y-4 lg:mx-0 lg:max-w-none lg:flex-row">
            <div className="flex items-center gap-x-6">
              <img
                src="https://tailwindui.com/img/logos/48x48/tuple.svg"
                alt=""
                className="h-16 w-16 flex-none rounded-full ring-1 ring-gray-900/10"
              />
              <h1>
                <p className="mt-1 flex gap-x-1 text-xs leading-5 text-gray-500">
                  <span>{`GC-${proposal.governanceCycle}, ${proposal.proposalId} - by`}</span>
                  <AddressLink address={proposal.authorAddress} />
                </p>
                <div className="mt-1 text-base font-semibold leading-6 text-gray-900">
                  {proposal.title}
                </div>
              </h1>
            </div>
            <div className="flex items-center gap-x-4 sm:gap-x-6">
              <button
                type="button"
                className="hidden text-sm font-semibold leading-6 text-gray-900 sm:block"
              >
                Copy URL
              </button>
              <a
                href="#"
                className="hidden text-sm font-semibold leading-6 text-gray-900 sm:block"
              >
                Edit
              </a>
              <a
                href="#"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Vote
              </a>

              <Menu as="div" className="relative sm:hidden">
                <Menu.Button className="-m-3 block p-3">
                  <span className="sr-only">More</span>
                  <EllipsisVerticalIcon
                    className="h-5 w-5 text-gray-500"
                    aria-hidden="true"
                  />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-0.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          className={classNames(
                            active ? "bg-gray-50" : "",
                            "block w-full px-3 py-1 text-left text-sm leading-6 text-gray-900",
                          )}
                        >
                          Copy URL
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? "bg-gray-50" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900",
                          )}
                        >
                          Edit
                        </a>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {/* Proposal */}
          <div className="-mx-4 px-4 py-8 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-16 xl:pb-20 xl:pt-16">
            {proposal.actions && proposal.actions.length > 0 && (
              <div className="mb-6 break-words ">
                <p className="text-gray-400">Proposed Transactions</p>
                <div className="mt-2 space-y-2 text-sm">
                  {proposal.actions?.map((action) => (
                    <ActionLabel
                      action={action}
                      key={action.uuid}
                      cycleStageLengths={cycleStageLengths}
                    />
                  ))}
                </div>
                <div className="mt-2 w-full border-t border-gray-300" />
              </div>
            )}
            <MarkdownWithTOC body={proposal.body || "--- No content ---"} />
          </div>

          {/* Votes */}
          <div className="lg:col-start-3">
            <h2 className="text-sm font-semibold leading-6 text-gray-900">
              Votes
            </h2>
            <ClientOnly fallback={<p>loading</p>}>
              {() => (
                <NewVote
                  snapshotSpace={"jbdao.eth"}
                  proposalSnapshotId={proposal.voteURL}
                />
              )}
            </ClientOnly>
            <ul className="mt-6 space-y-6">
              {votes.map((vote, voteIdx) => (
                <li key={vote.id} className="relative flex gap-x-4">
                  <div
                    className={classNames(
                      voteIdx === votes.length - 1 ? "h-6" : "-bottom-6",
                      "absolute left-0 top-0 flex w-6 justify-center",
                    )}
                  >
                    <div className="w-px bg-gray-200" />
                  </div>
                  {vote.reason ? (
                    <>
                      <img
                        src={`https://cdn.stamp.fyi/avatar/${vote.voter}`}
                        alt=""
                        className="relative mt-3 h-6 w-6 flex-none rounded-full bg-gray-50"
                      />
                      <div className="flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200">
                        <div className="flex justify-between gap-x-4">
                          <div className="py-0.5 text-xs leading-5 text-gray-500">
                            <span className="font-medium text-gray-900">
                              {vote.voter.slice(0, 8)}
                            </span>{" "}
                            voted {vote.choice}
                          </div>
                          <time
                            dateTime={fromUnixTime(vote.created).toISOString()}
                            className="flex-none py-0.5 text-xs leading-5 text-gray-500"
                          >
                            {formatDistanceStrict(
                              fromUnixTime(vote.created),
                              new Date(),
                              {
                                addSuffix: true,
                              },
                            )}
                          </time>
                        </div>
                        <p className="text-sm leading-6 text-gray-500">
                          {vote.reason}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                      </div>
                      <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
                        <span className="font-medium text-gray-900">
                          {vote.voter.slice(0, 8)}
                        </span>{" "}
                        voted {vote.choice}
                      </p>
                      <time
                        dateTime={fromUnixTime(vote.created).toISOString()}
                        className="flex-none py-0.5 text-xs leading-5 text-gray-500"
                      >
                        {formatDistanceStrict(
                          fromUnixTime(vote.created),
                          new Date(),
                          {
                            addSuffix: true,
                          },
                        )}
                      </time>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
