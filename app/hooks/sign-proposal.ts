import { useCallback } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import {
  signatureTypes,
  signatureDomain,
  SignNewProposal,
  SignatureTypes,
} from "@nance/nance-sdk";

type SignDeleteProposal = {
  uuid: string;
};

export default function SignProposal() {
  const { status } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const trigger = useCallback(
    async (
      args: SignNewProposal | SignDeleteProposal,
      type: SignatureTypes
    ) => {
      if (status === "connected") {

        let message;
        if (type === "DeleteProposal") {
          message = { uuid: args.uuid };
        } else if (type === "Proposal") {
          const { uuid, title, body, status } = args as SignNewProposal;
          message = { uuid, title, body, status };
        } else {
          throw new Error("Invalid type " + type);
        }

        return await signTypedDataAsync({
          types: signatureTypes,
          domain: signatureDomain,
          primaryType: type,
          message,
        })
      } else {
        throw new Error("wallet " + status);
      }
    },
    [status, signTypedDataAsync]
  );

  return { trigger };
}
