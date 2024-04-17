import { useCallback } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import {
  signatureTypes,
  signatureDomain,
  SignNewProposal,
  SignatureTypes,
} from "@nance/nance-sdk";

export default function SignProposal(type?: SignatureTypes) {
  const { status } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const trigger = useCallback(
    async (args: SignNewProposal) => {
      if (status === "connected") {
        return await signTypedDataAsync({
          types: signatureTypes,
          domain: signatureDomain,
          primaryType: type || "Proposal",
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
    [status, type, signTypedDataAsync]
  );

  return { trigger };
}
