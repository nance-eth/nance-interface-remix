import {
  APIResponse,
  ProposalDeleteRequest,
  ProposalUpdateRequest,
  ProposalUploadPayload,
  ProposalUploadRequest,
  getSpaceConfig,
} from "@nance/nance-sdk";
import { skipToken, useQuery } from "@tanstack/react-query";

// const endpoint = "http://localhost:3003/";
const endpoint = "https://api.nance.app/";

export function useSpaceConfig(spaceName: string, shouldFetch: boolean = true) {
  return useQuery({
    queryKey: [endpoint + "=> getSpaceConfig"],
    queryFn: shouldFetch ? async () => getSpaceConfig(spaceName) : skipToken,
  });
}

export async function newProposal(args: ProposalUploadRequest) {
  const res = await fetch(`${endpoint}${args.space}/proposals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const json: APIResponse<ProposalUploadPayload> = await res.json();
  if (json.success === false) {
    throw new Error(json?.error);
  }

  return json;
}

export async function updateProposal(args: ProposalUpdateRequest) {
  const res = await fetch(
    `${endpoint}${args.space}/proposal/${args.proposal.uuid}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    },
  );
  const json: APIResponse<ProposalUploadPayload> = await res.json();
  if (json.success === false) {
    throw new Error(json?.error);
  }

  return json;
}

export async function deleteProposal(
  space: string,
  args: ProposalDeleteRequest,
) {
  const res = await fetch(`${endpoint}${space}/proposal/${args.uuid}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const json: APIResponse<ProposalUploadPayload> = await res.json();
  if (json.success === false) {
    throw new Error(json?.error);
  }

  return json;
}
