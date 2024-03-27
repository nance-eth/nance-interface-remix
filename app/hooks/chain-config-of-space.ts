import { useOutletContext } from "@remix-run/react";
import { getChainConfig } from "~/utils/chain";

/**
 * get chain config of current space
 */
export default function useChainConfigOfSpace() {
  const { chainId } = useOutletContext<{ chainId: number }>();
  return getChainConfig(chainId);
}
