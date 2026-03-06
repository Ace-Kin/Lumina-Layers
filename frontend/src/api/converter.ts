import apiClient from "./client";
import type {
  ConvertPreviewRequest,
  ConvertGenerateRequest,
  PreviewResponse,
  GenerateResponse,
  LutListResponse,
  BedSizeListResponse,
  HeightmapUploadResponse,
  LutColorsResponse,
} from "./types";

/** 上传图片 + 参数，获取 2D 预览（返回 JSON，含 session_id 和 preview_url） */
export async function convertPreview(
  image: File,
  params: ConvertPreviewRequest
): Promise<PreviewResponse> {
  const fd = new FormData();
  fd.append("image", image);
  for (const [key, value] of Object.entries(params)) {
    fd.append(key, String(value));
  }

  const response = await apiClient.post<PreviewResponse>("/convert/preview", fd, {
    timeout: 0,
  });
  return response.data;
}

/** 使用 session_id + 全部参数，生成 3MF 模型 */
export async function convertGenerate(
  sessionId: string,
  params: ConvertGenerateRequest
): Promise<GenerateResponse> {
  const response = await apiClient.post<GenerateResponse>(
    "/convert/generate",
    { session_id: sessionId, params },
    { timeout: 0 }
  );
  return response.data;
}

/** 获取可用 LUT 列表 */
export async function fetchLutList(): Promise<LutListResponse> {
  const response = await apiClient.get<LutListResponse>("/lut/list", {
    timeout: 5_000,
  });
  return response.data;
}

/** 根据 file_id 获取文件下载 URL */
export function getFileUrl(fileId: string): string {
  return `/api/files/${fileId}`;
}

/** 获取可用热床尺寸列表 */
export async function fetchBedSizes(): Promise<BedSizeListResponse> {
  const response = await apiClient.get<BedSizeListResponse>("/convert/bed-sizes");
  return response.data;
}

/** 获取空热床 3D 预览 GLB URL */
export async function fetchBedPreview(bedLabel: string): Promise<string> {
  const response = await apiClient.get<{ preview_3d_url: string }>(
    "/convert/bed-preview",
    { params: { bed_label: bedLabel } }
  );
  return response.data.preview_3d_url;
}

/** 上传高度图并获取基于高度图的 color_height_map */
export async function uploadHeightmap(
  heightmapFile: File,
  sessionId: string,
): Promise<HeightmapUploadResponse> {
  const fd = new FormData();
  fd.append("heightmap", heightmapFile);
  fd.append("session_id", sessionId);

  const response = await apiClient.post<HeightmapUploadResponse>(
    "/convert/upload-heightmap",
    fd,
    { timeout: 0 },
  );
  return response.data;
}

/** 获取 LUT 中所有可用颜色 */
export async function fetchLutColors(
  lutName: string,
): Promise<LutColorsResponse> {
  const response = await apiClient.get<LutColorsResponse>(
    `/lut/${encodeURIComponent(lutName)}/colors`,
    { timeout: 10_000 },
  );
  return response.data;
}
