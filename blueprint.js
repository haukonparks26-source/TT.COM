const canvas = document.querySelector("#blueprintCanvas");
const readout = document.querySelector("#blueprintReadout");
const hotspotButtons = Array.from(document.querySelectorAll("[data-blueprint-area]"));

if (!canvas) {
  throw new Error("Blueprint canvas is missing.");
}

let THREE = null;
let currentBuildKey = "";
let currentProfile;
let hotspots = {};
let activeArea = "engine";
let rotationY = -0.45;
let rotationX = 0.12;
let isDragging = false;
let lastPointer = { x: 0, y: 0 };
let fallbackContext = null;
let fallbackAnimationId = 0;

const runtime = {
  mode: "loading",
  scene: null,
  camera: null,
  renderer: null,
  blueprintGroup: null,
  vehicleGroup: null,
  grid: null
};

const makePalettes = {
  Acura: [0xd8dce6, 0x111827],
  Audi: [0xeef2f7, 0xb91c1c],
  BMW: [0xeaf3ff, 0x2f80ed],
  Buick: [0xf1f5f9, 0x9f1239],
  Cadillac: [0xf8e8a8, 0x5b21b6],
  Chevrolet: [0xf2c94c, 0x2d2a26],
  Chrysler: [0xcfe8ff, 0x1f4f7a],
  Dodge: [0xef4444, 0x111111],
  Ford: [0x2f80ed, 0xffffff],
  GMC: [0xc81e1e, 0xffffff],
  Honda: [0xf4f4f5, 0xdc2626],
  Hyundai: [0xdbeafe, 0x1d4ed8],
  Infiniti: [0xe5e7eb, 0x111827],
  Jeep: [0x5f6f52, 0xf6f1e8],
  Kia: [0xf4f4f5, 0x991b1b],
  Lexus: [0xe5e7eb, 0x111827],
  Mazda: [0xe5e7eb, 0x1f2937],
  "Mercedes-Benz": [0xf8fafc, 0x111827],
  Nissan: [0xe5e7eb, 0xb91c1c],
  Ram: [0x111827, 0xf6f1e8],
  Subaru: [0x1d4ed8, 0xffffff],
  Tesla: [0xef4444, 0xffffff],
  Toyota: [0xf4f4f5, 0xdc2626],
  Volkswagen: [0xdbeafe, 0x1d4ed8],
  Volvo: [0xdbeafe, 0x111827]
};

