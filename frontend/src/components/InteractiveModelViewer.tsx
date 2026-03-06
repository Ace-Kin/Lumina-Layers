import { useMemo, useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { computeFitDistance } from "./ModelViewer";

export interface InteractiveModelViewerProps {
  url: string;
  colorRemapMap: Record<string, string>;
  colorHeightMap: Record<string, number>;
  selectedColor: string | null;
  baseHeight: number;
  enableRelief: boolean;
}

function InteractiveModelViewer({
  url,
  colorRemapMap,
  colorHeightMap,
  selectedColor,
  baseHeight,
  enableRelief,
}: InteractiveModelViewerProps) {
  const { scene } = useGLTF(url);
  const { camera, controls } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  // Clone scene once per URL load, apply rotation/centering (reuse ModelViewer logic),
  // and clone each color mesh's material to avoid shared-material mutations.
  const preparedScene = useMemo(() => {
    const clone = scene.clone(true);

    // Remove any baked-in bed mesh
    const toRemove: THREE.Object3D[] = [];
    clone.traverse((child) => {
      if (child.name.toLowerCase() === "bed") {
        toRemove.push(child);
      }
    });
    toRemove.forEach((obj) => obj.removeFromParent());

    // Trimesh exports Z-up, Three.js is Y-up → rotate -90° around X
    clone.rotation.x = -Math.PI / 2;
    clone.updateMatrixWorld(true);

    // Compute bounding box after rotation
    const box = new THREE.Box3().setFromObject(clone);

    // Center on XZ plane, sit on Y=0
    const center = new THREE.Vector3();
    box.getCenter(center);
    clone.position.set(-center.x, -box.min.y, -center.z);

    // Clone materials on color_ meshes so mutations don't affect the GLTF cache
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name.startsWith("color_")) {
        if (child.material) {
          child.material = (child.material as THREE.Material).clone();
        }
      }
    });

    return clone;
  }, [scene]);

  // Auto-fit camera to model after load
  useEffect(() => {
    const wrapper = new THREE.Group();
    wrapper.add(preparedScene.clone(true));
    wrapper.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(wrapper);
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);

    const perspCam = camera as THREE.PerspectiveCamera;
    const dist = computeFitDistance(sphere.radius, perspCam.fov);

    camera.position.set(dist * 0.3, dist * 0.5, dist * 0.8);
    camera.lookAt(sphere.center);
    camera.updateProjectionMatrix();

    if (controls) {
      const oc = controls as unknown as {
        target: THREE.Vector3;
        maxDistance: number;
        minDistance: number;
        update: () => void;
      };
      oc.target.copy(sphere.center);
      oc.maxDistance = dist * 5;
      oc.minDistance = dist * 0.1;
      oc.update();
    }

    wrapper.clear();
  }, [preparedScene, camera, controls]);

  // Imperative Three.js mutations: color remap, highlight, and relief scaling.
  // Runs on every prop change without triggering React re-renders of the Canvas.
  useEffect(() => {
    if (!groupRef.current) return;

    groupRef.current.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      if (!child.name.startsWith("color_")) return;

      const origHex = child.name.slice(6); // "color_ff0000" → "ff0000"
      const mat = child.material as THREE.MeshStandardMaterial;

      // Color replacement
      const remappedHex = colorRemapMap[origHex] || origHex;
      mat.color.set(`#${remappedHex}`);

      // Highlight selected color mesh
      const isSelected = selectedColor === origHex;
      mat.emissive.set(isSelected ? 0x333333 : 0x000000);
      mat.opacity = selectedColor && !isSelected ? 0.4 : 1.0;
      mat.transparent = selectedColor !== null && !isSelected;

      // Height scaling (relief mode only)
      if (enableRelief && baseHeight > 0) {
        const heightMm = colorHeightMap[origHex] ?? baseHeight;
        child.scale.z = heightMm / baseHeight;
      } else {
        child.scale.z = 1.0;
      }
    });
  }, [colorRemapMap, colorHeightMap, selectedColor, enableRelief, baseHeight]);

  return (
    <group ref={groupRef}>
      <primitive object={preparedScene} />
    </group>
  );
}

export default InteractiveModelViewer;
