import HeroSection from "./hero-section";

export default function Index() {
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
