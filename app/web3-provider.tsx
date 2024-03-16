import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { PropsWithChildren, useState } from "react";
import { getWagmiConfig } from "./utils/config";

const queryClient = new QueryClient();

export function Web3Provider({
  children,
  wcProjectId,
}: PropsWithChildren<{
  wcProjectId: string | undefined;
}>) {
  // Remix modules cannot have side effects so the initialization of `wagmi`
  // client happens during render, but the result is cached via `useState`
  // and a lazy initialization function.
  // See: https://remix.run/docs/en/main/guides/constraints#no-module-side-effects
  const [{ config }] = useState(() => {
    const config = getWagmiConfig(wcProjectId);

    return {
      config,
    };
  });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