const vehicleProfiles = {
  sedan: {
    name: "sedan",
    cameraZ: 6.4,
    body: [4.25, 0.5, 1.52],
    bodyPos: [0, 0.32, 0],
    hood: [1.16, 0.34, 1.36],
    hoodPos: [1.46, 0.68, 0],
    cabin: [1.65, 0.72, 1.2],
    cabinPos: [-0.18, 0.9, 0],
    rear: [1.05, 0.34, 1.32],
    rearPos: [-1.46, 0.65, 0],
    wheelFrontX: 1.5,
    wheelRearX: -1.48,
    wheelZ: 0.84,
    hotspots: {
      engine: [1.46, 0.86, 0],
      wheel: [1.5, 0.16, 0.94],
      underbody: [0, 0.12, 0],
      transmission: [0.38, 0.45, 0],
      steering: [0.74, 1.02, 0.52],
      cabin: [-0.18, 1.18, 0]
    }
  },
  pickup: {
    name: "pickup truck",
    cameraZ: 7.2,
    body: [5.45, 0.6, 1.74],
    bodyPos: [0, 0.34, 0],
    hood: [1.42, 0.42, 1.5],
    hoodPos: [1.82, 0.76, 0],
    cabin: [1.32, 0.94, 1.42],
    cabinPos: [0.44, 1.02, 0],
    rear: [2.08, 0.42, 1.58],
    rearPos: [-1.38, 0.76, 0],
    wheelFrontX: 1.92,
    wheelRearX: -1.92,
    wheelZ: 0.95,
    hotspots: {
      engine: [1.82, 0.98, 0],
      wheel: [1.92, 0.18, 1.05],
      underbody: [0, 0.14, 0],
      transmission: [0.38, 0.48, 0],
      steering: [0.92, 1.18, 0.6],
      cabin: [0.44, 1.32, 0]
    }
  },
  suv: {
    name: "SUV",
    cameraZ: 6.9,
    body: [4.8, 0.72, 1.72],
    bodyPos: [0, 0.4, 0],
    hood: [1.22, 0.38, 1.48],
    hoodPos: [1.48, 0.82, 0],
    cabin: [2.35, 0.98, 1.46],
    cabinPos: [-0.32, 1.05, 0],
    rear: [0.88, 0.62, 1.42],
    rearPos: [-1.78, 0.9, 0],
    wheelFrontX: 1.62,
    wheelRearX: -1.62,
    wheelZ: 0.94,
    hotspots: {
      engine: [1.48, 0.98, 0],
      wheel: [1.62, 0.18, 1.05],
      underbody: [0, 0.14, 0],
      transmission: [0.24, 0.52, 0],
      steering: [0.7, 1.22, 0.58],
      cabin: [-0.32, 1.36, 0]
    }
  },
  coupe: {
    name: "coupe",
    cameraZ: 6.3,
    body: [4.35, 0.45, 1.52],
    bodyPos: [0, 0.28, 0],
    hood: [1.48, 0.32, 1.32],
    hoodPos: [1.42, 0.62, 0],
    cabin: [1.28, 0.58, 1.12],
    cabinPos: [-0.34, 0.78, 0],
    rear: [1.12, 0.32, 1.3],
    rearPos: [-1.48, 0.58, 0],
    wheelFrontX: 1.48,
    wheelRearX: -1.5,
    wheelZ: 0.82,
    hotspots: {
      engine: [1.42, 0.78, 0],
      wheel: [1.48, 0.14, 0.92],
      underbody: [0, 0.1, 0],
      transmission: [0.32, 0.38, 0],
      steering: [0.58, 0.88, 0.5],
      cabin: [-0.34, 1.02, 0]
    }
  },
  van: {
    name: "van",
    cameraZ: 7,
    body: [4.9, 0.76, 1.78],
    bodyPos: [0, 0.42, 0],
    hood: [0.85, 0.34, 1.5],
    hoodPos: [1.78, 0.82, 0],
    cabin: [3.15, 1.05, 1.52],
    cabinPos: [-0.34, 1.08, 0],
    rear: [0.8, 0.82, 1.5],
    rearPos: [-1.88, 1.0, 0],
    wheelFrontX: 1.55,
    wheelRearX: -1.7,
    wheelZ: 0.96,
    hotspots: {
      engine: [1.78, 0.94, 0],
      wheel: [1.55, 0.18, 1.06],
      underbody: [0, 0.14, 0],
      transmission: [0.16, 0.52, 0],
      steering: [0.92, 1.22, 0.6],
      cabin: [-0.34, 1.42, 0]
    }
  },
  ev: {
    name: "EV",
    cameraZ: 6.5,
    body: [4.45, 0.5, 1.58],
    bodyPos: [0, 0.32, 0],
    hood: [0.95, 0.28, 1.34],
    hoodPos: [1.42, 0.62, 0],
    cabin: [2.2, 0.78, 1.26],
    cabinPos: [-0.22, 0.9, 0],
    rear: [0.95, 0.3, 1.32],
    rearPos: [-1.5, 0.62, 0],
    wheelFrontX: 1.52,
    wheelRearX: -1.52,
    wheelZ: 0.86,
    hotspots: {
      engine: [1.08, 0.72, 0],
      wheel: [1.52, 0.16, 0.96],
      underbody: [0, 0.12, 0],
      transmission: [0, 0.34, 0],
      steering: [0.64, 1.02, 0.54],
      cabin: [-0.22, 1.18, 0]
    }
  }
};

const hotspotColors = {
  engine: 0xf06f61,
  wheel: 0xf0c35f,
  underbody: 0x58c4a6,
  transmission: 0x8fc7ff,
  steering: 0xc084fc,
  cabin: 0xf6f1e8
};

