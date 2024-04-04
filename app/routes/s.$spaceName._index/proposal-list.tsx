import { ChevronRightIcon } from "@heroicons/react/20/solid";
import {
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
  DocumentMagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ProposalsPacket } from "@nance/nance-sdk";
import { Link, useOutletContext, useSearchParams } from "@remix-run/react";
import { formatDistanceStrict } from "date-fns";
import { classNames } from "~/utils/tailwind";
import { duplicateAndSetParams } from "~/utils/url";
import { SnapshotGraphqlProposalVotingInfo } from "~/data/snapshot";
import ProposalInfo from "~/components/proposal-info";

function NoResults() {
  return (
    <div className="text-center">
      <div className="flex justify-center">
        <DocumentMagnifyingGlassIcon className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">
        No proposals satisified your requirement.
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Try to search with different keyword.
      </p>
      <div className="mt-6">
        <Link
          to={{ search: "?cycle=All" }}
          prefetch="viewport"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <XMarkIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          Reset search
        </Link>
      </div>
    </div>
  );
}

function NoActiveProposals() {
  return (
    <div className="text-center">
      <div className="flex justify-center">
        <DocumentMagnifyingGlassIcon className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">
        No active proposals for now.
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Try to browse history proposals.
      </p>
      <div className="mt-6">
        <Link
          to={{ search: "?cycle=All" }}
          prefetch="viewport"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Browse proposals
        </Link>
      </div>
    </div>
  );
}

export default function ProposalList() {
  const { proposalsPacket, votingInfoMap, searchMode } = useOutletContext<{
    proposalsPacket: ProposalsPacket;
    votingInfoMap: { [key: string]: SnapshotGraphqlProposalVotingInfo };
    searchMode: boolean;
  }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const proposals = proposalsPacket.proposals.filter(
    (p) => searchMode || p.status !== "Archived",
  );
  const hasMore = proposalsPacket.hasMore;

  // pagination
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 8;
  const startIndex = 1 + limit * (page - 1);
  const endIndex = startIndex + proposals.length - 1;

  if (proposals.length === 0) {
    if (searchMode) {
      return <NoResults />;
    } else {
      return <NoActiveProposals />;
    }
  }

  return (
    <ul className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      {proposals.map((proposal) => (
        <li
          key={proposal.uuid}
          className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6"
        >
          <ProposalInfo
            proposal={proposal}
            votingInfo={votingInfoMap[proposal.voteURL || ""]}
          />
          <div className="hidden shrink-0 items-center gap-x-4 sm:flex">
            <div className="flex sm:flex-col sm:items-end">
              <p className="text-sm leading-6 text-gray-900">
                {proposal.status}
              </p>
              {["Voting", "Temperature Check"].includes(proposal.status) ? (
                <div className="mt-1 flex items-center gap-x-1.5">
                  <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-xs leading-5 text-gray-500">Voting</p>
                </div>
              ) : (
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  <span className="sr-only">Last edited</span>
                  <time dateTime={proposal.lastEditedTime}>
                    {formatDistanceStrict(
                      new Date(proposal.lastEditedTime),
                      new Date(),
                      { addSuffix: true },
                    )}
                  </time>
                </p>
              )}
            </div>
            <ChevronRightIcon
              className="h-5 w-5 flex-none text-gray-400"
              aria-hidden="true"
            />
          </div>
        </li>
      ))}

      <li className="relative flex items-center justify-between gap-x-6 px-4 py-5 sm:px-6">
        <div className={classNames((page > 1 || hasMore) && "hidden sm:block")}>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex}</span> to{" "}
            <span className="font-medium">{endIndex}</span> results
          </p>
        </div>
        <div
          className={classNames(
            "flex flex-1",
            page === 1 || !hasMore
              ? "justify-end"
              : "justify-between sm:justify-end",
          )}
        >
          {page > 1 && (
            <Link
              to={{
                search:
                  "?" +
                  duplicateAndSetParams(
                    searchParams,
                    "page",
                    (page - 1).toString(),
                  ).toString(),
              }}
              prefetch="intent"
              className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
            >
              <ArrowLongLeftIcon
                className="mr-3 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              Previous
            </Link>
          )}

          {hasMore && (
            <Link
              to={{
                search:
                  "?" +
                  duplicateAndSetParams(
                    searchParams,
                    "page",
                    (page + 1).toString(),
                  ).toString(),
              }}
              prefetch="intent"
              className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
            >
              Next
              <ArrowLongRightIcon
                className="ml-3 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Link>
          )}
        </div>
      </li>
    </ul>
  );
}
