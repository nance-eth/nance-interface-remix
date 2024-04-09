import { FunctionFragment, Interface } from "ethers";
import { useEffect, useState } from "react";
import { trim } from "viem";
import { usePublicClient } from "wagmi";
import useChainConfigOfSpace from "./chain-config-of-space";
import { skipToken, useQuery } from "@tanstack/react-query";

interface EtherscanAPIResponse {
  status: "1" | "0";
  message: "OK" | "NOTOK";
  result: any;
}

// supported proxy pattern: EIP-1967 Proxy Storage Slots, EIP-897 DelegateProxy and Gnosis Safe Proxy
export function useEtherscanContractABI(
  address: string,
  shouldFetch: boolean = true,
) {
  const [implementationAddress, setImplementationAddress] = useState<string>();
  const client = usePublicClient();
  const {
    blockExplorers: {
      default: { apiUrl },
    },
  } = useChainConfigOfSpace();
  const url = `${apiUrl}?module=contract&action=getabi&address=${
    implementationAddress || address
  }&apikey=YW8ENRZF1TWSXTDKJE4HMI6TSH1UMCI89C`;
  const {
    data: abi,
    isLoading,
    error,
  } = useQuery({
    queryKey: [url, shouldFetch],
    queryFn: shouldFetch
      ? async () => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const json = await response.json();
          const ret = json as EtherscanAPIResponse;
          if (ret.status != "1") {
            throw new Error(`Etherscan API Error: ${j.result}`);
          }
          return ret.result;
        }
      : skipToken,
  });

  useEffect(() => {
    let cancelled = false;

    const func = async () => {
      if (abi && client && implementationAddress === undefined) {
        const ethersInterface = new Interface(abi);
        const functions: FunctionFragment[] = [];
        ethersInterface.forEachFunction((f) => functions.push(f));
        if (functions.length === 0) {
          console.debug(
            "EtherscanHooks.proxy.slotType",
            address,
            ethersInterface,
          );

          // EIP-1967 Proxy Storage Slots
          // https://eips.ethereum.org/EIPS/eip-1967
          // test address: 0xcaD88677CA87a7815728C72D74B4ff4982d54Fc1
          client
            .getStorageAt({
              address: address as `0x${string}`,
              slot: "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
            })
            .then((slot: any) => {
              const trimmed = trim(slot);
              console.debug("EtherscanHooks.proxy.slot", trimmed);
              if (cancelled) {
                return;
              }

              if (trimmed === "0x00") {
                // this maybe a proxy contract without any explicit function
                // e.g. Gnosis Safe Proxy
                console.debug("EtherscanHooks.proxy.safe");
                client
                  .readContract({
                    address: address as `0x${string}`,
                    abi: [
                      {
                        name: "masterCopy",
                        type: "function",
                        stateMutability: "view",
                        inputs: [],
                        outputs: [{ type: "address" }],
                      },
                    ],
                    functionName: "masterCopy",
                  })
                  .then((masterCopy) => {
                    if (!cancelled) {
                      setImplementationAddress(masterCopy);
                    }
                  })
                  .catch((e) => {
                    console.warn("EtherscanHooks.proxy.safe", e);
                    setImplementationAddress("");
                  });
              } else {
                setImplementationAddress(trimmed as `0x${string}`);
              }
            });
        } else if (ethersInterface.getFunction("implementation()")) {
          // EIP-897 DelegateProxy
          // https://eips.ethereum.org/EIPS/eip-897
          // test address: 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84
          console.debug(
            "EtherscanHooks.proxy.eip897",
            address,
            ethersInterface,
          );
          client
            .readContract({
              address: address as `0x${string}`,
              abi: [
                {
                  name: "implementation",
                  type: "function",
                  stateMutability: "view",
                  inputs: [],
                  outputs: [{ type: "address" }],
                },
              ],
              functionName: "implementation",
            })
            .then((implementation) => {
              if (!cancelled) {
                setImplementationAddress(implementation);
              }
            })
            .catch((e) => {
              console.warn("EtherscanHooks.proxy.eip897", e);
              setImplementationAddress("");
            });
        }
      }
    };
    func();

    return () => {
      cancelled = true;
    };
  }, [abi, client, implementationAddress, address]);

  return {
    data: abi,
    isLoading,
    error:
      (error?.message as string) ||
      (implementationAddress === "" ? "unsupported proxy pattern" : undefined),
    isProxy: address !== implementationAddress,
  };
}
