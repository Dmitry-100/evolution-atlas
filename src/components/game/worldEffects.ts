import * as THREE from "three";
import { EDGES, cardKind } from "../../game/content";
import { connected, previewState } from "../../game/engine";
import type { CardKind, GameState } from "../../game/types";
import { ISLAND_CENTERS, islandConditions, sceneEffects } from "./sceneState";

type HeightAt = (x: number, z: number, island: number) => number;
const TAU = Math.PI * 2;
function random(n: number, seed: number) {
  const value = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
  return value - Math.floor(value);
}
type Feature = {
  group: THREE.Group;
  target: number;
  amount: number;
  planned: boolean;
  ring: THREE.Mesh;
};

export function createWorldEffects(
  scene: THREE.Scene,
  islands: THREE.Group[],
  lands: THREE.Mesh[],
  leaves: THREE.InstancedMesh[],
  heightAt: HeightAt,
  mist: THREE.DataTexture,
) {
  const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
  const leafGeometry = new THREE.SphereGeometry(1, 7, 5);
  const stone = new THREE.MeshStandardMaterial({
    color: "#ada17c",
    roughness: 1,
    flatShading: true,
  });
  const green = new THREE.MeshStandardMaterial({
    color: "#94b954",
    roughness: 0.85,
  });
  const wood = new THREE.MeshStandardMaterial({
    color: "#766040",
    roughness: 1,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: "#f1cc69",
    emissive: "#8b6821",
    emissiveIntensity: 0.3,
  });
  const features: Partial<Record<CardKind, Feature>>[] = [];
  const originalLeafColors = leaves.map((mesh) =>
    Float32Array.from(mesh.instanceColor!.array),
  );
  const targetLeafColors = originalLeafColors.map((colors) =>
    Float32Array.from(colors),
  );
  const leafColor = new THREE.Color();
  let tintRemaining = 0;
  const palettes = {
    dry: new THREE.Color("#b6a06b"),
    snow: new THREE.Color("#dde7dc"),
    ash: new THREE.Color("#66685e"),
  };

  const mesh = (
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
    sx = 1,
    sy = sx,
    sz = sx,
  ) => {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.scale.set(sx, sy, sz);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  };

  function ferns(
    parent: THREE.Group,
    x: number,
    z: number,
    island: number,
    seeds: boolean,
  ) {
    const floor = heightAt(x, z, island);
    for (let plant = 0; plant < 8; plant++) {
      const a = plant * 2.4,
        r = 0.18 + (plant % 3) * 0.2;
      const px = x + Math.cos(a) * r,
        pz = z + Math.sin(a) * r;
      const h = heightAt(px, pz, island);
      for (let petal = 0; petal < 5; petal++) {
        const angle = (petal * TAU) / 5;
        const frond = mesh(
          parent,
          leafGeometry,
          green,
          px + Math.cos(angle) * 0.12,
          h + 0.24,
          pz + Math.sin(angle) * 0.12,
          0.075,
          0.36,
          0.055,
        );
        frond.rotation.set(Math.sin(angle) * 0.65, 0, Math.cos(angle) * 0.65);
      }
      if (seeds) {
        mesh(
          parent,
          new THREE.CylinderGeometry(0.02, 0.03, 0.65, 5),
          green,
          px,
          h + 0.3,
          pz,
        );
        mesh(parent, leafGeometry, gold, px, h + 0.68, pz, 0.08, 0.16, 0.08);
      }
    }
    return floor;
  }

  const weather = islands.map((island, i) => {
    const localFeatures: Partial<Record<CardKind, Feature>> = {};
    for (const kind of [
      "refuge",
      "shade",
      "food",
      "mosaic",
      "cover",
    ] as CardKind[]) {
      const group = new THREE.Group();
      group.name = `card-${kind}-${i}`;
      const ring = mesh(
        group,
        new THREE.RingGeometry(0.85, 0.9, 40),
        new THREE.MeshBasicMaterial({
          color: "#f3cf7b",
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
        }),
        0,
        0.08,
        0,
      );
      ring.rotation.x = -Math.PI / 2;
      ring.visible = false;
      if (kind === "refuge") {
        const x = -1.2,
          z = 0.45,
          h = heightAt(x, z, i);
        for (let n = 0; n < 7; n++) {
          const a = (n / 6) * Math.PI;
          mesh(
            group,
            rockGeometry,
            stone,
            x + Math.cos(a) * 0.53,
            h + Math.sin(a) * 0.65,
            z,
            0.28,
            0.31,
            0.38,
          );
        }
        const opening = mesh(
          group,
          new THREE.CircleGeometry(0.48, 20),
          new THREE.MeshBasicMaterial({
            color: "#22251c",
            side: THREE.DoubleSide,
          }),
          x,
          h + 0.2,
          z - 0.22,
          1,
          1.1,
          1,
        );
        opening.rotation.y = -0.15;
        const light = new THREE.PointLight("#f8cb7d", 1.6, 1.8);
        light.position.set(x, h + 0.26, z + 0.1);
        group.add(light);
        ring.position.set(x, h + 0.025, z);
      } else if (kind === "cover") {
        for (let n = 0; n < 5; n++) {
          const x = 0.4 + n * 0.23,
            z = 1.0 + Math.sin(n * 2) * 0.25;
          const h = heightAt(x, z, i);
          mesh(
            group,
            rockGeometry,
            stone,
            x,
            h + 0.15,
            z,
            0.25,
            0.25 + (n % 2) * 0.16,
            0.26,
          );
        }
        const log = mesh(
          group,
          new THREE.CylinderGeometry(0.12, 0.17, 1.4, 7),
          wood,
          0.9,
          heightAt(0.9, 1.2, i) + 0.22,
          1.2,
        );
        log.rotation.z = Math.PI / 2;
        log.rotation.y = 0.3;
        ring.position.set(0.85, heightAt(0.85, 1.1, i), 1.1);
      } else if (kind === "shade") {
        const x = -0.8,
          z = -0.9,
          h = heightAt(x, z, i);
        mesh(
          group,
          new THREE.CylinderGeometry(0.09, 0.16, 1.7, 7),
          wood,
          x,
          h + 0.7,
          z,
        );
        for (let n = 0; n < 5; n++) {
          const a = (n * TAU) / 5;
          mesh(
            group,
            leafGeometry,
            green,
            x + Math.cos(a) * 0.45,
            h + 1.7 + (n % 2) * 0.2,
            z + Math.sin(a) * 0.45,
            0.62,
            0.28,
            0.55,
          );
        }
        ring.position.set(x, h + 0.03, z);
      } else {
        const x = kind === "food" ? -0.9 : 0.65,
          z = -0.25;
        const h = ferns(group, x, z, i, kind === "mosaic");
        ring.position.set(x, h + 0.03, z);
      }
      // Individual materials let a queued action look translucent, without
      // changing the appearance of objects on another island.
      group.traverse((object) => {
        if (object instanceof THREE.Mesh && object !== ring) {
          object.material = (object.material as THREE.Material).clone();
          (object.material as THREE.Material).transparent = true;
        }
      });
      group.visible = false;
      island.add(group);
      localFeatures[kind] = {
        group,
        ring,
        target: 0,
        amount: 0,
        planned: false,
      };
    }
    features.push(localFeatures);

    const overlay = new THREE.Mesh(
      lands[i].geometry,
      new THREE.MeshStandardMaterial({
        color: "#d7a258",
        roughness: 1,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    );
    overlay.name = `season-ground-${i}`;
    overlay.position.y = 0.013;
    overlay.visible = false;
    island.add(overlay);
    const cracks: number[] = [];
    for (let n = 0; n < 75; n++) {
      let x = (random(n, i + 30) - 0.5) * 3.7,
        z = (random(n, i + 50) - 0.5) * 3.7;
      for (let segment = 0; segment < 3; segment++) {
        const angle = n * 2.4 + segment * 0.9;
        const nx = x + Math.cos(angle) * 0.22,
          nz = z + Math.sin(angle) * 0.22;
        if (Math.hypot(nx, nz) < 2.2)
          cracks.push(
            x,
            heightAt(x, z, i) + 0.035,
            z,
            nx,
            heightAt(nx, nz, i) + 0.035,
            nz,
          );
        x = nx;
        z = nz;
      }
    }
    const fissures = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.Float32BufferAttribute(cracks, 3),
      ),
      new THREE.LineBasicMaterial({
        color: "#553519",
        transparent: true,
        opacity: 0.8,
      }),
    );
    fissures.name = `drought-cracks-${i}`;
    fissures.visible = false;
    island.add(fissures);
    const particlePositions = new Float32Array(120 * 3);
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );
    const particleMaterial = new THREE.PointsMaterial({
      color: "#e8ede7",
      size: 0.12,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particles.frustumCulled = false;
    particles.visible = false;
    island.add(particles);
    const streakPositions = new Float32Array(80 * 6);
    const streakGeometry = new THREE.BufferGeometry();
    streakGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(streakPositions, 3),
    );
    const rain = new THREE.LineSegments(
      streakGeometry,
      new THREE.LineBasicMaterial({
        color: "#a0ced5",
        transparent: true,
        opacity: 0.55,
      }),
    );
    rain.frustumCulled = false;
    rain.visible = false;
    island.add(rain);
    const flood = new THREE.Group();
    flood.name = `flood-${i}`;
    for (let n = 0; n < 3; n++) {
      const wave = mesh(
        flood,
        new THREE.RingGeometry(2.55 + n * 0.25, 2.65 + n * 0.25, 60),
        new THREE.MeshBasicMaterial({
          color: "#8ed1c8",
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
        }),
        0,
        0.12,
        0,
      );
      wave.rotation.x = -Math.PI / 2;
    }
    flood.visible = false;
    island.add(flood);
    const glow = mesh(
      island,
      new THREE.RingGeometry(2.75, 2.82, 70),
      new THREE.MeshBasicMaterial({
        color: "#b8d77d",
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      0,
      0.07,
      0,
    );
    glow.rotation.x = -Math.PI / 2;
    return {
      overlay,
      fissures,
      particles,
      particlePositions,
      particleMaterial,
      rain,
      streakPositions,
      flood,
      glow,
      conditions: islandConditions([], i),
      pulse: 0,
    };
  });

  const routeVisuals = EDGES.map(({ a, b }, index) => {
    const from = new THREE.Vector3(
      ISLAND_CENTERS[a][0],
      0.15,
      ISLAND_CENTERS[a][1],
    );
    const to = new THREE.Vector3(
      ISLAND_CENTERS[b][0],
      0.15,
      ISLAND_CENTERS[b][1],
    );
    const direction = to.clone().sub(from).normalize();
    from.addScaledVector(direction, 2.2);
    to.addScaledVector(direction, -2.2);
    const curve = new THREE.QuadraticBezierCurve3(
      from,
      from
        .clone()
        .lerp(to, 0.5)
        .add(new THREE.Vector3(0, 0.25, 0)),
      to,
    );
    const bridge = new THREE.Group();
    bridge.name = `bridge-${a}-${b}`;
    const causewayMaterial = stone.clone();
    causewayMaterial.transparent = true;
    const causeway = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 30, 0.28, 6, false),
      causewayMaterial,
    );
    causeway.scale.y = 0.75;
    causeway.receiveShadow = true;
    causeway.castShadow = true;
    bridge.add(causeway);
    for (let n = 0; n < 15; n++) {
      const p = curve.getPoint(n / 14);
      mesh(
        bridge,
        rockGeometry,
        causewayMaterial,
        p.x,
        p.y,
        p.z,
        0.34,
        0.16 + random(n, index) * 0.1,
        0.34,
      );
    }
    bridge.visible = false;
    scene.add(bridge);
    const divide = new THREE.Group();
    divide.name = `divide-${a}-${b}`;
    const middle = from.clone().lerp(to, 0.5);
    const across = new THREE.Vector3(-direction.z, 0, direction.x);
    for (let n = 0; n < 3; n++) {
      const positions = Array.from({ length: 20 }, (_, k) =>
        middle
          .clone()
          .addScaledVector(across, (k / 19) * 2.8 - 1.4)
          .addScaledVector(direction, (n - 1) * 0.5)
          .add(new THREE.Vector3(0, Math.sin((k / 19) * Math.PI) * 0.25, 0)),
      );
      const wave = new THREE.Mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(positions),
          22,
          0.055,
          5,
          false,
        ),
        new THREE.MeshBasicMaterial({
          color: "#a1e0d8",
          transparent: true,
          opacity: 0.7,
        }),
      );
      divide.add(wave);
    }
    divide.visible = false;
    scene.add(divide);
    const migration = new THREE.Group();
    migration.name = `migration-${a}-${b}`;
    const trail = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 30, 0.035, 5, false),
      new THREE.MeshBasicMaterial({
        color: "#e8c875",
        transparent: true,
        opacity: 0.6,
      }),
    );
    migration.add(trail);
    const travelers: THREE.Group[] = [];
    for (let n = 0; n < 6; n++) {
      const traveler = new THREE.Group();
      mesh(traveler, leafGeometry, gold, 0, 0.15, 0, 0.17, 0.1, 0.1);
      mesh(traveler, leafGeometry, gold, 0.17, 0.19, 0, 0.08);
      for (let leg = 0; leg < 4; leg++)
        mesh(
          traveler,
          leafGeometry,
          gold,
          leg < 2 ? 0.1 : -0.1,
          0.06,
          leg % 2 ? 0.07 : -0.07,
          0.025,
          0.07,
          0.025,
        );
      migration.add(traveler);
      travelers.push(traveler);
    }
    migration.visible = false;
    scene.add(migration);
    return {
      a,
      b,
      curve,
      bridge,
      causewayMaterial,
      divide,
      migration,
      trail,
      travelers,
      direction: 1,
      planned: false,
      until: -1,
    };
  });

  const volcano = new THREE.Group();
  volcano.name = "volcanic-eruption";
  islands[5].add(volcano);
  const lavaMaterial = new THREE.MeshStandardMaterial({
    color: "#ff7c2a",
    emissive: "#ff4612",
    emissiveIntensity: 2,
    roughness: 0.6,
  });
  for (let river = 0; river < 4; river++) {
    const points = Array.from({ length: 36 }, (_, n) => {
      const r = (n / 35) * 2.3,
        angle = river * 1.7 + 0.3 + Math.sin(n * 0.27) * 0.13;
      const x = 0.25 + Math.cos(angle) * r,
        z = -0.3 + Math.sin(angle) * r;
      return new THREE.Vector3(x, heightAt(x, z, 5) + 0.055, z);
    });
    mesh(
      volcano,
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points),
        40,
        0.075,
        6,
        false,
      ),
      lavaMaterial,
      0,
      0,
      0,
    );
  }
  const emberPositions = new Float32Array(110 * 3);
  const emberGeometry = new THREE.BufferGeometry().setAttribute(
    "position",
    new THREE.BufferAttribute(emberPositions, 3),
  );
  const embers = new THREE.Points(
    emberGeometry,
    new THREE.PointsMaterial({
      color: "#ffc267",
      size: 0.14,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  embers.frustumCulled = false;
  volcano.add(embers);
  const ashClouds: THREE.Sprite[] = [];
  for (let n = 0; n < 22; n++) {
    const cloud = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: mist,
        color: "#3b3934",
        transparent: true,
        opacity: 0.52,
        depthWrite: false,
      }),
    );
    volcano.add(cloud);
    ashClouds.push(cloud);
  }
  volcano.visible = false;
  let previous: GameState | null = null;

  function update(state: GameState, time: number, immediate: boolean) {
    const effects = sceneEffects(state);
    const preview = previewState(state);
    if (previous?.runId !== state.runId || previous?.turn !== state.turn)
      routeVisuals.forEach((route) => {
        route.until = -1;
      });
    weather.forEach((item, i) => {
      const conditions = islandConditions(effects, i);
      item.conditions = conditions;
      item.overlay.visible =
        conditions.dry || conditions.snow || conditions.ash;
      item.overlay.material.color.set(
        conditions.snow ? "#e1ece4" : conditions.ash ? "#45433c" : "#c9995b",
      );
      item.overlay.material.opacity = conditions.snow
        ? 0.85
        : conditions.ash
          ? 0.65
          : 0.48;
      item.fissures.visible = conditions.dry && !conditions.snow;
      item.flood.visible = conditions.flood;
      item.particles.visible =
        conditions.snow || conditions.ash || conditions.dry;
      item.rain.visible = conditions.rain && !conditions.snow;
      item.particleMaterial.color.set(
        conditions.snow ? "#edf4ef" : conditions.ash ? "#bbb2a0" : "#d7ad65",
      );
      item.particleMaterial.size = conditions.snow
        ? 0.12
        : conditions.ash
          ? 0.08
          : 0.055;
      for (const [kind, feature] of Object.entries(features[i])) {
        const active = effects.find(
          (effect) => effect.kind === kind && effect.region === i,
        );
        if (active && !feature.target) item.pulse = time + 2.4;
        feature.target = active ? 1 : 0;
        feature.planned = active?.planned ?? false;
        feature.ring.visible = feature.planned;
        feature.group.traverse((object) => {
          if (object instanceof THREE.Mesh && object !== feature.ring)
            (object.material as THREE.Material).opacity = feature.planned
              ? 0.62
              : 1;
        });
        if (immediate) feature.amount = feature.target;
      }
      const colors = targetLeafColors[i],
        base = originalLeafColors[i];
      for (let n = 0; n < colors.length; n += 3) {
        leafColor.setRGB(base[n], base[n + 1], base[n + 2]);
        if (conditions.dry) leafColor.lerp(palettes.dry, 0.83);
        if (conditions.ash) leafColor.lerp(palettes.ash, 0.88);
        if (conditions.snow) leafColor.lerp(palettes.snow, 0.9);
        leafColor.toArray(colors, n);
      }
      if (
        previous &&
        previous.runId === state.runId &&
        previous.phase === "planning" &&
        state.phase !== "planning"
      )
        item.pulse = time + 3;
    });
    tintRemaining = 2;
    routeVisuals.forEach((route) => {
      const matches = (effect: { region: number; destination?: number }) =>
        (effect.region === route.a && effect.destination === route.b) ||
        (effect.region === route.b && effect.destination === route.a);
      const bridge = effects.find(
        (effect) => effect.kind === "bridge" && matches(effect),
      );
      const divide = effects.find(
        (effect) => effect.kind === "divide" && matches(effect),
      );
      route.bridge.visible = !!bridge && connected(preview, route.a, route.b);
      route.causewayMaterial.opacity = bridge?.planned ? 0.5 : 1;
      route.causewayMaterial.color.set(bridge?.planned ? "#dcca81" : "#a59b76");
      route.divide.visible =
        !!divide ||
        effects.some(
          (effect) =>
            effect.kind === "flood" &&
            (effect.region === route.a || effect.region === route.b),
        );
      const planned = effects.find(
        (effect) => effect.kind === "migrate" && matches(effect),
      );
      const applied =
        previous?.runId === state.runId &&
        previous.phase === "planning" &&
        state.phase !== "planning"
          ? previous.draft.find(
              (action) =>
                cardKind(action.card) === "migrate" && matches(action),
            )
          : undefined;
      if (applied) route.until = time + 7;
      route.planned = !!planned;
      if (planned || applied)
        route.direction = (planned ?? applied)!.region === route.a ? 1 : -1;
      route.migration.visible = !!planned || route.until > time;
      (route.trail.material as THREE.MeshBasicMaterial).color.set(
        planned ? "#edcb7c" : "#91d5b6",
      );
    });
    volcano.visible = effects.some((effect) => effect.kind === "eruption");
    previous = state;
    return effects;
  }

  function animate(time: number, delta: number, immediate: boolean) {
    if (tintRemaining > 0 || immediate) {
      leaves.forEach((leaf, i) => {
        const colors = leaf.instanceColor!.array;
        for (let n = 0; n < colors.length; n++)
          colors[n] = immediate
            ? targetLeafColors[i][n]
            : THREE.MathUtils.damp(
                colors[n],
                targetLeafColors[i][n],
                3.5,
                delta,
              );
        leaf.instanceColor!.needsUpdate = true;
      });
      tintRemaining = immediate ? 0 : tintRemaining - delta;
    }
    features.forEach((local) =>
      Object.values(local).forEach((feature) => {
        feature.amount = immediate
          ? feature.target
          : THREE.MathUtils.damp(feature.amount, feature.target, 4.5, delta);
        if (Math.abs(feature.amount - feature.target) < 0.01)
          feature.amount = feature.target;
        feature.group.visible = feature.amount > 0;
        feature.group.scale.y = Math.max(0.01, feature.amount);
        (feature.ring.material as THREE.MeshBasicMaterial).opacity =
          0.55 + Math.sin(time * 2.5) * 0.18;
      }),
    );
    weather.forEach((item, i) => {
      const { snow, ash, dry } = item.conditions;
      if (item.particles.visible) {
        for (let n = 0; n < 120; n++) {
          const speed = snow ? 0.65 : ash ? 0.48 : 0.25;
          const fall = (random(n, i + 12) * 5 + time * speed) % 5;
          item.particlePositions[n * 3] =
            (random(n, i + 14) - 0.5) * 5.5 +
            Math.sin(time * 0.7 + n) * (dry ? 0.65 : 0.18);
          item.particlePositions[n * 3 + 1] = dry ? 0.2 + fall * 0.2 : 5 - fall;
          item.particlePositions[n * 3 + 2] = (random(n, i + 16) - 0.5) * 5.5;
        }
        item.particles.geometry.attributes.position.needsUpdate = true;
      }
      if (item.rain.visible) {
        for (let n = 0; n < 80; n++) {
          const x = (random(n, i + 21) - 0.5) * 5.4,
            z = (random(n, i + 23) - 0.5) * 5.4;
          const y = 5 - ((random(n, i + 25) * 5 + time * 4.6) % 5);
          item.streakPositions.set([x, y, z, x + 0.08, y + 0.32, z], n * 6);
        }
        item.rain.geometry.attributes.position.needsUpdate = true;
      }
      item.flood.children.forEach((wave, n) => {
        wave.scale.setScalar(1 + Math.sin(time * 1.5 + n) * 0.08);
        wave.position.y = 0.1 + Math.sin(time * 1.7 + n) * 0.055;
      });
      const remaining = Math.max(0, item.pulse - time);
      (item.glow.material as THREE.MeshBasicMaterial).opacity = immediate
        ? 0
        : Math.min(0.65, remaining * 0.25);
      item.glow.scale.setScalar(1 + (1 - remaining / 3) * 0.23);
    });
    routeVisuals.forEach((route) => {
      route.divide.children.forEach((wave, n) => {
        wave.position.y = Math.sin(time * 2.4 + n) * 0.09;
      });
      route.migration.visible = route.planned || route.until > time;
      if (!route.migration.visible) return;
      route.travelers.forEach((traveler, n) => {
        let progress = (time * 0.18 + n / 6) % 1;
        if (route.direction === -1) progress = 1 - progress;
        traveler.position.copy(route.curve.getPoint(progress));
        const tangent = route.curve
          .getTangent(progress)
          .multiplyScalar(route.direction);
        traveler.rotation.y = -Math.atan2(tangent.z, tangent.x);
        traveler.position.y += Math.abs(Math.sin(time * 9 + n)) * 0.035;
      });
    });
    if (volcano.visible) {
      lavaMaterial.emissiveIntensity = 1.5 + Math.sin(time * 2) * 0.35;
      const mouth = heightAt(0.25, -0.3, 5);
      for (let n = 0; n < 110; n++) {
        const t = (time * 0.48 + n / 110) % 1,
          angle = n * 2.4;
        emberPositions[n * 3] =
          0.25 + Math.cos(angle) * t * (1.2 + random(n, 1));
        emberPositions[n * 3 + 1] =
          mouth + Math.sin(t * Math.PI) * (1.4 + random(n, 3) * 1.8) - t * 0.6;
        emberPositions[n * 3 + 2] =
          -0.3 + Math.sin(angle) * t * (1.2 + random(n, 5));
      }
      emberGeometry.attributes.position.needsUpdate = true;
      ashClouds.forEach((cloud, n) => {
        const rise = (time * 0.55 + (n / 22) * 4) % 4;
        cloud.position.set(
          0.25 + rise * 0.45 + Math.sin(n * 2.4) * rise * 0.25,
          mouth + rise,
          -0.3 + Math.cos(n * 2.4) * rise * 0.2,
        );
        cloud.scale.setScalar(0.65 + rise * 0.7);
        cloud.material.opacity = Math.sin((rise / 4) * Math.PI) * 0.62;
      });
    }
  }
  // These source materials are cloned for per-island previews.
  function dispose() {
    stone.dispose();
    green.dispose();
    wood.dispose();
    gold.dispose();
  }
  return { update, animate, dispose };
}
