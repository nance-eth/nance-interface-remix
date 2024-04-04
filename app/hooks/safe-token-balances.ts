import { mainnet, goerli, optimism, gnosis } from "wagmi/chains";
import useChainConfigOfSpace from "./chain-config-of-space";
import { skipToken, useQuery } from "@tanstack/react-query";

const safeServiceURL = {
  [mainnet.id]: "mainnet",
  [goerli.id]: "goerli",
  [optimism.id]: "optimism",
  [gnosis.id]: "gnosis-chain",
};

export interface SafeBalanceUsdResponse {
  tokenAddress: string | null;
  token: {
    name: string;
    symbol: string;
    decimals: number;
    logoUri: string;
  } | null;
  balance: string;
  ethValue: string;
  timestamp: string;
  fiatBalance: string;
  fiatConversion: string;
  fiatCode: string;
}

export function useSafeTokenBalances(
  address: string,
  shouldFetch: boolean = true,
) {
  const { id } = useChainConfigOfSpace();

  const api = `https://safe-transaction-${safeServiceURL[id]}.safe.global/api/v1`;
  const endpoint = `/safes/${address}/balances/usd/?trusted=true&exclude_spam=true`;
  const url = api + endpoint;

  return useQuery({
    queryKey: [url, shouldFetch],
    queryFn: shouldFetch
      ? async () => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const json = await response.json();
          return json as SafeBalanceUsdResponse[];
        }
      : skipToken,
  });
}
