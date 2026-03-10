import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { RotateCcw, ZoomIn, ZoomOut, Maximize2, Download } from "lucide-react";

function ImagePlane({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, imageUrl);

  const aspect = texture.image
    ? texture.image.width / texture.image.height
    : 16 / 9;

  const width = 4;
  const height = width / aspect;

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

function LoadingPlane() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hsl(195, 100%, 50%)" wireframe />
    </mesh>
  );
}

interface Interactive3DViewerProps {
  imageUrl: string;
  title?: string;
}

export function Interactive3DViewer({ imageUrl, title }: Interactive3DViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(5);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleZoomIn = () => {
    setZoomLevel(z => Math.max(2, z - 1));
  };

  const handleZoomOut = () => {
    setZoomLevel(z => Math.min(15, z + 1));
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `megakumul-diagram-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[hsl(150,80%,50%)] animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground truncate max-w-[200px]">
            {title || "3D Interactive Diagram"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleZoomIn} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={handleZoomOut} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button onClick={handleDownload} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Download">
            <Download className="h-4 w-4" />
          </button>
          <button onClick={toggleFullscreen} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Toggle fullscreen">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="h-[400px] w-full bg-gradient-to-b from-[hsl(230,15%,8%)] to-[hsl(230,15%,5%)]">
        <Canvas key={zoomLevel}>
          <PerspectiveCamera makeDefault position={[0, 0, zoomLevel]} />
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={15}
            autoRotate={false}
          />
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, -5, -5]} intensity={0.3} />
          <Suspense fallback={<LoadingPlane />}>
            <ImagePlane imageUrl={imageUrl} />
          </Suspense>
          <gridHelper args={[10, 10, "hsl(230, 15%, 20%)", "hsl(230, 15%, 12%)"]} position={[0, -2, 0]} />
        </Canvas>
      </div>

      {/* Controls hint */}
      <div className="flex items-center justify-center gap-6 px-4 py-2 border-t border-border bg-muted/30">
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <RotateCcw className="h-3 w-3" /> Drag to rotate
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <ZoomIn className="h-3 w-3" /> Scroll to zoom
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <ZoomOut className="h-3 w-3" /> Right-click to pan
        </span>
      </div>
    </motion.div>
  );
}
