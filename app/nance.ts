import { APIResponse, SpaceInfo } from "@nance/nance-sdk";

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
