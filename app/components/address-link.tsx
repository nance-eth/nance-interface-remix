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
      className="inline-block w-20 truncate break-words hover:underline xl:hover:w-fit"
    >
      {address}
    </a>
  );
}
