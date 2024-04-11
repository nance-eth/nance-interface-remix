import {
  Action,
  CustomTransaction,
  Payout,
  Reserve,
  Transfer,
} from "@nance/nance-sdk";
import {
  extractFunctionName,
  parseFunctionAbiWithNamedArgs,
} from "./contractFunction";
import { formatEther } from "ethers";
import { formatNumber } from "./number";

/**
 * 0xCONTRACT.functionName{ x ETH }(a: 1, b: 2)
 */
export function labelOfCustomTransaction(customTransaction: CustomTransaction) {
  const functionName = extractFunctionName(customTransaction.functionName);
  const value =
    BigInt(customTransaction.value) > 0
      ? `{ ${formatEther(customTransaction.value)} ETH }`
      : "";
  const args = parseFunctionAbiWithNamedArgs(
    customTransaction.functionName,
    customTransaction.args,
  )
    .map((pair: string[]) => `${pair[0]}: ${pair[1]}`)
    .join(", ");

  return `${customTransaction.contract}.${functionName}${value}(${args})`;
}

/**
 * Pay xx USD for x cycles
 */
export function labelOfPayout(payout: Payout) {
  return `Pay ${formatNumber(payout.amountUSD)} USD for ${payout.count} cycles`;
}

/**
 * Transfer xx 0xCONTRACT to xx
 */
export function labelOfTransfer(transfer: Transfer) {
  return `Transfer ${formatNumber(transfer.amount)} ${transfer.contract} to ${transfer.to}`;
}

/**
 * Reserve 10% to xx
 * Reserve 5% to juicebox@477
 */
export function labelOfReserve(reserve: Reserve) {
  return reserve.splits
    .sort(
      (a, b) => parseInt(b.percent as string) - parseInt(a.percent as string),
    )
    .map((split) => {
      const percent = split.percent as string;
      const label = `Reserve ${(parseInt(percent) / 10000000).toFixed(2)}% to`;
      if (split.projectId === "0") {
        return label + ` ${split.beneficiary}`;
      } else {
        return label + ` juicebox@${split.projectId}`;
      }
    })
    .join("\n");
}

export function actionToMarkdown(action: Action) {
  if (action.type === "Custom Transaction") {
    return labelOfCustomTransaction(action.payload as CustomTransaction);
  } else if (action.type === "Payout") {
    return labelOfPayout(action.payload as Payout);
  } else if (action.type === "Transfer") {
    return labelOfTransfer(action.payload as Transfer);
  } else if (action.type === "Reserve") {
    return labelOfReserve(action.payload as Reserve);
  }
}
