import { ChevronRightIcon } from "@heroicons/react/20/solid";
import {
  DocumentMagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Proposal } from "@nance/nance-sdk";
import { Link } from "@remix-run/react";
import { formatDistanceStrict } from "date-fns";
import AddressLink from "~/components/address-link";
import ProposalStatusIcon from "~/components/proposal-status-icon";

function getLastEditedTime(proposal: Proposal) {
  return proposal.lastEditedTime || proposal.date || "";
}

function EmptyProposalList() {
  return (
    <div className="text-center">
      <div className="flex justify-center">
        <DocumentMagnifyingGlassIcon className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">
        No proposals.
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Try to search with different keyword.
      </p>
      <div className="mt-6">
        <Link
          to={{ search: "?" }}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <XMarkIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          Reset search
        </Link>
      </div>
    </div>
  );
}

export default function ProposalList({
  proposals,
  prefix,
}: {
  proposals: Proposal[];
  prefix: string;
}) {
  if (proposals.length === 0) {
    return <EmptyProposalList />;
  }

  return (
    <ul
      role="list"
      className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
    >
      {proposals.map((proposal) => (
        <li
          key={proposal.hash}
          className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6"
        >
          <div className="flex min-w-0 gap-x-4">
            <ProposalStatusIcon status={proposal.status} />
            <div className="min-w-0 flex-auto">
              <p className="text-sm font-semibold leading-6 text-gray-900">
                <Link
                  prefetch="intent"
                  to={proposal.proposalId?.toString() || proposal.hash}
                >
                  <span className="absolute inset-x-0 -top-px bottom-0" />
                  {proposal.title}
                </Link>
              </p>
              <p className="mt-1 flex gap-x-1 text-xs leading-5 text-gray-500">
                <span>{`GC-${proposal.governanceCycle}, ${prefix}${proposal.proposalId} - by`}</span>
                <AddressLink address={proposal.authorAddress} />
              </p>
            </div>
          </div>
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
                  <p className="text-xs leading-5 text-gray-500">Online</p>
                </div>
              ) : (
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  <span className="sr-only">Last edited</span>
                  <time dateTime={getLastEditedTime(proposal)}>
                    {formatDistanceStrict(
                      new Date(getLastEditedTime(proposal)),
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
    </ul>
  );
}
