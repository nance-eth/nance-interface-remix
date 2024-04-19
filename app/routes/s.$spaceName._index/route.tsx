import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { PlusIcon, QueueListIcon } from "@heroicons/react/24/solid";
import { SpaceInfo, getProposals } from "@nance/nance-sdk";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useOutletContext } from "@remix-run/react";
import invariant from "tiny-invariant";
import ProposalList from "./proposal-list";
import { classNames } from "~/utils/tailwind";
import ErrorPage from "~/components/error-page";
import GovernanceSchedule from "./governance-schedule";

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

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.spaceName, "Missing spaceName param");

  const url = new URL(request.url);
  const keyword = url.searchParams.get("keyword");
  const cycle = url.searchParams.get("cycle");
  const page = parseInt(url.searchParams.get("page") || "1");
  const searchMode = (keyword || cycle) !== null;

  if (searchMode) {
    const proposalsPacket = await getProposals({
      space: params.spaceName,
      cycle: cycle || "All",
      limit: 8,
      keyword,
      page,
    });
    return {
      searchMode,
      proposalsPacket,
    };
  } else {
    const _proposalsPacket = await getProposals({
      space: params.spaceName,
      cycle: "All",
      limit: 8,
      keyword,
      page,
    });
    const activeProposals = _proposalsPacket.proposals.filter(
      (p) =>
        p.status === "Discussion" ||
        p.status === "Temperature Check" ||
        p.status === "Voting",
    );

    return {
      searchMode,
      proposalsPacket: {
        ..._proposalsPacket,
        proposals: activeProposals,
      },
    };
  }
};

export function ErrorBoundary() {
  return <ErrorPage />;
}

export default function SpaceIndex() {
  const { spaceInfo } = useOutletContext<{
    spaceInfo: SpaceInfo;
  }>();
  const { searchMode } = useLoaderData<typeof loader>();

  return (
    <div className="bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-start px-4 py-2 sm:px-6 sm:py-4 lg:px-8 xl:gap-x-8">
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

          <ProposalList />
        </main>

        {searchMode && (
          <aside className="sticky top-8 hidden w-96 shrink-0 xl:block">
            <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-10 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-base font-semibold leading-8 text-indigo-600">
                  {spaceInfo.displayName || spaceInfo.name}
                </p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  {spaceInfo.currentEvent.title} of GC-{spaceInfo.currentCycle}
                </h1>
              </div>

              <GovernanceSchedule />

              <div className="mx-auto mt-8 flow-root max-w-lg">
                <h2 className="text-base font-semibold leading-6 text-gray-900">
                  Space actions
                </h2>

                <ul className="mt-2 divide-y divide-gray-900/5 border-b border-gray-900/5">
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
