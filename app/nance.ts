import { APIResponse, SpaceInfo } from "@nance/nance-sdk";

export async function getAllSpaces() {
  const res = await fetch("https://api.nance.app/ish/all");
  const json: APIResponse<SpaceInfo[]> = await res.json();
  if (!json?.success || json?.error) {
    throw new Error(
      `An error occurred while fetching the data: ${json?.error}`,
    );
  }
  return json.data;
}
