"use client";

import {
  forwardRef,
  Suspense,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export interface WebGLSceneHandle {
  setScroll: (value: number) => void;
}

interface WebGLSceneProps {
  className?: string;
}

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexBase;
  uniform sampler2D uTexLeft;
  uniform sampler2D uTexRight;
  uniform sampler2D uTexSpace;
  uniform float uProgress;
  uniform float uNoiseScale;
  uniform float uEdgeThickness;
  uniform float uGlowIntensity;

  varying vec2 vUv;

  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec3 permute(vec3 x) {
    return mod289(((x * 34.0) + 1.0) * x);
  }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,
      0.366025403784439,
      -0.577350269189626,
      0.024390243902439
    );
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  vec4 alphaBlend(vec4 bottom, vec4 top) {
    float outAlpha = top.a + bottom.a * (1.0 - top.a);
    vec3 outColor = (top.rgb * top.a + bottom.rgb * bottom.a * (1.0 - top.a)) / max(outAlpha, 0.0001);
    return vec4(outColor, outAlpha);
  }

  void main() {
    vec2 uv = vUv;

    vec4 base = texture2D(uTexBase, uv);
    vec4 leftHand = texture2D(uTexLeft, uv);
    vec4 rightHand = texture2D(uTexRight, uv);
    vec4 space = texture2D(uTexSpace, uv);

    vec4 renaissance = alphaBlend(base, leftHand);
    renaissance = alphaBlend(renaissance, rightHand);

    float noise = snoise(uv * uNoiseScale);
    float normalizedNoise = noise * 0.5 + 0.5;

    vec2 center = vec2(0.5);
    float dist = distance(uv, center);
    float maxRadius = 0.9;
    float noisyRadius = uProgress * maxRadius + (normalizedNoise - 0.5) * 0.16 * uProgress;
    float signedDistance = noisyRadius - dist;

    float mask = step(0.0, signedDistance);
    vec3 color = mix(renaissance.rgb, space.rgb, mask);

    float edge = 1.0 - smoothstep(0.0, uEdgeThickness, abs(signedDistance));
    vec3 glow = vec3(1.0, 0.6, 0.1) * uGlowIntensity;
    color = mix(color, glow, edge * smoothstep(0.01, 0.18, uProgress));

    gl_FragColor = vec4(color, 1.0);
  }
`;

function ShaderPlane({
  materialRef,
}: {
  materialRef: React.RefObject<THREE.ShaderMaterial | null>;
}) {
  const [base, left, right, space] = useTexture([
    "/bg-layer-1.png",
    "/character-left-new.png",
    "/character-right-new.png",
    "/space-bg.png",
  ]);

  useEffect(() => {
    [base, left, right, space].forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
    });
  }, [base, left, right, space]);

  const uniforms = useMemo(
    () => ({
      uTexBase: { value: base },
      uTexLeft: { value: left },
      uTexRight: { value: right },
      uTexSpace: { value: space },
      uProgress: { value: 0.0 },
      uNoiseScale: { value: 4.0 },
      uEdgeThickness: { value: 0.2 },
      uGlowIntensity: { value: 1.0 },
    }),
    [base, left, right, space]
  );

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTexBase.value = base;
      materialRef.current.uniforms.uTexLeft.value = left;
      materialRef.current.uniforms.uTexRight.value = right;
      materialRef.current.uniforms.uTexSpace.value = space;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        args={[{ uniforms, vertexShader, fragmentShader }]}
        transparent={false}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

const WebGLScene = forwardRef<WebGLSceneHandle, WebGLSceneProps>(
  ({ className = "fixed inset-0 -z-10" }, ref) => {
    const materialRef = useRef<THREE.ShaderMaterial | null>(null);

    useImperativeHandle(ref, () => ({
      setScroll: (value: number) => {
        if (materialRef.current) {
          materialRef.current.uniforms.uProgress.value = THREE.MathUtils.clamp(value, 0, 1);
        }
      },
    }));

    return (
      <div className={`${className} pointer-events-none`}>
        <Canvas
          camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
          gl={{ antialias: false, alpha: true }}
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <Suspense fallback={null}>
            <ShaderPlane materialRef={materialRef} />
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

WebGLScene.displayName = "WebGLScene";
export default WebGLScene;
