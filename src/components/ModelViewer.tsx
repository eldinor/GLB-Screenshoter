import React, { useEffect, useRef, useState } from "react";
import  '@babylonjs/core/Misc/screenshotTools';
import { Color4 } from '@babylonjs/core/Maths/math.color';
import { Engine } from '@babylonjs/core/Engines/engine';
import  {Scene} from '@babylonjs/core/scene';
import '@babylonjs/core/Helpers/sceneHelpers'
import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera'
import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight'
import {Vector3} from '@babylonjs/core/Maths/math.vector'
import { Tools } from '@babylonjs/core/Misc/tools';
import {FramingBehavior} from '@babylonjs/core/Behaviors/Cameras/framingBehavior'
import { FxaaPostProcess } from "@babylonjs/core/PostProcesses/fxaaPostProcess";
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader'
import { GLTFFileLoader } from '@babylonjs/loaders/glTF';

import { ModelFile, ScreenshotDimensions } from "../types";

const gltfLoader = new GLTFFileLoader();
gltfLoader.name = "gltf";
gltfLoader.extensions = {
  ".glb": { isBinary: true },
};
SceneLoader.RegisterPlugin(gltfLoader);

interface ModelViewerProps {
  model: ModelFile;
  onScreenshotTaken: (modelId: string, screenshotUrl: string) => void;
  isPreview?: boolean;
  backgroundColor: { hex: string; alpha: number };
  screenshotDimensions: ScreenshotDimensions;
  registerEngineResize?: (resizeFn: (() => void) | null) => void;
  setProgress?: (progress: number) => void;
  onModelLoadingChange?: (loading: boolean) => void;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  model,
  onScreenshotTaken,
  isPreview = false,
  backgroundColor,
  screenshotDimensions,
  registerEngineResize,
  setProgress,
  onModelLoadingChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Notify parent about loading state
  useEffect(() => {
    if (onModelLoadingChange) {
      onModelLoadingChange(isLoading);
    }
  }, [isLoading, onModelLoadingChange]);

  const validateGLBFile = async (file: File): Promise<boolean> => {
    return true;
  };