currentProfile = vehicleProfiles.sedan;

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function readVehicleFromControls() {
  return {
    year: document.querySelector("#vehicleYearSelect")?.value || "",
    make: document.querySelector("#vehicleMakeSelect")?.value || "",
    model: document.querySelector("#vehicleModelInput")?.value?.trim() || "",
    fuel: document.querySelector("#engineFuelSelect")?.value || "",
    engine: document.querySelector("#engineSpecInput")?.value?.trim() || "",
    aspiration: document.querySelector("#engineAspirationSelect")?.value || "",
    drivetrain: document.querySelector("#drivetrainSelect")?.value || "",
    mileage: document.querySelector("#mileageInput")?.value || ""
  };
}

function vehicleLabel(vehicle, type) {
  const name = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") || "Generic vehicle";
  const engine = [vehicle.engine, vehicle.aspiration, vehicle.fuel, vehicle.drivetrain].filter(Boolean).join(", ");
  return `${name} ${type.name} blueprint${engine ? ` - ${engine}` : ""}`;
}

function classifyVehicle(vehicle) {
  const text = normalize(`${vehicle.make} ${vehicle.model} ${vehicle.fuel}`);
  if (text.includes("f150") || text.includes("f250") || text.includes("f350") || text.includes("silverado") || text.includes("sierra") || text.includes("ram") || text.includes("tacoma") || text.includes("tundra") || text.includes("ranger") || text.includes("colorado") || text.includes("canyon") || text.includes("ridgeline") || text.includes("frontier") || text.includes("maverick")) {
    return vehicleProfiles.pickup;
  }
  if (text.includes("wrangler") || text.includes("bronco") || text.includes("explorer") || text.includes("escape") || text.includes("expedition") || text.includes("edge") || text.includes("rav4") || text.includes("4runner") || text.includes("highlander") || text.includes("crv") || text.includes("pilot") || text.includes("passport") || text.includes("rogue") || text.includes("pathfinder") || text.includes("murano") || text.includes("forester") || text.includes("outback") || text.includes("crosstrek") || text.includes("santafe") || text.includes("tucson") || text.includes("sorento") || text.includes("sportage") || text.includes("tahoe") || text.includes("suburban") || text.includes("yukon") || text.includes("terrain") || text.includes("acadia") || text.includes("x3") || text.includes("x5")) {
    return vehicleProfiles.suv;
  }
  if (text.includes("odyssey") || text.includes("sienna") || text.includes("pacifica") || text.includes("caravan") || text.includes("transit") || text.includes("sprinter")) {
    return vehicleProfiles.van;
  }
  if (text.includes("mustang") || text.includes("camaro") || text.includes("corvette") || text.includes("challenger") || text.includes("charger") || text.includes("miata") || text.includes("brz") || text.includes("86") || text.includes("supra")) {
    return vehicleProfiles.coupe;
  }
  if (text.includes("tesla") || text.includes("model3") || text.includes("modely") || text.includes("models") || text.includes("modelx") || text.includes("electric")) {
    return vehicleProfiles.ev;
  }
  return vehicleProfiles.sedan;
}

function paletteFor(vehicle) {
  return makePalettes[vehicle.make] || [0x58c4a6, 0xf0c35f];
}

async function loadThree() {
  const moduleSources = [
    "./vendor/three.module.min.js",
    "./three.module.min.js",
    "https://unpkg.com/three@0.160.0/build/three.module.min.js"
  ];

  for (const source of moduleSources) {
    try {
      return await import(source);
    } catch (error) {
      console.warn(`Three.js failed to load from ${source}.`, error);
    }
  }

  console.warn("All Three.js sources failed; using canvas blueprint.");
  return null;
}

