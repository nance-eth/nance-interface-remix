import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { PlusIcon, QueueListIcon, RssIcon } from "@heroicons/react/24/solid";
import { SpaceInfo } from "@nance/nance-sdk";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { addDays, format, subDays } from "date-fns";
import invariant from "tiny-invariant";
import { getSpaceConfig } from "~/data/nance";

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
  {
    name: "Subscribe Us",
    href: "#",
    description: "Subscribe our latest news.",
    icon: RssIcon,
  },
];

const EVENTS = ["Temperature Check", "Snapshot Vote", "Execution", "Delay"];

function calculateSchedules(
  startDate: Date,
  currentEvent: string,
  cycleStageLengths: number[],
) {
  const currentIndex = EVENTS.indexOf(currentEvent);
  const previousEventDate = subDays(
    startDate,
    cycleStageLengths[(currentIndex - 1 + 4) % 4],
  );
  const nextEventDate = addDays(
    startDate,
    cycleStageLengths[(currentIndex + 1) % 4],
  );
  return [previousEventDate, startDate, nextEventDate];
}

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
  const spaceInfo = useOutletContext<SpaceInfo>();
  const { cycleStageLengths, displayName } = useLoaderData<typeof loader>();
  const schedules = calculateSchedules(
    new Date(spaceInfo.currentEvent.start),
    spaceInfo.currentEvent.title,
    cycleStageLengths,
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

      <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-10 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-base font-semibold leading-8 text-indigo-600">
            {displayName || spaceInfo.name}
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {spaceInfo.currentEvent.title} of GC-{spaceInfo.currentCycle}
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-600 sm:mt-6 sm:text-lg sm:leading-8">
            You can view proposals on the sidebar.
          </p>
        </div>

        <div className="mx-auto mt-8 flow-root max-w-lg">
          <h2 className="text-base font-semibold leading-6 text-gray-900">
            Governance schedule
          </h2>
          <ol className="mt-2 divide-y divide-gray-200 text-sm leading-6 text-gray-500">
            <li className="py-4 sm:flex">
              <time
                dateTime={schedules[0].toISOString()}
                className="w-28 flex-none"
              >
                {format(schedules[0], "EEE, LLL d")}
              </time>
              <p className="mt-2 flex-auto sm:mt-0">Temperature Check</p>
              <p className="flex-none sm:ml-6">
                <time dateTime={schedules[0].toISOString()}>
                  {format(schedules[0], "h:mm aa")}
                </time>
              </p>
            </li>
            <li className="py-4 text-indigo-600 sm:flex">
              <time
                dateTime={schedules[1].toISOString()}
                className="w-28 flex-none"
              >
                {format(schedules[1], "EEE, LLL d")}
              </time>
              <p className="mt-2 flex-auto sm:mt-0">Snasphot vote</p>
              <p className="flex-none sm:ml-6">
                <time dateTime={schedules[1].toISOString()}>
                  {format(schedules[1], "h:mm aa")}
                </time>
              </p>
            </li>
            <li className="py-4 sm:flex">
              <time
                dateTime={schedules[2].toISOString()}
                className="w-28 flex-none"
              >
                {format(schedules[2], "EEE, LLL d")}
              </time>
              <p className="mt-2 flex-auto sm:mt-0">Multisig execution</p>
              <p className="flex-none sm:ml-6">
                <time dateTime={schedules[2].toISOString()}>
                  {format(schedules[2], "h:mm aa")}
                </time>
              </p>
            </li>
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
                      <span className="absolute inset-0" aria-hidden="true" />
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

          <div className="mt-10 flex justify-center">
            <a
              href="/"
              className="text-sm font-semibold leading-6 text-indigo-600"
            >
              <span aria-hidden="true" className="mr-2">
                &larr;
              </span>
              Check other spaces on Nance
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
