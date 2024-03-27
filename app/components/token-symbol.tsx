import { ClientOnly } from "remix-utils/client-only";
import { erc20Abi } from "viem";
import { useReadContract } from "wagmi";

export function TokenResolvedSymbol({
  address,
}: {
  address: string | undefined;
}) {
  const { data: tokenSymbol } = useReadContract({
    address,
    abi: erc20Abi,
    functionName: "symbol",
  });

  return <span>{tokenSymbol || "TOKEN"}</span>;
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