function initThreeBlueprint() {
  runtime.scene = new THREE.Scene();
  runtime.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  runtime.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  runtime.renderer.setClearColor(0x000000, 0);
  runtime.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  if ("outputColorSpace" in runtime.renderer) runtime.renderer.outputColorSpace = THREE.SRGBColorSpace;

  runtime.blueprintGroup = new THREE.Group();
  runtime.vehicleGroup = new THREE.Group();
  runtime.grid = new THREE.GridHelper(8, 18, 0x58c4a6, 0x254347);
  runtime.grid.position.y = -0.22;
  runtime.grid.material.transparent = true;
  runtime.grid.material.opacity = 0.32;

  runtime.scene.add(runtime.grid);
  runtime.blueprintGroup.add(runtime.vehicleGroup);
  runtime.scene.add(runtime.blueprintGroup);
  runtime.scene.add(new THREE.AmbientLight(0x88fff0, 1.15));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.65);
  keyLight.position.set(3, 4, 5);
  runtime.scene.add(keyLight);

  const rimLight = new THREE.PointLight(0x58c4a6, 2.1, 9);
  rimLight.position.set(-3, 2.5, -3);
  runtime.scene.add(rimLight);

  runtime.mode = "three";
}

function initFallbackBlueprint(reason = "3D fallback") {
  fallbackContext = canvas.getContext("2d");
  runtime.mode = "fallback";
  if (readout && !readout.textContent.includes("canvas")) {
    readout.textContent = `${readout.textContent} - canvas backup`;
  }
  console.warn(reason);
}

function setVehicle(vehicle = readVehicleFromControls()) {
  const profile = classifyVehicle(vehicle);
  const [primary, accent] = paletteFor(vehicle);
  const buildKey = `${profile.name}:${primary}:${accent}:${runtime.mode}`;
  currentProfile = profile;

  if (readout) {
    const suffix = runtime.mode === "fallback" ? " - canvas backup" : "";
    readout.textContent = `${vehicleLabel(vehicle, profile)}${suffix}`;
  }

  if (runtime.mode === "three") {
    if (buildKey === currentBuildKey) return;
    currentBuildKey = buildKey;
    rebuildVehicle(profile, primary, accent);
  } else {
    currentBuildKey = buildKey;
    drawFallback();
  }
}

function rebuildVehicle(profile, primary, accent) {
  disposeGroup(runtime.vehicleGroup);
  runtime.vehicleGroup.clear();
  hotspots = {};

  const surface = new THREE.MeshStandardMaterial({
    color: primary,
    transparent: true,
    opacity: 0.2,
    metalness: 0.25,
    roughness: 0.36,
    side: THREE.DoubleSide
  });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x9ee8ff,
    transparent: true,
    opacity: 0.16,
    roughness: 0.2,
    side: THREE.DoubleSide
  });
  const bed = new THREE.MeshStandardMaterial({
    color: accent,
    transparent: true,
    opacity: 0.13,
    roughness: 0.4,
    side: THREE.DoubleSide
  });
  const edge = new THREE.LineBasicMaterial({ color: primary, transparent: true, opacity: 0.92 });
  const accentEdge = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.86 });
  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b0d0e,
    transparent: true,
    opacity: 0.48,
    roughness: 0.52
  });
  const wheelEdge = new THREE.LineBasicMaterial({ color: 0xf6f1e8, transparent: true, opacity: 0.62 });

  addBox(profile.body, profile.bodyPos, surface, edge);
  addBox(profile.hood, profile.hoodPos, surface, edge);
  addBox(profile.cabin, profile.cabinPos, glass, accentEdge);
  addBox(profile.rear, profile.rearPos, profile.name === "pickup truck" ? bed : surface, edge);
  addWheels(profile, wheelMaterial, wheelEdge);
  addCenterLine(profile, accent);
  addHotspots(profile);
  setActiveArea(activeArea);

  runtime.camera.position.set(0, 2.45, profile.cameraZ);
  runtime.camera.lookAt(0, 0.65, 0);
}

function addBox(size, position, material, edgeMaterial) {
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material.clone());
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), edgeMaterial.clone());
  group.add(mesh, edges);
  group.position.set(...position);
  runtime.vehicleGroup.add(group);
  return group;
}

