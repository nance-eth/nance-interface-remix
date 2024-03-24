import { useLoaderData } from "@remix-run/react";
import HeroSection, { SimpleSpaceEntry } from "./hero-section";
import { getAllSpaces } from "@nance/nance-sdk";

export async function clientLoader() {
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

  return { spaces: top4Spaces };
}
clientLoader.hydrate = true;

export function HydrateFallback() {
  const spaces = [
    { id: "juicebox", name: "juicebox", snapshotSpace: "jbdao.eth" },
    {
      id: "daosquare",
      name: "daosquare",
      snapshotSpace: "community.daosquare.eth",
    },
    { id: "moondao", name: "moondao", snapshotSpace: "tomoondao.eth" },
    {
      id: "thirstythirsty",
      name: "thirstythirsty",
      snapshotSpace: "gov.thirstythirsty.eth",
    },
  ];
  return <HeroSection top4Spaces={spaces} />;
}

export default function Index() {
  const { spaces } = useLoaderData<typeof clientLoader>();

  return <HeroSection top4Spaces={spaces} />;
}
