/*
auto-generated by: https://github.com/react-spring/gltfjsx
*/

import * as THREE from 'three'
import React, { useRef } from 'react'
import { useLoader } from 'react-three-fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default function Model(props) {
  const group = useRef()
  const { nodes, materials } = useLoader(GLTFLoader, '/rooms.gltf')
  return (
    <group ref={group} {...props} dispose={null}>
      <scene name="Scene">
        <group name="rooms">
          <mesh
            material={materials.white}
            geometry={nodes.closet.geometry}
            name="closet"
            position={[0, 1, 0]}
            userData={{ name: 'closet' }}
          />
          <mesh
            material={materials.white}
            geometry={nodes.corner.geometry}
            name="corner"
            position={[16, 1, 0]}
            userData={{ name: 'corner' }}
          />
          <mesh
            material={materials.white}
            geometry={nodes.fourway.geometry}
            name="fourway"
            position={[12, 1, 0]}
            userData={{ name: 'fourway' }}
          />
          <mesh
            material={materials.white}
            geometry={nodes.junction.geometry}
            name="junction"
            position={[8, 1, 0]}
            userData={{ name: 'junction' }}
          />
          <mesh
            material={materials.white}
            geometry={nodes.straight.geometry}
            name="straight"
            position={[4, 1, 0]}
            userData={{ name: 'straight' }}
          />
        </group>
        <group name="inners">
          <mesh
            material={nodes['central-table'].material}
            geometry={nodes['central-table'].geometry}
            name="central-table"
            userData={{ name: 'central-table' }}
          />
          <mesh
            material={nodes.sideboard.material}
            geometry={nodes.sideboard.geometry}
            name="sideboard"
            userData={{ name: 'sideboard' }}
          />
          <mesh
            material={materials.inner}
            geometry={nodes.shelves.geometry}
            name="shelves"
            userData={{ name: 'shelves' }}
          />
        </group>
        <group name="actors">
          <mesh
            material={materials.actor}
            geometry={nodes['default-bot'].geometry}
            name="default-bot"
            position={[1.2, 0.2, 0]}
            userData={{ name: 'default-bot' }}>
            <mesh
              material={materials.red}
              geometry={nodes.shadow.geometry}
              name="shadow"
              position={[0, -0.195, 0]}
              scale={[0.5, 0.5, 0.5]}
              userData={{ name: 'shadow' }}
            />
          </mesh>
        </group>
      </scene>
    </group>
  )
}
