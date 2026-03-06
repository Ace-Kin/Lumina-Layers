import apiClient from "./client";
import type { ClearCacheResponse } from "./types";

/** 调用后端清除系统缓存，返回清理统计信息 */
export async function clearCache(): Promise<ClearCacheResponse> {
  const response = await apiClient.post<ClearCacheResponse>(
    "/system/clear-cache"
  );
  return response.data;
}
