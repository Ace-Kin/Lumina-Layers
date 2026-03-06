"""Lumina Studio API — System Pydantic models.
Lumina Studio API — 系统管理 Pydantic 数据模型。

Cache cleanup response schemas and internal data structures.
缓存清理响应 Schema 及内部数据结构。
"""

from dataclasses import dataclass

from pydantic import BaseModel


class CacheCleanupDetails(BaseModel):
    """缓存清理详情。"""

    registry_cleaned: int
    sessions_cleaned: int
    output_files_cleaned: int


class ClearCacheResponse(BaseModel):
    """缓存清理响应。"""

    status: str
    message: str
    deleted_files: int
    freed_bytes: int
    details: CacheCleanupDetails


@dataclass
class ClearCacheResult:
    """perform_cache_cleanup 内部返回值。"""

    registry_cleaned: int
    sessions_cleaned: int
    output_files_cleaned: int
    total_freed_bytes: int
