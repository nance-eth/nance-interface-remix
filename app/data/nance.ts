import {
  APIResponse,
  ProposalDeleteRequest,
  ProposalUpdateRequest,
  ProposalUploadPayload,
  ProposalUploadRequest,
} from "@nance/nance-sdk";

const API = "https://api.nance.app/";

export async function newProposal(args: ProposalUploadRequest) {
  const endpoint = process.env.NODE_ENV === "production" ? API : "http://localhost:3003/";
  const res = await fetch(`${endpoint}${args.space}/proposals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const json: APIResponse<ProposalUploadPayload> = await res.json();
  if (json.success === false) {
    throw new Error(
      `An error occurred while uploading the data: ${json?.error}`,
    );
  }

  return json;
}

export async function updateProposal(
  args: ProposalUpdateRequest,
) {
  const endpoint = process.env.NODE_ENV === "production" ? API : "http://localhost:3003/";
  console.log(endpoint);
  const res = await fetch(`${endpoint}${args.space}/proposal/${args.proposal.uuid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const json: APIResponse<ProposalUploadPayload> = await res.json();
  if (json.success === false) {
    throw new Error(
      `An error occurred while uploading the data: ${json?.error}`,
    );
  }

  return json;
}

export async function deleteProposal(space: string, args: ProposalDeleteRequest) {
  const endpoint = process.env.NODE_ENV === "production" ? API : "http://localhost:3003/";
  const res = await fetch(`${endpoint}${space}/proposal/${args.uuid}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const json: APIResponse<ProposalUploadPayload> = await res.json();
  if (json.success === false) {
    throw new Error(
      `An error occurred while uploading the data: ${json?.error}`,
    );
  }

  return json;
}
