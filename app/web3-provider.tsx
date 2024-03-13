import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { PropsWithChildren } from "react";

const queryClient = new QueryClient();

export function Web3Provider({
  children,
  wcProjectId,
}: PropsWithChildren<{ wcProjectId: string | undefined }>) {
  const defaultConfig = getDefaultConfig({
    // Your dApps chains
    chains: [mainnet],
    transports: {
      // RPC URL for each chain
      [mainnet.id]: http(mainnet.rpcUrls.default.http[0]),
    },

    // Required API Keys
    walletConnectProjectId: wcProjectId || "",

    // Required App Info
    appName: "Nance.app",

    // Optional App Info
    appDescription: "Your App Description",
    appUrl: "https://nance.app",
    appIcon: "https://nance.app/favicon.ico",
  });
  defaultConfig.ssr = true;
  const config = createConfig(defaultConfig);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
