import { WagmiProvider, cookieToInitialState } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { PropsWithChildren } from "react";
import { getWagmiConfig } from "./utils/config";

const queryClient = new QueryClient();

export function Web3Provider({
  children,
  wcProjectId,
  cookieHeader,
}: PropsWithChildren<{
  wcProjectId: string | undefined;
  cookieHeader: string | null;
}>) {
  const config = getWagmiConfig(wcProjectId);
  return (
    <WagmiProvider
      config={config}
      initialState={cookieToInitialState(config, cookieHeader)}
    >
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
