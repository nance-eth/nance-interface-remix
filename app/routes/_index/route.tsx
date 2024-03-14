import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import HeroSection, { SimpleSpaceEntry } from "./hero-section";
import { getAllSpaces } from "@nance/nance-sdk";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const spaces = await getAllSpaces();
  const top4Spaces: SimpleSpaceEntry[] = spaces
    // filter test spaces
    .filter((s) => !["gnance", "waterbox", "nance"].includes(s.name))
    // sort by proposal count
    .sort((a, b) => b.currentCycle - a.currentCycle)
    // top 4
    .slice(0, 4)
    .map((s) => {
      return {
        id: s.name,
        name: s.name,
        snapshotSpace: s.snapshotSpace,
      };
    });

  return json({ spaces: top4Spaces });
};

export default function Index() {
  const { spaces } = useLoaderData<typeof loader>();

  return <HeroSection top4Spaces={spaces} />;
}
