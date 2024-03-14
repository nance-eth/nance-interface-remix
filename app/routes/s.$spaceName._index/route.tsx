import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { PlusIcon, QueueListIcon } from "@heroicons/react/24/solid";
import { ProposalsPacket, SpaceInfo, getSpaceConfig } from "@nance/nance-sdk";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useOutletContext } from "@remix-run/react";
import { format } from "date-fns";
import invariant from "tiny-invariant";
import ProposalList from "./proposal-list";
import { classNames } from "~/utils/tailwind";
import { calculateRecent3Schedules } from "~/utils/governanceCycle";

const links = [
  {
    name: "New Proposal",
    href: "#",
    description: "Create a new proposal.",
    icon: PlusIcon,
  },
  {
    name: "Queue Transactions",
    href: "#",
    description: "Queue transactions from passed proposals.",
    icon: QueueListIcon,
  },
];

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.spaceName, "Missing spaceName param");
  const spaceConfig = await getSpaceConfig(params.spaceName);
  if (!spaceConfig) {
    throw new Response("Not Found", { status: 404 });
  }

  return {
    cycleStageLengths: spaceConfig.cycleStageLengths,
    displayName: spaceConfig.displayName,
  };
};

export default function SpaceIndex() {
  const { spaceInfo, proposalsPacket, searchMode } = useOutletContext<{
    spaceInfo: SpaceInfo;
    proposalsPacket: ProposalsPacket;
    searchMode: boolean;
  }>();
  const { cycleStageLengths, displayName } = useLoaderData<typeof loader>();

  const schedules = calculateRecent3Schedules(
    cycleStageLengths,
    spaceInfo.currentEvent,
  );

  return (
    <div className="bg-white">
      <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-gray-50 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
        <div
          className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
          aria-hidden="true"
        >
          <div
            className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-30"
            style={{
              clipPath:
                "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
            }}
          />
        </div>
        <div
          className="absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
          aria-hidden="true"
        >
          <div
            className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-30"
            style={{
              clipPath:
                "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
            }}
          />
        </div>
        <p className="text-sm leading-6 text-gray-900">
          This site is still under construction, you can search and view
          proposals for now.{" "}
          <a
            href="https://nance.app"
            className="whitespace-nowrap font-semibold"
          >
            Check production version&nbsp;<span aria-hidden="true">&rarr;</span>
          </a>
        </p>
        <div className="flex flex-1 justify-end">
          <button
            type="button"
            className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
          >
            <span className="sr-only">Dismiss</span>
            <XMarkIcon className="h-5 w-5 text-gray-900" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl items-start px-4 py-10 sm:px-6 lg:px-8 xl:gap-x-8">
        <main className="flex-1">
          <div className="mb-4 space-x-2">
            <Link
              to={`/s/${spaceInfo.name}`}
              className={classNames(
                "mt-4 text-xl font-bold tracking-tight sm:text-3xl",
                searchMode ? "text-gray-300" : "text-gray-900",
              )}
            >
              Active
            </Link>
            <Link
              to={{
                pathname: `/s/${spaceInfo.name}`,
                search: "?cycle=All",
              }}
              className={classNames(
                "mt-4 text-xl font-bold tracking-tight sm:text-3xl",
                searchMode ? "text-gray-900" : "text-gray-300",
              )}
            >
              All
            </Link>
          </div>

          <ProposalList
            proposals={proposalsPacket.proposals}
            prefix={proposalsPacket.proposalInfo.proposalIdPrefix}
            hasMore={proposalsPacket.hasMore}
          />
        </main>

        {searchMode && (
          <aside className="sticky top-8 hidden w-96 shrink-0 xl:block">
            <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-10 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-base font-semibold leading-8 text-indigo-600">
                  {displayName || spaceInfo.name}
                </p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  {spaceInfo.currentEvent.title} of GC-{spaceInfo.currentCycle}
                </h1>
              </div>

              <div className="mx-auto mt-8 flow-root max-w-lg">
                <h2 className="text-base font-semibold leading-6 text-gray-900">
                  Governance schedule
                </h2>
                <ol className="mt-2 divide-y divide-gray-200 text-sm leading-6 text-gray-500">
                  {schedules.map((schedule, index) => (
                    <li
                      className={classNames(
                        "py-4 sm:flex",
                        index === 1 && "text-indigo-600",
                      )}
                      key={schedule.date.toISOString()}
                    >
                      <time
                        dateTime={schedule.date.toISOString()}
                        className="w-28 flex-none"
                      >
                        {format(schedule.date, "EEE, LLL d")}
                      </time>
                      <p className="mt-2 flex-auto sm:mt-0">
                        {schedule.eventTitle}
                      </p>
                      <p className="flex-none sm:ml-6">
                        <time dateTime={schedule.date.toISOString()}>
                          {format(schedule.date, "h:mm aa")}
                        </time>
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mx-auto mt-8 flow-root max-w-lg">
                <h2 className="text-base font-semibold leading-6 text-gray-900">
                  Space actions
                </h2>

                <ul
                  role="list"
                  className="mt-2 divide-y divide-gray-900/5 border-b border-gray-900/5"
                >
                  {links.map((link, linkIdx) => (
                    <li key={linkIdx} className="relative flex gap-x-6 py-6">
                      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg shadow-sm ring-1 ring-gray-900/10">
                        <link.icon
                          className="h-6 w-6 text-indigo-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex-auto">
                        <h3 className="text-sm font-semibold leading-6 text-gray-900">
                          <a href={link.href}>
                            <span
                              className="absolute inset-0"
                              aria-hidden="true"
                            />
                            {link.name}
                          </a>
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-gray-600">
                          {link.description}
                        </p>
                      </div>
                      <div className="flex-none self-center">
                        <ChevronRightIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
