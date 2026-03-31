import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows, Stage } from '@react-three/drei';
import { useEditorStore } from '../../store/editorStore';
import { KeyframeObject } from './KeyframeObject';
import { Suspense, useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { GLTFExporter } from 'three-stdlib';
import { useProjectStore } from '../../store/projectStore';
import { ensureImageLoaded } from '../../lib/sketchUtils';

interface EditorCanvasProps {
  sunPosition: [number, number, number];
  sunIntensity: number;
  sunColor: string;
}

function ExportHandler() {
  const { scene } = useThree();
  useEffect(() => {
    const handleExport = async () => {
      const isValidImage = (img: any) => {
        if (!img) return false;
        return (
          img instanceof HTMLImageElement ||
          img instanceof HTMLCanvasElement ||
          img instanceof ImageBitmap ||
          (typeof OffscreenCanvas !== 'undefined' && img instanceof OffscreenCanvas) ||
          (typeof VideoFrame !== 'undefined' && img instanceof VideoFrame)
        );
      };

      // Ensure all texture images are loaded before exporting to prevent 'drawImage' errors in GLTFExporter
      const exportPromises: Promise<void>[] = [];
      const bypassedTextures: { material: any; mapName: string; texture: any }[] = [];
      
      scene.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((mat: any) => {
            ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap'].forEach((mapName) => {
              const texture = mat[mapName];
              if (texture && texture.image) {
                const img = texture.image;
                
                if (isValidImage(img)) {
                  // Wait for the image to be fully ready if it's an HTMLImageElement
                  if (img instanceof HTMLImageElement && (!img.complete || img.naturalWidth === 0)) {
                    exportPromises.push(ensureImageLoaded(img));
                  } else {
                    const source = img; 
                    let sw = 0, sh = 0;
                    if (source instanceof HTMLImageElement) {
                      sw = source.naturalWidth;
                      sh = source.naturalHeight;
                    } else if (source instanceof HTMLVideoElement) {
                      sw = source.videoWidth;
                      sh = source.videoHeight;
                    } else if (typeof VideoFrame !== 'undefined' && source instanceof VideoFrame) {
                      sw = (source as any).displayWidth;
                      sh = (source as any).displayHeight;
                    } else {
                      sw = Number((source as any).width || 0);
                      sh = Number((source as any).height || 0);
                    }

                    if (sw === 0 || sh === 0) {
                      console.warn(`Bypassing incompatible texture source in ${mapName} for ${child.name || 'unnamed mesh'}.`);
                      bypassedTextures.push({ material: mat, mapName, texture });
                    }
                  }
                }
              }
            });
          });
        }
      });

      if (exportPromises.length > 0) {
        try {
          // Timeout after 5 seconds to avoid hanging the export
          await Promise.race([
            Promise.all(exportPromises),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Texture load timeout')), 5000))
          ]);
        } catch (e) {
          console.warn('Some textures failed to load or timed out, proceeding with export:', e);
        }
      }

      // Temporarily hide bypassed textures to prevent crash
      bypassedTextures.forEach(({ material, mapName }) => {
        material[mapName] = null;
        material.needsUpdate = true;
      });

      try {
        const exporter = new GLTFExporter();
        exporter.parse(
          scene,
          (gltf) => {
            const blob = new Blob([JSON.stringify(gltf)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'ixnel-scene.gltf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          },
          (error) => {
            console.error('An error happened during export:', error);
          },
          { binary: false } 
        );
      } finally {
        // Restore bypassed textures
        bypassedTextures.forEach(({ material, mapName, texture }) => {
          material[mapName] = texture;
          material.needsUpdate = true;
        });
      }
    };

    window.addEventListener('export-scene', handleExport);
    return () => window.removeEventListener('export-scene', handleExport);
  }, [scene]);

  return null;
}

export function EditorCanvas({ sunPosition, sunIntensity, sunColor }: EditorCanvasProps) {
  const sequence = useProjectStore((state) => state.sequence);
  const keyframes = useEditorStore((state) => state.keyframes);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const selectedId = useEditorStore((state) => state.selectedId);

  // Find the previous keyframe in the sequence
  let previousKeyframeData = null;
  if (selectedId) {
    const currentIndex = sequence.indexOf(selectedId);
    if (currentIndex > 0) {
      const prevId = sequence[currentIndex - 1];
      previousKeyframeData = keyframes.find((kf) => kf.id === prevId) || null;
    }
  }

  const handlePointerMissed = (e: MouseEvent) => {
    // If clicking outside any object, deselect
    if (e.type === 'click') {
      setSelectedId(null);
    }
  };

  const orbitRef = useRef<any>(null);

  useEffect(() => {
    const handleReset = () => {
      if (orbitRef.current) {
        orbitRef.current.reset();
      }
    };
    window.addEventListener('reset-camera', handleReset);
    return () => window.removeEventListener('reset-camera', handleReset);
  }, []);

  return (
    <Canvas
      gl={{ preserveDrawingBuffer: true }}
      shadows
      camera={{ position: [5, 5, 5], fov: 45, far: 500 }}
      onPointerMissed={handlePointerMissed}
      className="w-full h-full bg-neutral-50"
    >
      <color attach="background" args={['#fafafa']} />
      <fog attach="fog" args={['#fafafa', 10, 100]} />

      <directionalLight
        position={sunPosition}
        intensity={sunIntensity}
        color={sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      <Suspense fallback={null}>
        <ExportHandler />
        <Stage adjustCamera={false} intensity={0.5} environment="city">
          {previousKeyframeData && (
            <KeyframeObject key={`ghost-${previousKeyframeData.id}`} data={previousKeyframeData} isGhost={true} />
          )}
          {keyframes.map((kf) => (
            <KeyframeObject key={kf.id} data={kf} />
          ))}
        </Stage>

        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.8}
          scale={20}
          blur={2}
          far={4}
          color="#000000"
        />

        {useEditorStore.getState().showGrid && (
          <Grid
            infiniteGrid
            fadeDistance={60}
            fadeStrength={1}
            sectionColor="#cbd5e1" // Tailwind slate-300
            cellColor="#e2e8f0"    // Tailwind slate-200
          />
        )}

      </Suspense>

      {/* OrbitControls mapped to Right and Middle click typically */}
      <OrbitControls
        ref={orbitRef}
        makeDefault
        mouseButtons={{
          LEFT: undefined, // Left click is used for selection/transform
          MIDDLE: 2,       // THREE.MOUSE.DOLLY
          RIGHT: 0,        // THREE.MOUSE.ROTATE
        }}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
}
