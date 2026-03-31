"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";
import type { Group, Mesh, MeshStandardMaterial } from "three";

interface KeyboardGLTF {
  nodes: {
    defaultMaterial: Mesh;
    defaultMaterial_1: Mesh;
    defaultMaterial_2: Mesh;
  };
  materials: {
    Keyboard: MeshStandardMaterial;
  };
}

interface KeyboardModelProps {
  progressRef: React.MutableRefObject<number>;
}

export function KeyboardModel({ progressRef }: KeyboardModelProps) {
  const groupRef = useRef<Group>(null);
  const { nodes, materials } = useGLTF(
    "/models/keyboard-draco.glb"
  ) as unknown as KeyboardGLTF;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const p = progressRef.current;

    // Idle y-rotation — slows to near-stop as scroll progresses
    groupRef.current.rotation.y += delta * 0.35 * (1 - p * 0.9);
    // Slight tilt — increases as keyboard recedes
    groupRef.current.rotation.x = -0.12 + p * 0.18;
    // Rise with the page + recede into distance
    groupRef.current.position.y = -1 + p * 3;
    groupRef.current.position.z = -p * 2;
  });

  if (!nodes.defaultMaterial || !nodes.defaultMaterial_2 || !materials.Keyboard) return null;

  return (
    <group ref={groupRef}>
      {/* Rim light travels with the keyboard — dynamic highlight as model rotates;
          also ensures the light is hidden if this group is visibility-gated */}
      <spotLight
        position={[-4, 3, -2]}
        intensity={8}
        color="#E8FF47"
        angle={0.25}
        penumbra={0.8}
        distance={15}
      />
        {/* Scale-normalised model — ~4 world units wide; tune if needed */}
        <group scale={0.01}>
          <Center>
            <group rotation={[-Math.PI / 2, 0, 0]}>
              <group rotation={[Math.PI / 2, 0, 0]}>
                {/* Keyboard body */}
                <mesh
                  geometry={nodes.defaultMaterial.geometry}
                  material={materials.Keyboard}
                  position={[0, -23.907, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  scale={100}
                />
                {/* defaultMaterial_1 (Wood_00 desk surface) intentionally omitted */}
                {/* Keyboard detail mesh */}
                <mesh
                  geometry={nodes.defaultMaterial_2.geometry}
                  material={materials.Keyboard}
                  position={[-21.666, 173.137, -75.702]}
                  rotation={[-1.476, 0, 0]}
                  scale={5.744}
                />
              </group>
            </group>
          </Center>
        </group>
    </group>
  );
}

useGLTF.preload("/models/keyboard-draco.glb");
