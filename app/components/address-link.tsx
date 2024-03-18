import { ClientOnly } from "remix-utils/client-only";
import { Address } from "viem";
import { useEnsName } from "wagmi";
import { shortenAddress } from "~/utils/address";

export function ShortAddressLink({ address }: { address: string | undefined }) {
  if (!address) {
    return <span>Anon</span>;
  }

  return (
    <a
      href={`https://etherscan.io/address/${address}`}
      className="break-all hover:underline"
    >
      {shortenAddress(address)}
    </a>
  );
}

export function ENSResolvedLink({ address }: { address: string | undefined }) {
  const { data: ens } = useEnsName({
    address: address as Address | undefined,
  });

  if (!address || !ens) {
    return <ShortAddressLink address={address} />;
  }

  return (
    <a
      href={`https://etherscan.io/address/${address}`}
      className="break-all hover:underline"
    >
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
