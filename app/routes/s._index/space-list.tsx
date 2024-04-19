import { ArrowUpRightIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { SpaceInfo } from "@nance/nance-sdk";

export default function SpaceList({ spaceInfos }: { spaceInfos: SpaceInfo[] }) {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {spaceInfos.map((spaceInfo) => (
        <li
          key={spaceInfo.name}
          className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
        >
          <div className="flex flex-1 flex-col p-8">
            <img
              className="mx-auto h-32 w-32 flex-shrink-0 rounded-full"
              src={`https://cdn.stamp.fyi/space/${spaceInfo.snapshotSpace}`}
              alt={`Logo of ${spaceInfo.name} space`}
            />
            <h3 className="mt-6 text-sm font-medium text-gray-900">
              {spaceInfo.displayName || spaceInfo.name}
            </h3>
            <dl className="mt-1 flex flex-grow flex-col justify-between">
              <dt className="sr-only">Cycle</dt>
              <dd className="text-sm text-gray-500">{`${
                spaceInfo.currentEvent?.title
                  ? `${spaceInfo.currentEvent?.title} of `
                  : ""
              }GC${spaceInfo.currentCycle}`}</dd>
              <dt className="sr-only">Proposals</dt>
              <dd className="mt-3">
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {`${spaceInfo.nextProposalId - 1} proposals`}
                </span>
              </dd>
            </dl>
          </div>
          <div>
            <div className="-mt-px flex divide-x divide-gray-200">
              <div className="flex w-0 flex-1">
                <a
                  href={`https://juicebox.money/v2/p/${parseInt(spaceInfo.juiceboxProjectId)}`}
                  className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                >
                  <BanknotesIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  Treasury
                </a>
              </div>
              <div className="-ml-px flex w-0 flex-1">
                <a
                  href={`/s/${spaceInfo.name}`}
                  className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                >
                  <ArrowUpRightIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  Space
                </a>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
