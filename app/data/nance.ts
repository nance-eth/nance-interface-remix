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

export type SpaceConfig = {
  space: string;
  displayName: string | null;
  spaceOwners: string[];
  cid: string;
  config: NanceConfig;
  calendar: DateEvent[];
  cycleTriggerTime: string;
  cycleStageLengths: number[];
  dialogHandlerMessageIds: DialogHandlerMessageIds;
  lastUpdated: Date;
  cycleDayLastUpdated: Date;
  currentGovernanceCycle: number;
};

export interface NanceConfig {
  name: string;
  juicebox: {
    network: "mainnet" | "goerli";
    projectId: string;
    gnosisSafeAddress: string;
    governorAddress: string;
  };
  discord: {
    API_KEY: string;
    guildId: string;
    roles: {
      governance: string;
    };
    channelIds: {
      proposals: string;
      bookkeeping: string;
      transactions: string;
    };
    poll: {
      minYesVotes: number;
      yesNoRatio: number;
      verifyRole: string;
    };
    reminder: {
      type: string;
      channelIds: string[];
      imagesCID: string;
      imageNames: string[];
    };
  };
  proposalIdPrefix: string;
  dolt: DoltConfig;
  snapshot: {
    space: string;
    choices: string[];
    minTokenPassingAmount: number;
    passingRatio: number;
  };
  submitAsApproved?: boolean;
}

export type DoltConfig = {
  enabled: boolean;
  owner: string;
  repo: string;
};

export interface DateEvent {
  title: string;
  start: Date;
  end: Date;
}

export type DialogHandlerMessageIds = {
  temperatureCheckRollup: string;
  voteRollup: string;
  voteQuorumAlert: string;
  voteEndAlert: string;
  voteResultsRollup: string;
  temperatureCheckStartAlert: string;
  temperatureCheckEndAlert: string;
};

export type CustomTransactionArg = {
  id: string;
  value: string;
  type: string;
  name: string;
};

export type CustomTransaction = {
  contract: string;
  chainId?: number;
  value: string;
  // function approve(address guy, uint256 wad) returns (bool)
  // can pass as ABI
  // can have unnamed parameters
  functionName: string;
  args: CustomTransactionArg[];
  tenderlyId: string;
  tenderlyStatus: string;
};

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

export async function getSpaceConfig(spaceName: string) {
  return genericFetchAndThrowIfError<SpaceConfig>(`/ish/config/${spaceName}`);
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
