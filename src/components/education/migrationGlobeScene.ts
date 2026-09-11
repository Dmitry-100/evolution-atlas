import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { HUMAN_MIGRATION_ROUTES, HUMAN_ORIGIN_SITES } from "../../data/humanOrigins";
import landRings from "../../data/earthLand110m.json";
import { globePoint, migrationArc, routeView } from "./migrationGlobeGeometry";

export type MigrationGlobeController = {
  selectRoute: (id: string) => void;
  selectSite: (id: string, focus?: boolean) => void;
  setPlaying: (playing: boolean) => void;
  zoom: (factor: number) => void;
  reset: () => void;
  dispose: () => void;
};

type Options = {
  host: HTMLDivElement;
  labels: (HTMLButtonElement | null)[];
  activeRouteId: string;
  activeSiteId: string;
  playing: boolean;
  onRouteSelect: (id: string) => void;
  onFailure: () => void;
};

function earthTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");
  ctx.fillStyle = "#12272c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Natural Earth 1:110m land, public domain. See docs/migration-globe.md.
  const land = new Path2D();
  for (const ring of landRings) {
    ring.forEach(([lon, lat], index) => {
      const x = (lon + 180) / 360 * canvas.width;
      const y = (90 - lat) / 180 * canvas.height;
      if (index === 0) land.moveTo(x, y);
      else land.lineTo(x, y);
    });
    land.closePath();
  }
  const wash = ctx.createLinearGradient(0, 0, 0, canvas.height);
  wash.addColorStop(0, "#63746b");
  wash.addColorStop(0.28, "#7d8b79");
  wash.addColorStop(0.48, "#85917a");
  wash.addColorStop(0.7, "#617c70");
  wash.addColorStop(1, "#869588");
  ctx.fillStyle = wash;
  ctx.fill(land, "evenodd");
  ctx.strokeStyle = "#a8b69a";
  ctx.lineWidth = 0.65;
  ctx.stroke(land);

  // A restrained printed texture, not invented topographic relief.
  ctx.save();
  ctx.clip(land, "evenodd");
  for (let y = 0; y < canvas.height; y += 3) {
    for (let x = 0; x < canvas.width; x += 3) {
      const grain = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      ctx.fillStyle = `rgba(12, 28, 24, ${(grain - Math.floor(grain)) * 0.16})`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }
  ctx.restore();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function createMigrationGlobe(options: Options): MigrationGlobeController {
  const { host, labels } = options;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  const canvas = renderer.domElement;
  canvas.className = "migration-globe-canvas";
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "Трёхмерный глобус расселения Homo sapiens. Поворот — перетаскиванием или стрелками, масштаб — клавишами плюс и минус.");
  canvas.tabIndex = 0;
  host.prepend(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 30);
  camera.position.set(...globePoint([30, 16], 3.65));
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.085;
  // Leave ordinary scroll to the page; explicit buttons and pinch control zoom.
  controls.enableZoom = false;
  controls.rotateSpeed = 0.55;
  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = Math.PI - 0.15;

  const texture = earthTexture();
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 64),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.86, metalness: 0.12, emissive: "#477074", emissiveMap: texture, emissiveIntensity: 0.18 }),
  );
  scene.add(earth);
  scene.add(new THREE.AmbientLight("#a4babb", 1.25));
  const keyLight = new THREE.DirectionalLight("#fff0cb", 3.2);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight("#71a6b0", 1.5);
  scene.add(fillLight);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.035, 64, 48),
    new THREE.ShaderMaterial({
      vertexShader: `varying vec3 vNormal; varying vec3 vPosition;
        void main() { vec4 p = modelViewMatrix * vec4(position, 1.0); vPosition = p.xyz;
          vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * p; }`,
      fragmentShader: `varying vec3 vNormal; varying vec3 vPosition;
        void main() { float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(-vPosition))), 4.0);
          gl_FragColor = vec4(0.35, 0.64, 0.65, rim * 0.23); }`,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  scene.add(atmosphere);

  const gridMaterial = new THREE.LineBasicMaterial({ color: "#90b0a4", transparent: true, opacity: 0.12 });
  for (let latitude = -60; latitude <= 60; latitude += 30) {
    const points = Array.from({ length: 181 }, (_, i) => new THREE.Vector3(...globePoint([-180 + i * 2, latitude], 1.002)));
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), gridMaterial));
  }
  for (let longitude = -180; longitude < 180; longitude += 30) {
    const points = Array.from({ length: 91 }, (_, i) => new THREE.Vector3(...globePoint([longitude, -90 + i * 2], 1.002)));
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), gridMaterial));
  }

  const routeObjects = HUMAN_MIGRATION_ROUTES.map((route) => {
    const points = migrationArc(route.points).map((point) => new THREE.Vector3(...point));
    const curve = new THREE.CatmullRomCurve3(points);
    const material = new THREE.MeshBasicMaterial({ color: "#f3cd83", transparent: true, opacity: 0.42 });
    const line = new THREE.Mesh(new THREE.TubeGeometry(curve, points.length * 2, 0.0032, 5, false), material);
    const halo = new THREE.Mesh(
      new THREE.TubeGeometry(curve, points.length * 2, 0.009, 5, false),
      new THREE.MeshBasicMaterial({ color: "#eeba61", transparent: true, opacity: 0.08, depthWrite: false }),
    );
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.009, 12, 8), new THREE.MeshBasicMaterial({ color: "#e9c784" }));
    dot.position.copy(points.at(-1)!);
    scene.add(line, halo, dot);
    return { route, curve, line, halo, dot };
  });

  const sites = HUMAN_ORIGIN_SITES.map((site) => {
    const position = new THREE.Vector3(...globePoint([site.longitude, site.latitude], 1.015));
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.012, 16, 10), new THREE.MeshBasicMaterial({ color: "#fff0c3" }));
    dot.position.copy(position);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.021, 0.026, 40),
      new THREE.MeshBasicMaterial({ color: "#f5d28b", side: THREE.DoubleSide, transparent: true, opacity: 0.75 }),
    );
    ring.position.copy(position);
    ring.lookAt(position.clone().multiplyScalar(2));
    scene.add(dot, ring);
    return { site, position, dot, ring };
  });
  const traveler = new THREE.Mesh(new THREE.SphereGeometry(0.01, 16, 10), new THREE.MeshBasicMaterial({ color: "#fff7dd" }));
  scene.add(traveler);

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeRouteId = options.activeRouteId;
  let activeSiteId = options.activeSiteId;
  let playing = options.playing;
  let targetPosition: THREE.Vector3 | null = null;
  let visible = false;
  let disposed = false;
  let frame = 0;
  let width = 1;
  let height = 1;
  let previousTime = 0;
  let travelTime = 0;

  function focus(coordinates: [number, number]) {
    targetPosition = new THREE.Vector3(...globePoint(coordinates, camera.position.length()));
    if (motion.matches) {
      camera.position.copy(targetPosition);
      targetPosition = null;
      controls.update();
    }
    requestRender();
  }

  function selectRoute(id: string) {
    activeRouteId = id;
    travelTime = 0;
    routeObjects.forEach(({ route, line, halo, dot }) => {
      const active = route.id === id;
      line.material.opacity = active ? 1 : 0.3;
      line.material.color.set(active ? "#ffdc91" : "#bfa775");
      halo.visible = active;
      dot.material.color.set(active ? "#fff0bd" : "#bfa775");
    });
    const route = HUMAN_MIGRATION_ROUTES.find((item) => item.id === id);
    if (route) focus(routeView(route));
  }

  function selectSite(id: string, move = false) {
    activeSiteId = id;
    sites.forEach(({ site, dot, ring }) => {
      const active = site.id === id;
      dot.scale.setScalar(active ? 1.25 : 0.8);
      ring.material.opacity = active ? 1 : 0.4;
    });
    const site = HUMAN_ORIGIN_SITES.find((item) => item.id === id);
    if (move && site) focus([site.longitude, site.latitude]);
    requestRender();
  }

  const projected = new THREE.Vector3();
  const view = new THREE.Vector3();
  const lightOffset = new THREE.Vector3();
  function updateLabels() {
    view.copy(camera.position).normalize();
    sites.forEach(({ site, position }, index) => {
      const label = labels[index];
      if (!label) return;
      projected.copy(position).project(camera);
      const x = (projected.x * 0.5 + 0.5) * width;
      const y = (-projected.y * 0.5 + 0.5) * height;
      const front = position.clone().normalize().dot(view) > 1 / camera.position.length() + 0.035;
      const onScreen = front && x > 20 && x < width - 20 && y > 72 && y < height - 56;
      label.style.visibility = onScreen ? "visible" : "hidden";
      label.style.left = `${x}px`;
      label.style.top = `${y}px`;
      label.style.zIndex = site.id === activeSiteId ? "4" : "3";
      label.tabIndex = onScreen ? 0 : -1;
    });
  }

  function render(time: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const delta = Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    if (targetPosition) {
      // Rotate along the sphere; linear interpolation could cut through Earth.
      const distance = camera.position.length();
      const rotation = new THREE.Quaternion().setFromUnitVectors(camera.position.clone().normalize(), targetPosition.clone().normalize());
      camera.position.applyQuaternion(new THREE.Quaternion().slerp(rotation, 1 - Math.exp(-delta * 5))).setLength(distance);
      if (camera.position.distanceTo(targetPosition) < 0.002) {
        camera.position.copy(targetPosition);
        targetPosition = null;
      }
    }
    const moved = controls.update();
    // Light follows the viewer gently: every region stays readable after a turn.
    lightOffset.set(-2.5, 3, 2).applyQuaternion(camera.quaternion);
    keyLight.position.copy(camera.position).add(lightOffset);
    fillLight.position.copy(camera.position).multiplyScalar(-1).add(new THREE.Vector3(1, 0.5, 0));
    const animated = playing && !motion.matches;
    traveler.visible = animated && activeRouteId !== "african-mosaic";
    if (animated) travelTime += delta;
    const selected = routeObjects.find(({ route }) => route.id === activeRouteId);
    if (selected && traveler.visible) traveler.position.copy(selected.curve.getPointAt((travelTime / 7) % 1));
    updateLabels();
    renderer.render(scene, camera);
    if (animated || targetPosition || moved) requestRender();
  }

  function requestRender() {
    if (!frame && !disposed && visible && !document.hidden) frame = requestAnimationFrame(render);
  }

  function resize() {
    width = host.clientWidth;
    height = host.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.fov = width < 500 ? 43 : 36;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    requestRender();
  }

  function cancelFlight() { targetPosition = null; }
  controls.addEventListener("start", cancelFlight);
  controls.addEventListener("change", requestRender);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) { previousTime = performance.now(); requestRender(); }
    else { cancelAnimationFrame(frame); frame = 0; }
  }, { rootMargin: "80px" });
  intersectionObserver.observe(host);

  function zoom(factor: number) {
    targetPosition = null;
    camera.position.setLength(THREE.MathUtils.clamp(camera.position.length() * factor, 2.65, 5));
    controls.update();
    requestRender();
  }
  function reset() {
    camera.position.setLength(3.65);
    const route = HUMAN_MIGRATION_ROUTES.find(({ id }) => id === activeRouteId);
    focus(route ? routeView(route) : [30, 16]);
  }
  function onKey(event: KeyboardEvent) {
    if (event.key === "+" || event.key === "=") zoom(0.88);
    else if (event.key === "-") zoom(1.12);
    else if (event.key === "Home") reset();
    else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      targetPosition = null;
      const spherical = new THREE.Spherical().setFromVector3(camera.position);
      if (event.key === "ArrowLeft") spherical.theta -= 0.14;
      if (event.key === "ArrowRight") spherical.theta += 0.14;
      if (event.key === "ArrowUp") spherical.phi -= 0.14;
      if (event.key === "ArrowDown") spherical.phi += 0.14;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.15, Math.PI - 0.15);
      camera.position.setFromSpherical(spherical);
      controls.update();
      requestRender();
    } else return;
    event.preventDefault();
  }
  let pointerStart = { x: 0, y: 0 };
  const raycaster = new THREE.Raycaster();
  function onPointerDown(event: PointerEvent) { pointerStart = { x: event.clientX, y: event.clientY }; }
  function onPointerUp(event: PointerEvent) {
    if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5) return;
    const rect = canvas.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / width * 2 - 1, -(event.clientY - rect.top) / height * 2 + 1), camera);
    const hits = raycaster.intersectObjects([earth, ...routeObjects.map(({ halo }) => halo)]);
    const route = routeObjects.find(({ halo }) => halo === hits[0]?.object);
    if (route) options.onRouteSelect(route.route.id);
  }
  function onVisibility() { previousTime = performance.now(); requestRender(); }
  function onContextLost(event: Event) { event.preventDefault(); options.onFailure(); }
  canvas.addEventListener("keydown", onKey);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("webglcontextlost", onContextLost);
  document.addEventListener("visibilitychange", onVisibility);
  motion.addEventListener("change", requestRender);
  resize();
  selectRoute(activeRouteId);
  selectSite(activeSiteId);

  return {
    selectRoute,
    selectSite,
    zoom,
    reset,
    setPlaying(value) { playing = value; requestRender(); },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      controls.dispose();
      canvas.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", requestRender);
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          geometries.add(object.geometry);
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      texture.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
