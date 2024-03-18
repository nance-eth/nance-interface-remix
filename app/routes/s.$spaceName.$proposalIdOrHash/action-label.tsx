import {
  Action,
  CustomTransaction,
  JBSplitStruct,
  Payout,
  Reserve,
  SpaceInfo,
  Transfer,
} from "@nance/nance-sdk";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { format } from "date-fns";
import { formatEther } from "ethers";
import AddressLink from "~/components/address-link";
import {
  extractFunctionName,
  parseFunctionAbiWithNamedArgs,
} from "~/utils/contractFunction";
import { scheduleOfCycle } from "~/utils/governanceCycle";
import { loader } from "./route";

export default function ActionLabel({ action }: { action: Action }) {
  const comment = "// Unrecognized action, pls check";

  if (action.type === "Custom Transaction") {
    return (
      <CustomTransactionActionLabel
        customTransaction={action.payload as CustomTransaction}
      />
    );
  } else if (action.type === "Payout") {
    return <PayoutActionLabel payout={action.payload as Payout} />;
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

  if (split.projectId === 0) {
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
  const functionName = "transfer";
  const label1 = `.${functionName}(to: `;
  const label2 = `, amount: ${transfer.amount})`;

  return (
    <p>
      <a
        href={`https://etherscan.io/address/${contract}`}
        className="hover:underline"
      >
        {contract || "<native>"}
      </a>
      <p className="ml-4">
        {label1}
        <a
          href={`https://etherscan.io/address/${transfer.to}`}
          className="hover:underline"
        >
          {transfer.to}
        </a>
        {label2}
      </p>
    </p>
  );
}

function PayoutActionLabel({ payout }: { payout: Payout }) {
  const { spaceInfo } = useOutletContext<{
    spaceInfo: SpaceInfo;
  }>();
  const { proposal, cycleStageLengths } = useLoaderData<typeof loader>();

  const address = payout.address;
  const project = payout.project;
  const label = `${payout.amountUSD} USD for ${payout.count} cycles`;

  let explanationComment = `// Pay ${payout.amountUSD * payout.count} USD in total`;
  if (cycleStageLengths) {
    const cycleDeltaWithProposal =
      spaceInfo.currentCycle - (proposal.governanceCycle || 0);
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
    explanationComment += ` from ${format(firstSchedule.start, "LLL d, yyyy")} to ${format(lastSchedule.end, "LLL d, yyyy")}`;
  }

  if (!project) {
    return (
      <div>
        <p className="text-gray-500">{explanationComment}</p>
        <p className="flex gap-x-1">
          <span>Pay</span>
          <AddressLink address={address} />
          <span>{label}</span>
        </p>
      </div>
    );
  } else {
    return (
      <div>
        <p className="text-gray-500">{explanationComment}</p>
        <p className="flex gap-x-1">
          <span>Pay</span>
          <a
            href={`https://juicebox.money/v2/p/${project}`}
            className="hover:underline"
          >
            {`juicebox@${project}`}
          </a>
          <span>{label}</span>
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
      <a
        href={`https://etherscan.io/address/${contract}`}
        className="hover:underline"
      >
        {contract}
      </a>
      <p className="ml-4">{label}</p>
    </div>
  );
}
