import useJBMSearch from "~/hooks/juicebox-project-search";

interface Props {
  /**
   * The ID of the project to link to.
   */
  projectId: number | undefined;
  /**
   * Whether or not the project deployed on testnet (goerli).
   */
  isTestnet?: boolean;
}

/**
 * Displays a link to a project on Juicebox.
 */
export default function ProjectLink({ projectId, isTestnet = false }: Props) {
  const { projects } = useJBMSearch(
    { pv: "2", projectId },
    !!projectId && !isTestnet,
  );

  const handle = projects?.[0]?.handle;
  const host = isTestnet
    ? "https://goerli.juicebox.money"
    : "https://juicebox.money";
  const projectUrl = handle
    ? `${host}/@${handle}`
    : `${host}/v2/p/${projectId}`;
  const projectLabel = handle ? `@${handle}` : `#${projectId}`;

  const networkSuffix = isTestnet ? " (goerli)" : "";
  const displayMinifiedName =
    (projects?.[0]?.name || projectLabel) + networkSuffix;

  return (
    <a className="hover:underline" href={projectUrl}>
      {displayMinifiedName}
    </a>
  );
}
