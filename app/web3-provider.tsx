import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { PropsWithChildren } from "react";
import { getWagmiConfig } from "./utils/config";

export function Web3Provider({
  children,
  wcProjectId,
}: PropsWithChildren<{
  wcProjectId: string | undefined;
}>) {
  const config = getWagmiConfig(wcProjectId);
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
