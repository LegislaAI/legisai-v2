"use client";

import { useCallback } from "react";

import { useApiContext } from "@/context/ApiContext";

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export function useAdminApi() {
  const { GetAPI, PostAPI, PatchAPI, DeleteAPI } = useApiContext();

  const list = useCallback(
    async <T,>(path: string, query?: Record<string, string | undefined>) => {
      const qs = new URLSearchParams();
      Object.entries(query ?? {}).forEach(([k, v]) => {
        if (v !== undefined && v !== "") qs.set(k, v);
      });
      const url = qs.toString() ? `${path}?${qs.toString()}` : path;
      const res = await GetAPI(url, true);
      if (res.status !== 200) throw new Error(res.body?.message ?? "Falha na requisição.");
      return res.body as T;
    },
    [GetAPI],
  );

  const post = useCallback(
    async <T,>(path: string, body: unknown) => {
      const res = await PostAPI(path, body ?? {}, true);
      if (res.status !== 200 && res.status !== 201) {
        throw new Error(res.body?.message ?? "Falha na requisição.");
      }
      return res.body as T;
    },
    [PostAPI],
  );

  const patch = useCallback(
    async <T,>(path: string, body: unknown) => {
      const res = await PatchAPI(path, body, true);
      if (res.status !== 200 && res.status !== 204) {
        throw new Error(res.body?.message ?? "Falha na requisição.");
      }
      return res.body as T;
    },
    [PatchAPI],
  );

  const del = useCallback(
    async <T,>(path: string) => {
      const res = await DeleteAPI(path, true);
      if (res.status !== 200 && res.status !== 204) {
        throw new Error(res.body?.message ?? "Falha na requisição.");
      }
      return res.body as T;
    },
    [DeleteAPI],
  );

  return { list, post, patch, del };
}