function addWheels(profile, wheelMaterial, edgeMaterial) {
  const wheelPositions = [
    [profile.wheelFrontX, 0.1, profile.wheelZ],
    [profile.wheelFrontX, 0.1, -profile.wheelZ],
    [profile.wheelRearX, 0.1, profile.wheelZ],
    [profile.wheelRearX, 0.1, -profile.wheelZ]
  ];

  wheelPositions.forEach((position) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.34, 36), wheelMaterial.clone());
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(...position);
    const wheelEdges = new THREE.LineSegments(new THREE.EdgesGeometry(wheel.geometry), edgeMaterial.clone());
    wheelEdges.rotation.copy(wheel.rotation);
    wheelEdges.position.copy(wheel.position);
    runtime.vehicleGroup.add(wheel, wheelEdges);
  });

  [profile.wheelFrontX, profile.wheelRearX].forEach((x) => {
    const axle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, profile.wheelZ * 2.2, 16),
      new THREE.MeshBasicMaterial({ color: 0xf6f1e8, transparent: true, opacity: 0.45 })
    );
    axle.rotation.x = Math.PI / 2;
    axle.position.set(x, 0.12, 0);
    runtime.vehicleGroup.add(axle);
  });
}

function addCenterLine(profile, accent) {
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(profile.wheelRearX - 0.55, 0.12, 0),
    new THREE.Vector3(profile.wheelFrontX + 0.55, 0.12, 0)
  ]);
  const line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.74 }));
  runtime.vehicleGroup.add(line);
}

function addHotspots(profile) {
  Object.entries(profile.hotspots).forEach(([area, position]) => {
    const color = hotspotColors[area] || 0xf0c35f;
    const group = new THREE.Group();
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 24, 24),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.28 })
    );
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.018, 10, 48),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.72 })
    );
    ring.rotation.x = Math.PI / 2;
    group.position.set(...position);
    group.add(glow, ring);
    runtime.vehicleGroup.add(group);
    hotspots[area] = { group, glow, ring };
  });
}

function setActiveArea(area = "engine") {
  activeArea = currentProfile.hotspots[area] ? area : "engine";

  if (runtime.mode === "three") {
    Object.entries(hotspots).forEach(([key, hotspot]) => {
      const isActive = key === activeArea;
      hotspot.glow.material.opacity = isActive ? 0.82 : 0.18;
      hotspot.ring.material.opacity = isActive ? 1 : 0.34;
      hotspot.group.scale.setScalar(isActive ? 1.15 : 0.78);
    });
  }

  hotspotButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.blueprintArea === activeArea));
  });
  drawFallback();
}

function resize() {
  const width = Math.max(1, canvas.clientWidth);
  const height = Math.max(1, canvas.clientHeight);

  if (runtime.mode === "three") {
    runtime.renderer.setSize(width, height, false);
    runtime.camera.aspect = width / height;
    runtime.camera.updateProjectionMatrix();
  } else if (fallbackContext) {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    fallbackContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawFallback();
  }
}

function animate(time = 0) {
  if (runtime.mode === "three") {
    runtime.blueprintGroup.rotation.y = rotationY;
    runtime.blueprintGroup.rotation.x = rotationX;
    runtime.grid.rotation.y = rotationY * 0.2;

    const activeHotspot = hotspots[activeArea];
    if (activeHotspot) {
      const pulse = 1.14 + Math.sin(time * 0.006) * 0.16;
      activeHotspot.group.scale.setScalar(pulse);
    }

    runtime.renderer.render(runtime.scene, runtime.camera);
    requestAnimationFrame(animate);
    return;
  }

  drawFallback(time);
  fallbackAnimationId = requestAnimationFrame(animate);
}

function drawFallback(time = 0) {
  if (!fallbackContext || runtime.mode !== "fallback") return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const vehicle = readVehicleFromControls();
  const [primary, accent] = paletteFor(vehicle);
  const primaryCss = colorToCss(primary);
  const accentCss = colorToCss(accent);
  fallbackContext.clearRect(0, 0, width, height);

  drawFallbackGrid(width, height);
  drawFallbackBox(currentProfile.body, currentProfile.bodyPos, primaryCss, "rgba(88, 196, 166, 0.12)");
  drawFallbackBox(currentProfile.hood, currentProfile.hoodPos, primaryCss, "rgba(240, 111, 97, 0.12)");
  drawFallbackBox(currentProfile.cabin, currentProfile.cabinPos, "#9ee8ff", "rgba(158, 232, 255, 0.1)");
  drawFallbackBox(currentProfile.rear, currentProfile.rearPos, accentCss, "rgba(240, 195, 95, 0.1)");
  drawFallbackWheels(currentProfile);
  drawFallbackHotspots(time);
}

