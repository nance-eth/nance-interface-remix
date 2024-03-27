import { ClientOnly } from "remix-utils/client-only";
import { Address } from "viem";
import { useEnsName } from "wagmi";
import useChainConfigOfSpace from "~/hooks/chain-config-of-space";
import { shortenAddress } from "~/utils/address";

export function ShortAddressLink({ address }: { address: string | undefined }) {
  const {
    blockExplorers: {
      default: { url },
    },
  } = useChainConfigOfSpace();

  if (!address) {
    return <span>Anon</span>;
  }

  return (
    <a href={`${url}/address/${address}`} className="break-all hover:underline">
      {shortenAddress(address)}
    </a>
  );
}

export function ENSResolvedLink({ address }: { address: string | undefined }) {
  const {
    blockExplorers: {
      default: { url },
    },
  } = useChainConfigOfSpace();
  const { data: ens } = useEnsName({
    address: address as Address | undefined,
  });

  if (!address || !ens) {
    return <ShortAddressLink address={address} />;
  }

  return (
    <a href={`${url}/address/${address}`} className="break-all hover:underline">
      {ens}
    </a>
  );
}

export default function AddressLink({
  address,
}: {
  address: string | undefined;
}) {
  return (
    <ClientOnly fallback={<ShortAddressLink address={address} />}>
      {() => <ENSResolvedLink address={address} />}
    </ClientOnly>
  );
}
