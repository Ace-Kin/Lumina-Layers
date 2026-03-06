import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import ModelViewer from "./ModelViewer";
import InteractiveModelViewer from "./InteractiveModelViewer";
import BedPlatform from "./BedPlatform";
import { useConverterStore } from "../stores/converterStore";

interface Scene3DProps {
  modelUrl?: string;
}

function Scene3D({ modelUrl }: Scene3DProps) {
  const previewGlbUrl = useConverterStore((s) => s.previewGlbUrl);
  const colorRemapMap = useConverterStore((s) => s.colorRemapMap);
  const colorHeightMap = useConverterStore((s) => s.color_height_map);
  const selectedColor = useConverterStore((s) => s.selectedColor);
  const baseHeight = useConverterStore((s) => s.spacer_thick);
  const enableRelief = useConverterStore((s) => s.enable_relief);

  return (
    <Canvas
      camera={{ position: [0, 200, 400], fov: 45 }}
      onCreated={({ gl }) => {
        gl.setClearColor("#1e1e26");
        const canvas = gl.domElement;
        canvas.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
        });
        canvas.addEventListener("webglcontextrestored", () => {
          gl.setSize(canvas.clientWidth, canvas.clientHeight);
        });
      }}
    >
      {/* 天空/地面半球光模拟自然环境光 */}
      <hemisphereLight args={["#ddeeff", "#303030", 1.0]} />
      {/* 主光源：模拟阳光，从右上前方照射 */}
      <directionalLight position={[300, 500, 300]} intensity={1.2} color="#fff5e6" />
      {/* 补光：从左后方填充阴影区域 */}
      <directionalLight position={[-200, 300, -200]} intensity={0.4} color="#e6f0ff" />
      {/* 底部微弱反射光 */}
      <directionalLight position={[0, -100, 0]} intensity={0.15} color="#ffffff" />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.1}
        minDistance={10}
        maxDistance={2000}
      />
      <BedPlatform />
      {modelUrl ? (
        <Suspense fallback={null}>
          <ModelViewer url={modelUrl} />
        </Suspense>
      ) : previewGlbUrl ? (
        <Suspense fallback={null}>
          <InteractiveModelViewer
            url={previewGlbUrl}
            colorRemapMap={colorRemapMap}
            colorHeightMap={colorHeightMap}
            selectedColor={selectedColor}
            baseHeight={baseHeight}
            enableRelief={enableRelief}
          />
        </Suspense>
      ) : null}
    </Canvas>
  );
}

export default Scene3D;
