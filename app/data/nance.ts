// TODO: absorb this file into nance-sdk package
import {
  APIResponse,
  Proposal,
  ProposalsPacket,
  SpaceInfo,
} from "@nance/nance-sdk";

export interface BaseQueryArgs {
  space: string;
}

export interface ProposalsQueryArgs extends BaseQueryArgs {
  cycle?: string | null | undefined;
  keyword?: string | null | undefined;
  limit?: number | null | undefined;
  page?: number | null | undefined;
}

export interface ProposalQueryArgs extends BaseQueryArgs {
  hash: string;
}

const DEFAULT_API_ENDPOINT = "https://api.nance.app";

export async function genericFetchAndThrowIfError<T>(
  route: string,
  apiEndpoint: string = DEFAULT_API_ENDPOINT,
): Promise<T> {
  const res = await fetch(apiEndpoint + route);
  const json: APIResponse<T> = await res.json();
  // TODO: handle HTTP status code?
  if (!json?.success || json?.error) {
    throw new Error(
      `An error occurred while fetching the data: ${json?.error}`,
    );
  }
  return json.data;
}

export async function getAllSpaces() {
  return genericFetchAndThrowIfError<SpaceInfo[]>("/ish/all");
}

export async function getSpace(spaceName: string) {
  return genericFetchAndThrowIfError<SpaceInfo>(`/${spaceName}`);
}

export async function getProposals(args: ProposalsQueryArgs) {
  const urlParams = new URLSearchParams();
  if (args.cycle) {
    urlParams.set("cycle", args.cycle);
  }
  if (args.keyword) {
    urlParams.set("keyword", args.keyword);
  }
  if (args.limit) {
    urlParams.set("limit", args.limit.toString());
  }
  if (args.page) {
    urlParams.set("page", args.page.toString());
  }

  return genericFetchAndThrowIfError<ProposalsPacket>(
    `/${args.space}/proposals?${urlParams.toString()}`,
  );
}

export function getProposal(args: ProposalQueryArgs) {
  return genericFetchAndThrowIfError<Proposal>(
    `/${args.space}/proposal/${args.hash}`,
  );
}
