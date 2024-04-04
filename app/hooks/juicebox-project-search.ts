import { skipToken, useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";

export interface JuiceboxProjectAPIResponse {
  id: string;
  handle: string | null;
  project_id: number;
  pv: string;
  current_balance: string;
  trending_score: string;
  total_paid: string;
  payments_count: number;
  terminal: string | null;
  deployer: string;
  created_at: number;
  name: string;
  description: string;
  logo_uri: string;
  metadata_uri: string;
  tags: string | null;
  archived: string | null;
  _updated_at: number;
  _has_unresolved_metadata: string | null;
  _metadata_retries_left: string | null;
}

type Params = {
  text?: string;
  pv?: string;
  orderBy?: string;
  archived?: boolean;
  orderDirection?: string;
  pageSize?: number;
  projectId?: number;
};

/**
 * Search for projects on Juicebox with JBM Search API
 */
export default function useJBMSearch(
  params: Params,
  shouldFetch: boolean = true,
) {
  const [queryParams, setQueryParams] =
    useState<Record<string, string | boolean | number>>(params);

  const queryString = useCallback(() => {
    let query = "";
    for (const key in queryParams) {
      if (queryParams[key] !== undefined) {
        query += `&${key}=${queryParams[key]}`;
      }
    }
    return query;
  }, [queryParams]);

  const url = `https://juicebox.money/api/projects?${queryString()}`;
  const { data, error } = useQuery({
    queryKey: [url, shouldFetch],
    queryFn: shouldFetch
      ? async () => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const json = await response.json();
          return json as JuiceboxProjectAPIResponse[];
        }
      : skipToken,
  });

  const loading = !data && !error;

  return {
    projects: data,
    loading,
    error,
    setQueryParams,
  };
}
