import * as THREE from "three";

export function createCreaturePortraitScene(
  canvas: HTMLCanvasElement,
  traits: number[][][],
  paused: boolean,
  onFailure: () => void,
) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3, 3, 1.65, -0.25, 0.1, 30);
  camera.position.set(0, 2.3, 7);
  camera.lookAt(0, 0.5, 0);
  scene.add(new THREE.HemisphereLight("#fff2d0", "#243f30", 2.8));
  const light = new THREE.DirectionalLight("#ffdb95", 3);
  light.position.set(-3, 5, 4);
  scene.add(light);
  const sphere = new THREE.SphereGeometry(1, 20, 14);
  const spike = new THREE.ConeGeometry(1, 1, 8);
  const geometries = new Set<THREE.BufferGeometry>([sphere, spike]);
  const materials = new Set<THREE.Material>();
  const models = traits.flatMap((profiles, side) =>
    profiles.map(([size, coat, diet, mobility], specimen) => {
      const group = new THREE.Group();
      const skin = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(
          0.11 - coat * 0.018,
          0.36,
          0.73 - coat * 0.16,
        ),
        roughness: 0.9,
      });
      const face = new THREE.MeshStandardMaterial({
        color: "#e9c78b",
        roughness: 0.9,
      });
      const dark = new THREE.MeshStandardMaterial({
        color: "#17241d",
        roughness: 0.55,
      });
      [skin, face, dark].forEach((m) => materials.add(m));
      const part = (
        material: THREE.Material,
        x: number,
        y: number,
        z: number,
        sx: number,
        sy: number,
        sz: number,
        geometry: THREE.BufferGeometry = sphere,
      ) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.scale.set(sx, sy, sz);
        group.add(mesh);
        return mesh;
      };
      part(
        skin,
        0,
        0.43 + mobility * 0.04,
        0,
        0.61,
        0.27 + coat * 0.07,
        0.28 + coat * 0.035,
      );
      part(face, 0.58, 0.54, 0, 0.25 + diet * 0.075, 0.24 - diet * 0.02, 0.22);
      part(dark, 0.81 + diet * 0.06, 0.5, 0, 0.065, 0.04, 0.065);
      for (const sign of [-1, 1]) {
        part(dark, 0.69, 0.63, sign * 0.19, 0.035, 0.04, 0.027);
        part(face, 0.48, 0.81, sign * 0.14, 0.09, 0.17 + coat * 0.02, 0.08);
        for (const front of [-1, 1])
          part(
            skin,
            front * 0.37,
            0.18,
            sign * 0.18,
            0.075,
            0.2 + mobility * 0.04,
            0.07,
          );
      }
      const tail = part(skin, -0.76, 0.35, 0, 0.13, 0.75, 0.12, spike);
      tail.rotation.z = Math.PI / 2 + 0.2;
      if (coat > 0.55)
        for (let i = 0; i < 18; i++) {
          const a = i * 2.4;
          const tuft = part(
            skin,
            Math.cos(a) * 0.45,
            0.6 + (i % 3) * 0.05,
            Math.sin(a) * 0.25,
            0.07,
            0.16 * coat,
            0.06,
            spike,
          );
          tuft.rotation.z = Math.cos(a) * 0.3;
        }
      group.scale.setScalar(
        (0.68 + size * 0.3) * (profiles.length > 1 ? 0.6 : 1),
      );
      const root = new THREE.Group();
      root.position.x =
        (side ? 1.48 : -1.48) +
        (profiles.length > 1 ? (specimen - 1) * 0.72 : 0);
      root.position.z = profiles.length > 1 && specimen === 1 ? -0.5 : 0;
      root.add(group);
      scene.add(root);
      group.rotation.y = -0.38;
      return group;
    }),
  );
  let frame = 0,
    stopped = paused,
    disposed = false,
    contextLost = false,
    time = 0,
    last = 0,
    angle = -0.38,
    dragging = false,
    pointerX = 0;
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const render = () => {
    if (!disposed && !contextLost) renderer.render(scene, camera);
  };
  const loop = (now: number) => {
    frame = 0;
    if (disposed || contextLost || document.hidden || stopped || media.matches)
      return;
    if (now - last >= 33) {
      time += Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!dragging) angle += 0.004;
      models.forEach((m) => {
        m.rotation.y = angle;
        m.position.y = Math.sin(time * 1.7) * 0.012;
      });
      render();
    }
    frame = requestAnimationFrame(loop);
  };
  const resume = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    render();
    if (
      !disposed &&
      !contextLost &&
      !document.hidden &&
      !stopped &&
      !media.matches
    ) {
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }
  };
  const resize = new ResizeObserver(() => {
    const width = canvas.clientWidth,
      height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const h = 6 / (width / height);
    camera.top = h / 2;
    camera.bottom = -h / 2;
    camera.updateProjectionMatrix();
    render();
  });
  resize.observe(canvas);
  const down = (e: PointerEvent) => {
    dragging = true;
    pointerX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    if (!dragging) return;
    angle += (e.clientX - pointerX) * 0.014;
    pointerX = e.clientX;
    models.forEach((m) => (m.rotation.y = angle));
    render();
  };
  const up = () => {
    dragging = false;
  };
  const lost = (e: Event) => {
    e.preventDefault();
    contextLost = true;
    cancelAnimationFrame(frame);
    onFailure();
  };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("webglcontextlost", lost);
  document.addEventListener("visibilitychange", resume);
  media.addEventListener("change", resume);
  resume();
  return {
    setPaused(value: boolean) {
      stopped = value;
      resume();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      document.removeEventListener("visibilitychange", resume);
      media.removeEventListener("change", resume);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("webglcontextlost", lost);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
    },
  };
}
