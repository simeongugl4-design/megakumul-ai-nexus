import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Html, Text } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { RotateCcw, ZoomIn, ZoomOut, Maximize2, Download, Tag } from "lucide-react";

function ImagePlane({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, imageUrl);

  const aspect = texture.image
    ? texture.image.width / texture.image.height
    : 16 / 9;

  const width = 5;
  const height = width / aspect;

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

function FloatingLabel({ text, position, color = "#00d4ff" }: { text: string; position: [number, number, number]; color?: string }) {
  return (
    <Html position={position} center distanceFactor={8}>
      <div className="pointer-events-none select-none whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-bold shadow-lg"
        style={{ background: `${color}22`, border: `1px solid ${color}55`, color, backdropFilter: 'blur(4px)' }}>
        {text}
      </div>
    </Html>
  );
}

function LoadingPlane() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="hsl(195, 100%, 50%)" wireframe />
      </mesh>
      <Html center>
        <div className="text-xs text-primary animate-pulse font-medium">Generating...</div>
      </Html>
    </group>
  );
}

function SceneEnvironment() {
  return (
    <>
      <ambientLight intensity={1.8} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-3, -3, 3]} intensity={0.4} />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#00d4ff" />
    </>
  );
}

interface Interactive3DViewerProps {
  imageUrl: string;
  title?: string;
  labels?: { text: string; position: [number, number, number]; color?: string }[];
}

export function Interactive3DViewer({ imageUrl, title, labels }: Interactive3DViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(5);
  const [showLabels, setShowLabels] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleZoomIn = () => setZoomLevel(z => Math.max(2, z - 0.8));
  const handleZoomOut = () => setZoomLevel(z => Math.min(15, z + 0.8));

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `megakumul-diagram-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Extract topic from title for auto-labels
  const autoLabels = labels || (title ? [
    { text: "📊 AI Generated", position: [0, 2.5, 0] as [number, number, number], color: "#00d4ff" },
    { text: title.slice(0, 40) + (title.length > 40 ? "..." : ""), position: [0, -2.5, 0] as [number, number, number], color: "#a855f7" },
  ] : []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-2xl border border-border bg-card overflow-hidden group"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-gradient-to-r from-muted/80 to-muted/40">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="h-2.5 w-2.5 rounded-full bg-[hsl(150,80%,50%)] animate-pulse" />
            <div className="h-2.5 w-2.5 rounded-full bg-primary/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-secondary/60" />
          </div>
          <span className="text-xs font-semibold text-foreground truncate max-w-[250px]">
            {title || "3D Interactive Diagram"}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => setShowLabels(!showLabels)} className={`rounded-md p-1.5 transition-colors ${showLabels ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`} title="Toggle labels">
            <Tag className="h-4 w-4" />
          </button>
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
      <div className="h-[420px] w-full bg-gradient-to-b from-[hsl(230,15%,10%)] via-[hsl(230,15%,7%)] to-[hsl(230,15%,4%)]">
        <Canvas key={`${zoomLevel}-${showLabels}`}>
          <PerspectiveCamera makeDefault position={[0, 0, zoomLevel]} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={15}
            autoRotate={false}
            dampingFactor={0.1}
            enableDamping
          />
          <SceneEnvironment />
          <Suspense fallback={<LoadingPlane />}>
            <ImagePlane imageUrl={imageUrl} />
            {showLabels && autoLabels.map((label, i) => (
              <FloatingLabel key={i} text={label.text} position={label.position} color={label.color} />
            ))}
          </Suspense>
          <gridHelper args={[12, 12, "hsl(195, 100%, 25%)", "hsl(230, 15%, 12%)"]} position={[0, -2.8, 0]} />
        </Canvas>
      </div>

      {/* Zoom level indicator */}
      <div className="absolute bottom-12 right-3 flex flex-col gap-1 items-center">
        <button onClick={handleZoomIn} className="flex h-8 w-8 items-center justify-center rounded-lg bg-card/80 border border-border text-foreground backdrop-blur-sm hover:bg-muted transition-all shadow-lg">
          <ZoomIn className="h-4 w-4" />
        </button>
        <div className="text-[9px] text-muted-foreground font-mono bg-card/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
          {Math.round((5 / zoomLevel) * 100)}%
        </div>
        <button onClick={handleZoomOut} className="flex h-8 w-8 items-center justify-center rounded-lg bg-card/80 border border-border text-foreground backdrop-blur-sm hover:bg-muted transition-all shadow-lg">
          <ZoomOut className="h-4 w-4" />
        </button>
      </div>

      {/* Controls hint */}
      <div className="flex items-center justify-center gap-6 px-4 py-2 border-t border-border bg-gradient-to-r from-muted/30 to-muted/10">
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <RotateCcw className="h-3 w-3" /> Drag to rotate
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <ZoomIn className="h-3 w-3" /> Scroll to zoom
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          🖱️ Right-click to pan
        </span>
      </div>
    </motion.div>
  );
}
