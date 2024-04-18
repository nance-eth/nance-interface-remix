import {
  APIResponse,
  ProposalDeleteRequest,
  ProposalUpdateRequest,
  ProposalUploadPayload,
  ProposalUploadRequest,
} from "@nance/nance-sdk";

// const endpoint = "http://localhost:3003/";
const endpoint = "https://api.nance.app/";

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
