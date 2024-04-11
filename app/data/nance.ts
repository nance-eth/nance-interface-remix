import {
  APIResponse,
  ProposalUpdateRequest,
  ProposalUploadPayload,
  ProposalUploadRequest,
} from "@nance/nance-sdk";

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
    throw new Error(
      `An error occurred while uploading the data: ${json?.error}`,
    );
  }

  return json;
}

export async function updateProposal(
  args: ProposalUpdateRequest,
  proposalId: string,
) {
  const res = await fetch(`${endpoint}${args.space}/proposal/${proposalId}`, {
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

export async function deleteProposal(space: string, proposalId: string) {
  const res = await fetch(`${endpoint}${space}/proposal/${proposalId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json: APIResponse<ProposalUploadPayload> = await res.json();
  if (json.success === false) {
    throw new Error(
      `An error occurred while uploading the data: ${json?.error}`,
    );
  }

  return json;
}
