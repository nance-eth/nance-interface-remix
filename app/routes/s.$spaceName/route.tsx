import type { LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import {
  useLoaderData,
  Outlet,
  NavLink,
  Link,
  Form,
  useNavigation,
  useLocation,
  useSearchParams,
} from "@remix-run/react";
import { Fragment, useEffect, useState } from "react";

import { Dialog, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
} from "@heroicons/react/24/outline";

import { getProposals, getSpace } from "~/data/nance";
import { classNames } from "~/utils/tailwind";
import { duplicateAndSetParams } from "~/utils/url";
import ProposalStatus from "./status-icon";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const keyword = url.searchParams.get("keyword");
  const page = parseInt(url.searchParams.get("page") || "1");

  invariant(params.spaceName, "Missing spaceName param");
  const spaceInfo = await getSpace(params.spaceName);
  if (!spaceInfo) {
    throw new Response("Not Found", { status: 404 });
  }
  const proposalsPacket = await getProposals({
    space: params.spaceName,
    cycle: "All",
    limit: 10,
    keyword,
    page,
  });
  if (!proposalsPacket) {
    throw new Response("Not Found", { status: 404 });
  }

  return { spaceInfo, proposalsPacket, keyword, page };
};

export default function Space() {
  const { spaceInfo, proposalsPacket, keyword, page } =
    useLoaderData<typeof loader>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigation = useNavigation();

  const navigationParams = new URLSearchParams(navigation.location?.search);
  const changingProposal =
    navigation.location &&
    navigation.location.pathname.localeCompare(location.pathname) !== 0;
  const searching = navigation.location && !changingProposal;

  // Sync input state with searchParams
  useEffect(() => {
    const searchField = document.getElementById("keyword");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = keyword || "";
    }
  }, [keyword]);

  // Cmd + K
  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "k") {
        const searchField = document.getElementById("keyword");
        searchField?.focus();
      }
    };

    window.addEventListener("keydown", keyDownHandler);
    return () => {
      window.removeEventListener("keydown", keyDownHandler);
    };
  }, []);

  function Sidebar() {
    return (
      <>
        <div className="flex h-16 shrink-0 items-center">
          <Link to={`/s/${spaceInfo.name}`}>
            <img
              className="h-8 w-auto"
              src={`https://cdn.stamp.fyi/space/${spaceInfo.snapshotSpace}`}
              alt={`Logo of ${spaceInfo.name} space`}
            />
          </Link>
        </div>

        <div>
          <Form id="search-form" role="search">
            <div className="relative flex items-center">
              <input
                aria-label="Search proposals"
                type="search"
                name="keyword"
                id="keyword"
                defaultValue={
                  (searching ? navigationParams.get("keyword") : keyword) || ""
                }
                placeholder="Search"
                className={classNames(
                  "block w-full rounded-md border-0 py-1.5 pl-3 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
                  searching && "animate-pulse",
                )}
              />

              <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                <kbd className="inline-flex items-center rounded border border-gray-200 px-1 font-sans text-xs text-gray-400">
                  ⌘K
                </kbd>
              </div>
            </div>
          </Form>
        </div>

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul
                role="list"
                className={classNames(
                  "-mx-2 space-y-1",
                  searching && "animate-pulse",
                )}
              >
                {proposalsPacket.proposals.map((proposal) => (
                  <li key={proposal.hash}>
                    <NavLink
                      prefetch="intent"
                      to={{
                        pathname:
                          proposal.proposalId?.toString() || proposal.hash,
                        search: "?" + searchParams.toString(),
                      }}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive, isPending }) =>
                        classNames(
                          isActive
                            ? "bg-gray-50 text-indigo-600"
                            : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                          isPending && "animate-pulse",
                          "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                        )
                      }
                    >
                      {({ isActive, isPending }) => (
                        <>
                          <ProposalStatus
                            isActive={isActive}
                            status={proposal.status}
                          />
                          {proposal.title}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <div
                className={classNames(
                  "flex items-center justify-between border-t border-gray-200 px-4 sm:px-0",
                  searching && "animate-pulse",
                )}
              >
                <div className="-mt-px flex w-0 flex-1">
                  {page - 1 >= 1 && (
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
                      className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      <ArrowLongLeftIcon
                        className="mr-3 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      Previous
                    </Link>
                  )}
                </div>
                <div className="-mt-px flex w-0 flex-1 justify-end">
                  {proposalsPacket.hasMore && (
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
                      className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Next
                      <ArrowLongRightIcon
                        className="ml-3 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </Link>
                  )}
                </div>
              </div>
            </li>
            <li className="-mx-6 mt-auto">
              <a
                href="#"
                className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
              >
                <img
                  className="h-8 w-8 rounded-full bg-gray-50"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
                <span className="sr-only">Your profile</span>
                <span aria-hidden="true">Tom Cook</span>
              </a>
            </li>
          </ul>
        </nav>
      </>
    );
  }

  return (
    <>
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                    <Sidebar />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
            <Sidebar />
          </div>
        </div>

        <div className="sticky top-0 z-40 flex items-center justify-between gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 flex p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            <p className="ml-2">Proposals</p>
          </button>
          <a href="#">
            <span className="sr-only">Your profile</span>
            <img
              className="h-8 w-8 rounded-full bg-gray-50"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
            />
          </a>
        </div>

        <main className="py-10 lg:pl-72">
          <div
            className={classNames(
              "px-4 sm:px-6 lg:px-8",
              changingProposal && "animate-pulse",
            )}
          >
            <Outlet context={spaceInfo} />
          </div>
        </main>
      </div>
    </>
  );
}
