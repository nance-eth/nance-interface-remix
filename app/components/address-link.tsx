export default function AddressLink({
  address,
}: {
  address: string | undefined;
}) {
  if (!address) {
    return <span>Anon</span>;
  }

  return (
    <a
      href={`https://etherscan.io/address/${address}`}
      className="inline-block hover:underline"
    >
      {address}
    </a>
  );
}
