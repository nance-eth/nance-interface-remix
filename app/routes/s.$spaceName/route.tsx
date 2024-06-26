import { useEffect } from "react";
import { Disclosure } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import {
  Bars3Icon,
  DocumentPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { classNames } from "~/utils/tailwind";
import { LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { ConnectKitButton } from "connectkit";
import { ClientOnly } from "remix-utils/client-only";
import { getSpace } from "@nance/nance-sdk";
import ErrorPage from "~/components/error-page";
import { getChainIdFromName } from "~/utils/chain";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.spaceName, "Missing spaceName param");

  const url = new URL(request.url);
  const keyword = url.searchParams.get("keyword");

  const spaceInfo = await getSpace(params.spaceName);
  const chainId = getChainIdFromName(spaceInfo.transactorAddress?.network);

  return {
    spaceInfo,
    chainId,
    keyword,
  };
};

export function ErrorBoundary() {
  return <ErrorPage />;
}

export default function SpaceLayout() {
  const { spaceInfo, chainId, keyword } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const navigationParams = new URLSearchParams(navigation.location?.search);
  const searching = navigation.location;

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

  // Sync input state with searchParams
  useEffect(() => {
    const searchField = document.getElementById("keyword");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = keyword || "";
    }
  }, [keyword]);

  return (
    <>
      <div className="min-h-full">
        <div className="bg-indigo-600">
          <Disclosure
            as="nav"
            className="border-b border-indigo-300 border-opacity-25 bg-indigo-600 lg:border-none"
          >
            {({ open }) => (
              <>
                <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
                  <div className="relative flex h-16 items-center justify-between lg:border-b lg:border-indigo-400 lg:border-opacity-25">
                    <div className="flex items-center px-2 lg:px-0">
                      <div className="flex-shrink-0">
                        <Link to={`/s/${spaceInfo.name}`}>
                          <img
                            className="block h-8 w-8"
                            src={`https://cdn.stamp.fyi/space/${spaceInfo.snapshotSpace}`}
                            alt={`Logo of ${spaceInfo.name} space`}
                          />
                        </Link>
                      </div>
                      <div className="hidden lg:ml-10 lg:block">
                        <div className="flex space-x-4">
                          <NavLink
                            to={{
                              pathname: `/s/${spaceInfo.name}`,
                              search: "?cycle=All",
                            }}
                            className={({ isActive }) =>
                              classNames(
                                isActive
                                  ? "bg-indigo-700 text-white"
                                  : "text-white hover:bg-indigo-500 hover:bg-opacity-75",
                                "rounded-md px-3 py-2 text-sm font-medium",
                              )
                            }
                            end
                          >
                            Dashboard
                          </NavLink>

                          <NavLink
                            to="/s"
                            className={({ isActive }) =>
                              classNames(
                                isActive
                                  ? "bg-indigo-700 text-white"
                                  : "text-white hover:bg-indigo-500 hover:bg-opacity-75",
                                "rounded-md px-3 py-2 text-sm font-medium",
                              )
                            }
                            end
                          >
                            Spaces
                          </NavLink>
                        </div>
                      </div>
                    </div>
                    <Form
                      id="search-form"
                      role="search"
                      action={`/s/${spaceInfo.name}`}
                      className="flex flex-1 justify-center px-2 lg:ml-6 lg:justify-end"
                    >
                      <div className="w-full max-w-lg lg:max-w-xs">
                        <label htmlFor="search" className="sr-only">
                          Search
                        </label>
                        <div className="relative text-gray-400 focus-within:text-gray-600">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </div>
                          <input
                            aria-label="Search proposals"
                            type="search"
                            name="keyword"
                            id="keyword"
                            className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-14 text-gray-900 focus:ring-2 focus:ring-white sm:text-sm sm:leading-6"
                            placeholder="Search"
                            defaultValue={
                              (searching
                                ? navigationParams.get("keyword")
                                : keyword) || ""
                            }
                          />
                          <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                            <kbd className="inline-flex items-center rounded border border-gray-200 px-1 font-sans text-xs text-gray-400">
                              ⌘K
                            </kbd>
                          </div>
                        </div>
                      </div>
                    </Form>
                    <div className="flex lg:hidden">
                      {/* Mobile menu button */}
                      <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-indigo-200 hover:bg-indigo-500 hover:bg-opacity-75 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon
                            className="block h-6 w-6"
                            aria-hidden="true"
                          />
                        ) : (
                          <Bars3Icon
                            className="block h-6 w-6"
                            aria-hidden="true"
                          />
                        )}
                      </Disclosure.Button>
                    </div>
                    <div className="hidden lg:ml-4 lg:block">
                      <div className="flex items-center">
                        <Link
                          to="./edit"
                          className="relative flex-shrink-0 rounded-full bg-indigo-600 p-1 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                        >
                          <span className="absolute -inset-1.5" />
                          <span className="sr-only">New proposal</span>
                          <DocumentPlusIcon
                            className="h-6 w-6"
                            aria-hidden="true"
                          />
                        </Link>

                        <div className="relative ml-3 flex-shrink-0">
                          <ClientOnly fallback={<p>wallet</p>}>
                            {() => <ConnectKitButton />}
                          </ClientOnly>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Disclosure.Panel className="lg:hidden">
                  <div className="space-y-1 px-2 pb-3 pt-2">
                    <Disclosure.Button
                      as="a"
                      href={`/s/${spaceInfo.name}`}
                      className={
                        "block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-indigo-500 hover:bg-opacity-75"
                      }
                    >
                      Dashboard
                    </Disclosure.Button>

                    <Disclosure.Button
                      as="a"
                      href="/s"
                      className={
                        "block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-indigo-500 hover:bg-opacity-75"
                      }
                    >
                      Spaces
                    </Disclosure.Button>
                  </div>
                  <div className="border-t border-indigo-700 pb-3 pt-4">
                    <div className="flex items-center px-5">
                      <ClientOnly fallback={<p>wallet</p>}>
                        {() => <ConnectKitButton />}
                      </ClientOnly>
                      <Link
                        to="./edit"
                        className="relative ml-auto flex-shrink-0 rounded-full bg-indigo-600 p-1 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                      >
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">New proposal</span>
                        <DocumentPlusIcon
                          className="h-6 w-6"
                          aria-hidden="true"
                        />
                      </Link>
                    </div>
                  </div>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        </div>

        <main>
          <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            <Outlet
              context={{
                spaceInfo,
                chainId,
              }}
            />
          </div>
        </main>
      </div>
    </>
  );
}
