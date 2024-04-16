import { useCallback } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { ProposalStatus } from "@nance/nance-sdk";

// *** Add to SDK?? *** //
const types = {
  Proposal: [
    { type: "string", name: "uuid" },
    { type: "string", name: "title" },
    { type: "string", name: "body" },
    { type: "string", name: "status" },
  ],
};

const domain = {
  name: "Nance",
  version: "1",
}

type SignNewProposal = {
  uuid: string;
  title: string;
  body: string;
  status: ProposalStatus;
};
// === Add to SDK?? === //

export default function SignProposal() {
  const { status } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const trigger = useCallback(
    async (args: SignNewProposal) => {
      if (status === "connected") {
        return await signTypedDataAsync({
          types,
          domain,
          primaryType: "Proposal",
          message: {
            uuid: args.uuid,
            title: args.title,
            body: args.body,
            status: args.status,
          },
        })
      } else {
        throw new Error("wallet " + status);
      }
    },
    [status, signTypedDataAsync],
  );

  return { trigger };
}
