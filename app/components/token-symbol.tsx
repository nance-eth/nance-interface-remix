import { ClientOnly } from "remix-utils/client-only";
import { erc20Abi } from "viem";
import { useReadContract } from "wagmi";
import useChainConfigOfSpace from "~/hooks/chain-config-of-space";

export function TokenResolvedSymbol({
  address,
}: {
  address: string | undefined;
}) {
  const {
    id: chainId,
    blockExplorers: {
      default: { url },
    },
  } = useChainConfigOfSpace();
  const { data: tokenSymbol } = useReadContract({
    address: address as `0x${string}`,
    abi: erc20Abi,
    functionName: "symbol",
    chainId,
  });

  return (
    <a href={`${url}/address/${address}`} className="break-all hover:underline">
      {tokenSymbol || "TOKEN"}
    </a>
  );
}

export default function TokenSymbol({
  address,
}: {
  address: string | undefined;
}) {
  return (
    <ClientOnly fallback={<span>TOKEN</span>}>
      {() => <TokenResolvedSymbol address={address} />}
    </ClientOnly>
  );
}
