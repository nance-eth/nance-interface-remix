import { getAllSpaces } from "@nance/nance-sdk";
import SpaceList from "./space-list";
import { Link, useLoaderData } from "@remix-run/react";
import { Disclosure } from "@headlessui/react";
import favicon from "../../images/favicon.ico";

export const loader = async () => {
  const spaceInfos = await getAllSpaces();

  return {
    spaceInfos: spaceInfos.sort((a, b) => b.nextProposalId - a.nextProposalId),
  };
};

export default function SpaceListPage() {
  const { spaceInfos } = useLoaderData<typeof loader>();

  return (
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
                      <Link to={`/`}>
                        <img
                          className="block h-8 w-8"
                          src={favicon}
                          alt={`Logo of Nance.app`}
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Disclosure>
      </div>

      <main>
        <div className="mx-auto max-w-7xl py-12 sm:px-6 lg:px-8">
          <SpaceList spaceInfos={spaceInfos} />
        </div>
      </main>
    </div>
  );
}
