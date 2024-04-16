import { useCallback } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import {
  signatureTypes,
  signatureDomain,
  SignNewProposal,
} from "@nance/nance-sdk";


export default function SignProposal() {
  const { status } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const trigger = useCallback(
    async (args: SignNewProposal) => {
      if (status === "connected") {
        return await signTypedDataAsync({
          types: signatureTypes,
          domain: signatureDomain,
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
