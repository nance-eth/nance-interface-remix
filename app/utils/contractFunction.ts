import { CustomTransactionArg } from "@nance/nance-sdk";
import { Interface } from "ethers";

// function abc(uint256 _param) => abc
export function extractFunctionName(str: string) {
  return str.split("(")[0].split(" ").slice(-1)[0];
}

export function parseFunctionAbiWithNamedArgs(
  functionAbi: string,
  args: CustomTransactionArg[],
) {
  if (!args) return [];

  let abi = functionAbi;
  // compatiable with old minimal format functionName
  if (!functionAbi.startsWith("function")) {
    abi = `function ${functionAbi}`;
  }

  const ethersInterface = new Interface([abi]);
  const paramNames = ethersInterface.fragments[0].inputs.map(
    (p) => p.name || "_",
  );
  const dict: string[][] = [];
  Object.values(args).forEach((val, index) => {
    if (val.name && val.value && val.type) {
      // it's new struct
      const argStruct = val;
      if (val.type === "uint256") {
        if (
          (val.value as unknown as { hex: string; type: "BigNumber" }).type ===
          "BigNumber"
        ) {
          dict.push([
            argStruct.name || "_",
            BigInt(
              (val.value as unknown as { hex: string; type: "BigNumber" }).hex,
            ).toString(),
          ]);
        } else {
          dict.push([
            argStruct.name || "_",
            BigInt(argStruct.value).toString(),
          ]);
        }
      } else {
        dict.push([argStruct.name || "_", argStruct.value]);
      }
    } else {
      dict.push([paramNames[index] || "_", val.value]);
    }
  });

  return dict;
}
