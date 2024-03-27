import { gnosis, mainnet } from "viem/chains";

export function getChainConfig(chainId: number | undefined) {
  if (chainId === gnosis.id) return gnosis;

  return mainnet;
}

export function getChainIdFromName(chainName: string | undefined) {
  const chainMap: { [key: string]: number } = {
    mainnet: mainnet.id,
    gnosis: gnosis.id,
  };

  return chainMap[chainName || "mainnet"];
}