function drawFallbackGrid(width, height) {
  fallbackContext.save();
  fallbackContext.strokeStyle = "rgba(88, 196, 166, 0.12)";
  fallbackContext.lineWidth = 1;
  for (let x = 0; x < width; x += 28) {
    fallbackContext.beginPath();
    fallbackContext.moveTo(x, 0);
    fallbackContext.lineTo(x, height);
    fallbackContext.stroke();
  }
  for (let y = 0; y < height; y += 28) {
    fallbackContext.beginPath();
    fallbackContext.moveTo(0, y);
    fallbackContext.lineTo(width, y);
    fallbackContext.stroke();
  }
  fallbackContext.restore();
}

function drawFallbackBox(size, position, stroke, fill) {
  const corners = cubeCorners(size, position).map(projectPoint);
  const edges = [
    [0, 1], [1, 3], [3, 2], [2, 0],
    [4, 5], [5, 7], [7, 6], [6, 4],
    [0, 4], [1, 5], [2, 6], [3, 7]
  ];

  fallbackContext.save();
  fallbackContext.fillStyle = fill;
  fallbackContext.strokeStyle = stroke;
  fallbackContext.lineWidth = 2;
  fallbackContext.beginPath();
  [0, 1, 3, 2].forEach((index, order) => {
    const point = corners[index];
    if (order === 0) fallbackContext.moveTo(point.x, point.y);
    else fallbackContext.lineTo(point.x, point.y);
  });
  fallbackContext.closePath();
  fallbackContext.fill();

  edges.forEach(([a, b]) => {
    fallbackContext.beginPath();
    fallbackContext.moveTo(corners[a].x, corners[a].y);
    fallbackContext.lineTo(corners[b].x, corners[b].y);
    fallbackContext.stroke();
  });
  fallbackContext.restore();
}

function drawFallbackWheels(profile) {
  const wheelPositions = [
    [profile.wheelFrontX, 0.1, profile.wheelZ],
    [profile.wheelFrontX, 0.1, -profile.wheelZ],
    [profile.wheelRearX, 0.1, profile.wheelZ],
    [profile.wheelRearX, 0.1, -profile.wheelZ]
  ];

  fallbackContext.save();
  wheelPositions.forEach((position) => {
    const point = projectPoint(position);
    fallbackContext.beginPath();
    fallbackContext.ellipse(point.x, point.y, 20 * point.scale, 9 * point.scale, 0, 0, Math.PI * 2);
    fallbackContext.fillStyle = "rgba(6, 8, 9, 0.72)";
    fallbackContext.strokeStyle = "rgba(246, 241, 232, 0.72)";
    fallbackContext.lineWidth = 2;
    fallbackContext.fill();
    fallbackContext.stroke();
  });
  fallbackContext.restore();
}

function drawFallbackHotspots(time) {
  fallbackContext.save();
  Object.entries(currentProfile.hotspots).forEach(([area, position]) => {
    const point = projectPoint(position);
    const isActive = area === activeArea;
    const pulse = isActive ? 1 + Math.sin(time * 0.006) * 0.18 : 0.72;
    const radius = (isActive ? 18 : 12) * point.scale * pulse;
    fallbackContext.beginPath();
    fallbackContext.arc(point.x, point.y, radius, 0, Math.PI * 2);
    fallbackContext.fillStyle = hexWithAlpha(hotspotColors[area] || 0xf0c35f, isActive ? 0.34 : 0.14);
    fallbackContext.strokeStyle = colorToCss(hotspotColors[area] || 0xf0c35f);
    fallbackContext.lineWidth = isActive ? 3 : 1.5;
    fallbackContext.fill();
    fallbackContext.stroke();
  });
  fallbackContext.restore();
}

