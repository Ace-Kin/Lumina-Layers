"""
Lumina Studio - Backing Plate 单元测试 (Unit Tests)

验证 _build_color_voxel_mesh 在边界情况下的行为：
- 全 False mask 返回 None
- 单像素 mask 生成正确 mesh
- L 形 mask 生成正确形状

Requirements: 1.5
"""

import os
import sys

import numpy as np
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from core.converter import _build_color_voxel_mesh

BACKING_PLATE_RGBA = np.array([245, 245, 245, 255], dtype=np.uint8)


def _extract_pixel_coords_from_mesh(mesh, height: int) -> set[tuple[int, int]]:
    """Extract (row, col) pixel coordinates from voxel mesh.
    从体素 mesh 中提取 (row, col) 像素坐标。

    Args:
        mesh: trimesh.Trimesh with voxel boxes (8 verts per box).
            (包含体素盒的 trimesh.Trimesh)
        height (int): Image height for Y-axis inversion.
            (图像高度，用于 Y 轴翻转)

    Returns:
        set[tuple[int, int]]: Set of (row, col) pixel coordinates.
            (像素坐标集合)
    """
    verts = mesh.vertices
    n_voxels = len(verts) // 8
    coords: set[tuple[int, int]] = set()
    for i in range(n_voxels):
        box_verts = verts[i * 8:(i + 1) * 8]
        x_min = box_verts[:, 0].min()
        y_min = box_verts[:, 1].min()
        col = int(round(x_min))
        world_row = int(round(y_min))
        row = height - 1 - world_row
        coords.add((row, col))
    return coords


# ============================================================================
# Test: 全 False mask 返回 None
# ============================================================================

class TestAllFalseMask:
    """Verify _build_color_voxel_mesh returns None for all-False masks."""

    def test_all_false_3x3(self):
        """A 3x3 all-False mask should return None."""
        mask = np.zeros((3, 3), dtype=bool)
        result = _build_color_voxel_mesh(
            mask=mask, height=3, width=3,
            total_layers=1, shrink=0.0, rgba=BACKING_PLATE_RGBA,
        )
        assert result is None

    def test_all_false_1x1(self):
        """A 1x1 all-False mask should return None."""
        mask = np.array([[False]])
        result = _build_color_voxel_mesh(
            mask=mask, height=1, width=1,
            total_layers=1, shrink=0.0, rgba=BACKING_PLATE_RGBA,
        )
        assert result is None


# ============================================================================
# Test: 单像素 mask 生成正确 mesh
# ============================================================================

class TestSinglePixelMask:
    """Verify single-pixel mask produces a correct single-voxel mesh."""

    def test_single_pixel_1x1(self):
        """A 1x1 True mask should produce a mesh with 8 vertices (one voxel)."""
        mask = np.array([[True]])
        mesh = _build_color_voxel_mesh(
            mask=mask, height=1, width=1,
            total_layers=1, shrink=0.0, rgba=BACKING_PLATE_RGBA,
        )
        assert mesh is not None
        assert len(mesh.vertices) == 8
        assert len(mesh.faces) == 12

    def test_single_pixel_coordinates(self):
        """Single pixel at (0,0) in a 1x1 mask should map to col=0, row=0."""
        mask = np.array([[True]])
        mesh = _build_color_voxel_mesh(
            mask=mask, height=1, width=1,
            total_layers=1, shrink=0.0, rgba=BACKING_PLATE_RGBA,
        )
        coords = _extract_pixel_coords_from_mesh(mesh, height=1)
        assert coords == {(0, 0)}

    def test_single_pixel_in_larger_grid(self):
        """A single True pixel at row=1, col=2 in a 3x4 grid."""
        mask = np.zeros((3, 4), dtype=bool)
        mask[1, 2] = True
        mesh = _build_color_voxel_mesh(
            mask=mask, height=3, width=4,
            total_layers=1, shrink=0.0, rgba=BACKING_PLATE_RGBA,
        )
        assert mesh is not None
        assert len(mesh.vertices) == 8
        coords = _extract_pixel_coords_from_mesh(mesh, height=3)
        assert coords == {(1, 2)}

    def test_single_pixel_z_span(self):
        """Single voxel Z range should be [0, 1] for total_layers=1."""
        mask = np.array([[True]])
        mesh = _build_color_voxel_mesh(
            mask=mask, height=1, width=1,
            total_layers=1, shrink=0.0, rgba=BACKING_PLATE_RGBA,
        )
        z_coords = mesh.vertices[:, 2]
        assert z_coords.min() == pytest.approx(0.0)
        assert z_coords.max() == pytest.approx(1.0)

    def test_single_pixel_face_color(self):
        """All face colors should be RGBA(245, 245, 245, 255)."""
        mask = np.array([[True]])
        mesh = _build_color_voxel_mesh(
            mask=mask, height=1, width=1,
            total_layers=1, shrink=0.0, rgba=BACKING_PLATE_RGBA,
        )
        expected = np.array([245, 245, 245, 255], dtype=np.uint8)
        assert np.all(mesh.visual.face_colors == expected)


# ============================================================================
# Test: L 形 mask 生成正确形状
# ============================================================================

class TestLShapedMask:
    """Verify L-shaped mask produces correct voxel geometry."""

    def _make_l_mask(self) -> np.ndarray:
        """Create the L-shaped mask from the spec:
        True  False
        True  False
        True  True
        """
        mask = np.array([
            [True, False],
            [True, False],
            [True, True],
        ], dtype=bool)
        return mask

    def test_l_shape_not_none(self):
        """L-shaped mask should produce a non-None mesh."""
        mask = self._make_l_mask()
        mesh = _build_color_voxel_mesh(
            mask=mask, height=3, width=2,
            total_layers=1, shrink=0.0, rgba=BACKING_PLATE_RGBA,
        )
        assert mesh is not None

    def test_l_shape_voxel_count(self):
        """L-shaped mask has 4 True pixels, so mesh should have 4 voxels."""
        mask = self._make_l_mask()
        mesh = _build_color_voxel_mesh(
            mask=mask, height=3, width=2,
            total_layers=1, shrink=0.0, rgba=BACKING_PLATE_RGBA,
        )
        n_voxels = len(mesh.vertices) // 8
        assert n_voxels == 4

    def test_l_shape_pixel_coordinates(self):
        """Voxel positions should match the 4 True pixels in the L shape."""
        mask = self._make_l_mask()
        mesh = _build_color_voxel_mesh(
            mask=mask, height=3, width=2,
            total_layers=1, shrink=0.0, rgba=BACKING_PLATE_RGBA,
        )
        coords = _extract_pixel_coords_from_mesh(mesh, height=3)
        expected = {(0, 0), (1, 0), (2, 0), (2, 1)}
        assert coords == expected

    def test_l_shape_face_count(self):
        """4 voxels × 12 faces each = 48 faces total."""
        mask = self._make_l_mask()
        mesh = _build_color_voxel_mesh(
            mask=mask, height=3, width=2,
            total_layers=1, shrink=0.0, rgba=BACKING_PLATE_RGBA,
        )
        assert len(mesh.faces) == 48
