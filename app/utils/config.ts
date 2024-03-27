import { createConfig, http } from "wagmi";
import { mainnet, gnosis } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

export function getWagmiConfig(wcProjectId: string | undefined) {
  return createConfig(
    getDefaultConfig({
      // Your dApps chains
      chains: [mainnet, gnosis],
      transports: {
        // RPC URL for each chain
        [mainnet.id]: http(mainnet.rpcUrls.default.http[0]),
        [gnosis.id]: http(gnosis.rpcUrls.default.http[0]),
      },

      // Required API Keys
      walletConnectProjectId: wcProjectId || "",

      // Required App Info
      appName: "Nance.app",

      // Optional App Info
      appDescription: "Your App Description",
      appUrl: "https://nance.app",
      appIcon: "https://nance.app/favicon.ico",
    }),
  );
}