function cubeCorners(size, position) {
  const [width, height, depth] = size;
  const [x, y, z] = position;
  const hx = width / 2;
  const hy = height / 2;
  const hz = depth / 2;
  return [
    [x - hx, y - hy, z - hz],
    [x + hx, y - hy, z - hz],
    [x - hx, y + hy, z - hz],
    [x + hx, y + hy, z - hz],
    [x - hx, y - hy, z + hz],
    [x + hx, y - hy, z + hz],
    [x - hx, y + hy, z + hz],
    [x + hx, y + hy, z + hz]
  ];
}

function projectPoint([x, y, z]) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const cos = Math.cos(rotationY);
  const sin = Math.sin(rotationY);
  const rotatedX = x * cos - z * sin;
  const rotatedZ = x * sin + z * cos;
  const scaleBase = Math.min(width / 7, height / 3.8);
  const depthScale = Math.max(0.72, Math.min(1.18, 1 - rotatedZ * 0.055));
  return {
    x: width / 2 + rotatedX * scaleBase * depthScale,
    y: height * 0.67 - y * scaleBase * depthScale + rotatedZ * 7 + rotationX * 70,
    scale: depthScale
  };
}

function colorToCss(color) {
  return `#${color.toString(16).padStart(6, "0")}`;
}

function hexWithAlpha(color, alpha) {
  const hex = color.toString(16).padStart(6, "0");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function onPointerDown(event) {
  isDragging = true;
  lastPointer = { x: event.clientX, y: event.clientY };
  canvas.classList.add("is-dragging");
  canvas.setPointerCapture?.(event.pointerId);
}

function onPointerMove(event) {
  if (!isDragging) return;
  const dx = event.clientX - lastPointer.x;
  const dy = event.clientY - lastPointer.y;
  rotationY += dx * 0.008;
  rotationX = Math.max(-0.32, Math.min(0.52, rotationX + dy * 0.006));
  lastPointer = { x: event.clientX, y: event.clientY };
  drawFallback();
}

function onPointerUp(event) {
  isDragging = false;
  canvas.classList.remove("is-dragging");
  canvas.releasePointerCapture?.(event.pointerId);
}

function disposeGroup(group) {
  if (!group) return;
  group.traverse((child) => {
    child.geometry?.dispose();
    if (Array.isArray(child.material)) {
      child.material.forEach((material) => material.dispose?.());
    } else {
      child.material?.dispose?.();
    }
  });
}

function bindEvents() {
  hotspotButtons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      const area = button.dataset.blueprintArea;
      setActiveArea(area);
      window.dispatchEvent(new CustomEvent("torquetune:blueprint-select", { detail: { area } }));
    });
  });

  window.addEventListener("torquetune:highlight-area", (event) => {
    setActiveArea(event.detail?.area || "engine");
  });

  window.addEventListener("torquetune:vehicle-change", (event) => {
    setVehicle(event.detail?.vehicle || readVehicleFromControls());
  });

  [
    "#vehicleYearSelect",
    "#vehicleMakeSelect",
    "#vehicleModelInput",
    "#engineFuelSelect",
    "#engineSpecInput",
    "#engineAspirationSelect",
    "#drivetrainSelect",
    "#mileageInput"
  ].forEach((selector) => {
    const control = document.querySelector(selector);
    control?.addEventListener("input", () => setVehicle());
    control?.addEventListener("change", () => setVehicle());
  });

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerUp);

  if (window.ResizeObserver) {
    new ResizeObserver(resize).observe(canvas);
  } else {
    window.addEventListener("resize", resize);
  }
}

THREE = await loadThree();
bindEvents();

try {
  if (THREE) {
    initThreeBlueprint();
  } else {
    initFallbackBlueprint("Three.js could not load.");
  }
} catch (error) {
  initFallbackBlueprint(`WebGL could not start: ${error.message}`);
}

setVehicle();
setActiveArea(window.torqueTuneBlueprintArea || document.querySelector("#sourceSelect")?.value || "engine");
resize();
animate();

window.addEventListener("beforeunload", () => {
  if (fallbackAnimationId) cancelAnimationFrame(fallbackAnimationId);
});
