import {
  Action,
  CustomTransaction,
  JBSplitStruct,
  Payout,
  Reserve,
  SpaceInfo,
  Transfer,
} from "@nance/nance-sdk";
import { useOutletContext } from "@remix-run/react";
import { format } from "date-fns";
import { formatEther } from "ethers";
import AddressLink from "~/components/address-link";
import {
  extractFunctionName,
  parseFunctionAbiWithNamedArgs,
} from "~/utils/contractFunction";
import { scheduleOfCycle } from "~/utils/governanceCycle";
import ProjectLink from "./project-link";
import TokenSymbol from "./token-symbol";
import { formatNumber } from "~/utils/number";
import { DEPLOY_CONTRACT_FAKE_ADDRESS } from "~/utils/address";
import { useSpaceConfig } from "~/data/nance";
import { ClientOnly } from "remix-utils/client-only";

export default function ActionLabel({
  action,
  proposalCycle,
}: {
  action: Action;
  proposalCycle?: number | undefined;
}) {
  const comment = "// Unrecognized action, pls check";

  if (action.type === "Custom Transaction") {
    return (
      <CustomTransactionActionLabel
        customTransaction={action.payload as CustomTransaction}
      />
    );
  } else if (action.type === "Payout") {
    return (
      <ClientOnly fallback={<div>Payout action loading...</div>}>
        {() => (
          <PayoutActionLabel
            payout={action.payload as Payout}
            proposalCycle={proposalCycle}
          />
        )}
      </ClientOnly>
    );
  } else if (action.type === "Transfer") {
    return <TransferActionLabel transfer={action.payload as Transfer} />;
  } else if (action.type === "Reserve") {
    return <ReserveActionLabel reserve={action.payload as Reserve} />;
  }

  return (
    <div>
      <p className="text-gray-400">{comment}</p>
      <p>{JSON.stringify(action)}</p>
    </div>
  );
}

function ReserveEntryLabel({ split }: { split: JBSplitStruct }) {
  const percent = split.percent as string;
  const label = `Reserve ${(parseInt(percent) / 10000000).toFixed(2)}% to`;

  if (split.projectId === "0") {
    return (
      <p className="flex gap-x-1">
        <span>{label}</span>
        <AddressLink address={split.beneficiary} />
      </p>
    );
  } else {
    return (
      <p className="flex gap-x-1">
        <span>{label}</span>
        <a
          href={`https://juicebox.money/v2/p/${split.projectId}`}
          className="hover:underline"
        >
          {`juicebox@${split.projectId}`}
        </a>
      </p>
    );
  }
}

function ReserveActionLabel({ reserve }: { reserve: Reserve }) {
  return (
    <div>
      {reserve.splits
        .sort(
          (a, b) =>
            parseInt(b.percent as string) - parseInt(a.percent as string),
        )
        .map((split) => (
          <ReserveEntryLabel
            key={split.beneficiary + split.projectId}
            split={split}
          />
        ))}
    </div>
  );
}

function TransferActionLabel({ transfer }: { transfer: Transfer }) {
  const contract = transfer.contract;

  return (
    <div className="flex space-x-1">
      <span>Transfer</span>
      <span>{formatNumber(transfer.amount)}</span>
      <TokenSymbol address={contract} />
      <span>to</span>
      <AddressLink address={transfer.to} />
    </div>
  );
}

function PayoutActionLabel({
  payout,
  proposalCycle,
}: {
  payout: Payout;
  proposalCycle: number | undefined;
}) {
  const { spaceInfo } = useOutletContext<{
    spaceInfo: SpaceInfo;
  }>();
  const { data: spaceConfig } = useSpaceConfig(spaceInfo.name);
  const cycleStageLengths = spaceConfig?.cycleStageLengths;

  const address = payout.address;
  const project = payout.project;
  const label = `${formatNumber(payout.amountUSD)} USD for ${payout.count} cycles`;

  let explanationComment =
    payout.count > 1
      ? `${formatNumber(payout.amountUSD * payout.count)} USD in total `
      : "";
  if (cycleStageLengths) {
    const cycleDeltaWithProposal =
      spaceInfo.currentCycle - (proposalCycle || 0);
    const firstSchedule = scheduleOfCycle(
      cycleStageLengths,
      1 - cycleDeltaWithProposal,
      spaceInfo.currentEvent,
    );
    const lastSchedule = scheduleOfCycle(
      cycleStageLengths,
      payout.count - cycleDeltaWithProposal,
      spaceInfo.currentEvent,
    );
    explanationComment += `from ${format(firstSchedule.start, "LLL d, yyyy")} to ${format(lastSchedule.end, "LLL d, yyyy")}`;
  }
  if (explanationComment) explanationComment = ` (${explanationComment})`;

  if (project !== undefined && project > 0) {
    return (
      <div>
        <p className="flex gap-x-1">
          <span>Pay</span>
          <ProjectLink projectId={project} />
          <span>{`${label}${explanationComment}`}</span>
        </p>
      </div>
    );
  } else {
    return (
      <div>
        <p className="flex gap-x-1">
          <span>Pay</span>
          <AddressLink address={address} />
          <span>{`${label}${explanationComment}`}</span>
        </p>
      </div>
    );
  }
}

function CustomTransactionActionLabel({
  customTransaction,
}: {
  customTransaction: CustomTransaction;
}) {
  const contract = customTransaction.contract;

  if (contract === DEPLOY_CONTRACT_FAKE_ADDRESS) {
    return (
      <div>
        <p className="line-clamp-3">{`Deploy contract with input: ${customTransaction.args[0].value}`}</p>
      </div>
    );
  }

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
  const label = `.${functionName}${value}(${args})`;

  return (
    <div>
      <AddressLink address={contract} />
      <p className="ml-4 line-clamp-3">{label}</p>
    </div>
  );
}
