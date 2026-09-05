import * as THREE from "three";
import { PROFILES } from "../../game/content";
import { count } from "../../game/engine";
import type { GameState } from "../../game/types";
import { islandConditions, type VisualEffect } from "./sceneState";

type HeightAt = (x: number, z: number, island: number) => number;
const MAX = 24;

/** Representatives of population groups, not individual simulated organisms. */
export function createPopulationScene(
  islands: THREE.Group[],
  heightAt: HeightAt,
) {
  const sphere = new THREE.SphereGeometry(1, 10, 7);
  const tailShape = new THREE.ConeGeometry(1, 1, 6);
  tailShape.rotateZ(-Math.PI / 2);
  const skin = new THREE.MeshStandardMaterial({
    color: "#d7ba79",
    roughness: 0.88,
  });
  const face = new THREE.MeshStandardMaterial({
    color: "#f2d49a",
    roughness: 0.9,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: "#192721",
    roughness: 0.8,
  });
  const dummy = new THREE.Object3D();
  const avatars = islands.map((island, i) => {
    const group = new THREE.Group();
    group.name = `population-${i}`;
    const make = (
      geometry: THREE.BufferGeometry,
      material: THREE.Material,
      capacity: number,
    ) => {
      const mesh = new THREE.InstancedMesh(geometry, material, capacity);
      mesh.count = 0;
      mesh.castShadow = true;
      mesh.frustumCulled = false;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      group.add(mesh);
      return mesh;
    };
    const bodies = make(sphere, skin, MAX),
      heads = make(sphere, face, MAX);
    const legs = make(sphere, skin, MAX * 4),
      tails = make(tailShape, skin, MAX);
    const eyes = make(sphere, dark, MAX * 2),
      ears = make(sphere, face, MAX * 2);
    island.add(group);
    return {
      bodies,
      heads,
      legs,
      tails,
      eyes,
      ears,
      target: 0,
      shown: 0,
      size: 1,
      warmth: 0,
      stress: false,
      shelter: false,
    };
  });

  function update(
    state: GameState,
    effects: VisualEffect[],
    immediate = false,
  ) {
    avatars.forEach((avatar, i) => {
      const population = count(state.regions[i]);
      avatar.target = Math.min(MAX, Math.ceil(population / 9));
      if (immediate) avatar.shown = avatar.target;
      let size = 0,
        warmth = 0;
      state.regions[i].counts.forEach((n, profile) => {
        size += n * PROFILES[profile][0];
        warmth += n * PROFILES[profile][1];
      });
      avatar.size = 0.86 + (population ? size / population : 1) * 0.15;
      avatar.warmth = population ? warmth / population : 0;
      const conditions = islandConditions(effects, i);
      avatar.stress =
        conditions.dry || conditions.snow || (conditions.ash && i === 5);
      avatar.shelter = conditions.refuge || conditions.cover;
      const coat = new THREE.Color().setHSL(
        0.105 - avatar.warmth * 0.018,
        0.39,
        0.66 - avatar.warmth * 0.07,
      );
      for (let n = 0; n < MAX; n++) {
        avatar.bodies.setColorAt(n, coat);
        avatar.tails.setColorAt(n, coat);
        for (let leg = 0; leg < 4; leg++)
          avatar.legs.setColorAt(n * 4 + leg, coat);
      }
      [avatar.bodies, avatar.tails, avatar.legs].forEach((mesh) => {
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      });
    });
  }

  function animate(time: number, delta: number, immediate: boolean) {
    avatars.forEach((avatar, island) => {
      avatar.shown = immediate
        ? avatar.target
        : THREE.MathUtils.damp(avatar.shown, avatar.target, 2.1, delta);
      if (Math.abs(avatar.shown - avatar.target) < 0.01)
        avatar.shown = avatar.target;
      const n = Math.ceil(avatar.shown);
      avatar.bodies.count = avatar.heads.count = avatar.tails.count = n;
      avatar.eyes.count = avatar.ears.count = n * 2;
      avatar.legs.count = n * 4;
      for (let j = 0; j < n; j++) {
        const seed = j * 2.39996 + island * 1.7;
        const pace = avatar.stress && !avatar.shelter ? 0.5 : 0.28;
        const cycle = time * pace * (0.72 + (j % 7) * 0.09) + seed;
        // A wandering loop alternates a visible walk with a pause to graze.
        const travel = cycle + 0.62 * Math.sin(cycle);
        const walking = 0.38 + 0.62 * (0.5 + 0.5 * Math.cos(cycle));
        let x: number, z: number, yaw: number;
        if (island === 2 || island === 5) {
          const r = 1.85 + (j % 3) * 0.1 + Math.sin(cycle * 0.7 + seed) * 0.12;
          x = Math.cos(travel) * r;
          z = Math.sin(travel) * r;
          yaw = travel + Math.PI / 2;
        } else {
          const rx = 0.5 + (j % 5) * 0.17,
            rz = 0.23 + (j % 4) * 0.12;
          const wander = travel * 1.37 + seed;
          x =
            Math.cos(travel) * rx +
            Math.sin(wander) * 0.2 +
            Math.sin(seed) * 0.25;
          z =
            0.6 +
            Math.sin(travel) * rz +
            Math.cos(wander) * 0.18 +
            Math.cos(seed) * 0.28;
          yaw = Math.atan2(
            Math.cos(travel) * rz - Math.sin(wander) * 0.18 * 1.37,
            -Math.sin(travel) * rx + Math.cos(wander) * 0.2 * 1.37,
          );
        }
        const h = heightAt(x, z, island);
        const size =
          avatar.size * Math.min(1, Math.max(0.01, avatar.shown - j));
        const stride = time * (avatar.stress ? 10 : 7) + seed;
        const bob = Math.abs(Math.sin(stride)) * 0.028 * walking;
        const cos = Math.cos(yaw),
          sin = Math.sin(yaw);
        const part = (
          mesh: THREE.InstancedMesh,
          index: number,
          forward: number,
          y: number,
          side: number,
          sx: number,
          sy: number,
          sz: number,
          tilt = 0,
        ) => {
          dummy.position.set(
            x + (cos * forward - sin * side) * size,
            h + (y + bob) * size,
            z + (sin * forward + cos * side) * size,
          );
          dummy.rotation.set(0, -yaw, tilt);
          dummy.scale.set(sx * size, sy * size, sz * size);
          dummy.updateMatrix();
          mesh.setMatrixAt(index, dummy.matrix);
        };
        part(avatar.bodies, j, 0, 0.22, 0, 0.29, 0.16, 0.15);
        const graze = (1 - walking) * 0.14;
        part(avatar.heads, j, 0.28, 0.28 - graze, 0, 0.15, 0.115, 0.12, -graze);
        part(
          avatar.tails,
          j,
          -0.37,
          0.2,
          Math.sin(time * 2.8 + seed) * 0.035,
          0.4,
          0.07,
          0.06,
          0.15,
        );
        for (let k = 0; k < 4; k++) {
          const front = k < 2 ? 1 : -1,
            side = k % 2 ? 1 : -1;
          const step =
            Math.sin(stride + (front * side > 0 ? 0 : Math.PI)) * walking;
          part(
            avatar.legs,
            j * 4 + k,
            front * 0.16 + step * 0.06,
            0.09 + Math.max(0, step) * 0.04,
            side * 0.105,
            0.055,
            0.11,
            0.045,
            step * 0.4,
          );
        }
        for (let k = 0; k < 2; k++) {
          const side = k ? 1 : -1;
          part(
            avatar.eyes,
            j * 2 + k,
            0.36,
            0.32 - graze,
            side * 0.087,
            0.021,
            0.025,
            0.02,
          );
          part(
            avatar.ears,
            j * 2 + k,
            0.21,
            0.4 - graze,
            side * 0.08,
            0.055,
            0.083,
            0.035,
          );
        }
      }
      [
        avatar.bodies,
        avatar.heads,
        avatar.legs,
        avatar.tails,
        avatar.eyes,
        avatar.ears,
      ].forEach((mesh) => {
        mesh.instanceMatrix.needsUpdate = true;
      });
    });
  }
  return { update, animate };
}
