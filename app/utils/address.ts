export function shortenAddress(address: string | undefined) {
  if (address?.length !== 42) {
    return address;
  }

  return (
    address.substring(0, 6) + "..." + address.substring(address.length - 4)
  );
}

export const DEPLOY_CONTRACT_FAKE_ADDRESS =
  "0xDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDCDC";