  const hexToRgba = (hex: string, alpha: number): Color4 => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return new Color4(r, g, b, alpha);
  };

   const waitForEnvironmentTextureReady = async(scene:Scene) => {
    while (!scene.environmentTexture || !scene.environmentTexture.isReady()) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

  const captureScreenshot = async (engine: Engine, camera: ArcRotateCamera, scene: Scene): Promise<string> => {
    try {
      // Set progress to indicate screenshot preparation started
      if (setProgress) setProgress(50);
      
      scene.createDefaultEnvironment({
        createGround: false,
        createSkybox: false,
      });
      await waitForEnvironmentTextureReady(scene)
      await scene.whenReadyAsync();
      
      // Update progress to indicate scene is ready
      if (setProgress) setProgress(75);

      camera.useFramingBehavior = true;
      const framingBehavior = camera.getBehaviorByName("Framing") as FramingBehavior;
      framingBehavior.framingTime = 0;
      //  framingBehavior.elevationReturnTime = -1;

      if (scene.meshes.length) {
        camera.lowerRadiusLimit = null;
        const worldExtends = scene.getWorldExtends((mesh) => {
          return mesh.isVisible && mesh.isEnabled();
        });
        framingBehavior.zoomOnBoundingInfo(worldExtends.min, worldExtends.max);
      }

  //    camera.alpha = Math.PI / 4;
   //   camera.beta = Math.PI / 3;

      new FxaaPostProcess("fxaa", 1.0, camera);

      const screenshotUrl = await Tools.CreateScreenshotUsingRenderTargetAsync(engine, camera, {
        width: screenshotDimensions.width,
        height: screenshotDimensions.height,
        precision: 1,
      });

      camera.alpha = Math.PI / 4;
      camera.beta = Math.PI / 3;
      
      // Set progress to 100% when screenshot is complete
      if (setProgress) setProgress(100);

      return screenshotUrl;
    } catch (err) {
      console.error("Screenshot creation failed:", err);
      throw new Error("Failed to create screenshot");
    }
  };

  // Register engine.resize with parent component
  useEffect(() => {
    if (registerEngineResize && engineRef.current) {
      registerEngineResize(() => {
        if (engineRef.current) {
          engineRef.current.resize();
        }
      });
    }
    
    return () => {
      if (registerEngineResize) {
        registerEngineResize(null);
      }
    };
  }, [registerEngineResize, engineRef.current]);

  useEffect(() => {
    if (!canvasRef.current) return;

    let isDisposed = false;
    let objectUrl: string | null = null;

    const initScene = async () => {
      try {
        setError(null);
        setIsLoading(true);
        // Reset progress at the beginning
        if (setProgress) setProgress(0);

        const isValid = await validateGLBFile(model.file);
        if (!isValid) return;

        const engine = new Engine(canvasRef.current, true, {
          preserveDrawingBuffer: true,
          stencil: true,
        });
        engineRef.current = engine;
        
        // Register resize function with parent if engine is ready
        if (registerEngineResize) {
          registerEngineResize(() => {
            if (engineRef.current) {
              engineRef.current.resize();
            }
          });
        }
        
        const scene = new Scene(engine);
        sceneRef.current = scene;

        scene.clearColor = hexToRgba(backgroundColor.hex, backgroundColor.alpha);

        scene.createDefaultEnvironment({
          createGround: false,
          createSkybox: false,
        });

        const camera = new ArcRotateCamera("camera", Math.PI / 4, Math.PI / 3, 10, Vector3.Zero(), scene);
        camera.attachControl(canvasRef.current, true);
        camera.wheelPrecision = 50;
        camera.upperRadiusLimit = 50;
        camera.panningSensibility = 50;
        /*
        camera.useAutoRotationBehavior = true;
        camera.autoRotationBehavior!.idleRotationSpeed = 0.5;
        camera.autoRotationBehavior!.idleRotationWaitTime = 3000;
        camera.autoRotationBehavior!.zoomStopsAnimation = true;
        */

        camera.useFramingBehavior = true;
        const framingBehavior = camera.getBehaviorByName("Framing") as FramingBehavior;
        framingBehavior.framingTime = 0;
   //     framingBehavior.elevationReturnTime = -1;

        new FxaaPostProcess("fxaa", 1.0, camera);

        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        objectUrl = URL.createObjectURL(model.file);

        // Reset progress to 0 at start of loading
        if (setProgress) setProgress(0);

        const result = await SceneLoader.ImportMeshAsync(
          "",
          objectUrl,
          "",
          scene,
          (evt) => {
            if (evt.lengthComputable) {
              const progress = Math.round((evt.loaded / evt.total) * 100);
              console.log(`Loading progress: ${progress}%`);
              if (setProgress) setProgress(progress);
            }
          },
          ".glb"
        );

        if (isDisposed) return;

        const meshes = result.meshes;
        if (meshes.length > 0) {
          const rootMesh = meshes[0];

          const boundingInfo = rootMesh.getHierarchyBoundingVectors(true);
          const size = boundingInfo.max.subtract(boundingInfo.min);
          const center = boundingInfo.min.add(size.scale(0.5));

          rootMesh.position = Vector3.Zero();
          rootMesh.position.subtractInPlace(center);

          const maxDimension = Math.max(size.x, size.y, size.z);
          if (maxDimension > 0) {
            const desiredSize = 5;
            const scale = desiredSize / maxDimension;
            rootMesh.scaling.scaleInPlace(scale);
          }

          camera.lowerRadiusLimit = null;
          const worldExtends = scene.getWorldExtends((mesh) => {
            return mesh.isVisible && mesh.isEnabled();
          });
          framingBehavior.zoomOnBoundingInfo(worldExtends.min, worldExtends.max);

          scene.executeWhenReady(async () => {
            if (isDisposed) return;

            try {
              if (!isPreview) {
                const screenshotUrl = await captureScreenshot(engine, camera, scene);
                onScreenshotTaken(model.id, screenshotUrl);
              }
              setIsLoading(false);
            } catch (err) {
              console.error("Screenshot creation failed:", err);
              setError("Failed to create model preview.");
              setIsLoading(false);
              if (setProgress) setProgress(0); // Reset progress on error
            }
          });
        }

        engine.runRenderLoop(() => {
          if (scene && !isDisposed) {
            scene.render();
          }
        });

        const handleResize = () => {
          if (!isDisposed) {
            engine.resize();
          }
        };
        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      } catch (err) {
        console.error("Error loading GLB file:", err);
        setError("Failed to load the 3D model. Please ensure the file is a valid GLB file and try again.");
        setIsLoading(false);
        if (setProgress) setProgress(0); // Reset progress on error
      }
    };

    initScene();

    return () => {
      isDisposed = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      if (sceneRef.current) {
        sceneRef.current.dispose();
      }
      if (registerEngineResize) {
        registerEngineResize(null);
      }
      
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, [model, onScreenshotTaken, isPreview, backgroundColor, screenshotDimensions]);

  if (error) {
    return (
      <div className="w-full h-full rounded-lg bg-slate-900 flex items-center justify-center">
        <div className="text-red-500 text-center p-4">
          <p className="font-semibold">{error}</p>
          <p className="text-sm mt-2 text-slate-400">Supported format: GLB (Binary GL Transmission Format)</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${!isPreview && isLoading ? "hidden" : ""}`}>
      <canvas ref={canvasRef} className="w-full h-full rounded-lg bg-slate-900" />
    </div>
  );
};

export default ModelViewer;
