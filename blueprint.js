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
let issueZones = {};
let activeArea = "engine";
let rotationY = -0.45;
let rotationX = 0.12;
let isDragging = false;
let lastPointer = { x: 0, y: 0 };
let pointerStart = { x: 0, y: 0, time: 0 };
let pointerMoved = false;
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

const modelSpecificProfiles = [
  {
    id: "ford-f150",
    base: "pickup",
    label: "Ford F-Series full-size pickup",
    matches: ["fordf150", "fordf250", "fordf350", "fordfseries"],
    overrides: {
      cameraZ: 7.8,
      body: [5.85, 0.66, 1.9],
      bodyPos: [0, 0.36, 0],
      hood: [1.64, 0.52, 1.66],
      hoodPos: [1.96, 0.84, 0],
      cabin: [1.42, 1.02, 1.52],
      cabinPos: [0.42, 1.08, 0],
      rear: [2.24, 0.46, 1.72],
      rearPos: [-1.56, 0.8, 0],
      wheelFrontX: 2.08,
      wheelRearX: -2.15,
      wheelZ: 1.04,
      hotspots: {
        engine: [1.95, 1.03, 0],
        wheel: [2.08, 0.18, 1.14],
        underbody: [-0.2, 0.14, 0],
        transmission: [0.42, 0.5, 0],
        steering: [0.98, 1.22, 0.64],
        cabin: [0.42, 1.42, 0]
      },
      details: {
        style: "full-size pickup",
        grille: { height: 0.54, width: 1.38, y: 0.84, ribs: 5, blocky: true },
        headlights: "stacked",
        bedRails: true,
        tailgate: true,
        towHooks: true,
        wheelArchScale: 1.12,
        hoodRidges: 3
      }
    }
  },
  {
    id: "chevy-silverado",
    base: "pickup",
    label: "Chevrolet Silverado truck",
    matches: ["chevroletsilverado", "chevysilverado", "gmcsierra"],
    overrides: {
      cameraZ: 7.7,
      body: [5.72, 0.64, 1.86],
      hood: [1.58, 0.48, 1.64],
      hoodPos: [1.92, 0.82, 0],
      cabin: [1.46, 0.98, 1.48],
      cabinPos: [0.42, 1.05, 0],
      rear: [2.18, 0.44, 1.7],
      rearPos: [-1.52, 0.78, 0],
      wheelFrontX: 2.04,
      wheelRearX: -2.08,
      wheelZ: 1.02,
      details: {
        style: "full-size pickup",
        grille: { height: 0.48, width: 1.44, y: 0.82, ribs: 4, crossbar: true },
        headlights: "split",
        bedRails: true,
        tailgate: true,
        wheelArchScale: 1.08,
        hoodRidges: 2
      }
    }
  },
  {
    id: "ram-1500",
    base: "pickup",
    label: "Ram full-size truck",
    matches: ["ram1500", "ram2500", "ram3500", "dodgeram"],
    overrides: {
      cameraZ: 7.8,
      body: [5.78, 0.68, 1.9],
      hood: [1.66, 0.56, 1.68],
      hoodPos: [1.98, 0.88, 0],
      cabin: [1.4, 1.02, 1.5],
      cabinPos: [0.38, 1.09, 0],
      rear: [2.16, 0.46, 1.72],
      rearPos: [-1.56, 0.81, 0],
      wheelFrontX: 2.06,
      wheelRearX: -2.12,
      wheelZ: 1.04,
      details: {
        style: "full-size pickup",
        grille: { height: 0.58, width: 1.34, y: 0.86, ribs: 3, blocky: true },
        headlights: "wide",
        bedRails: true,
        tailgate: true,
        wheelArchScale: 1.12,
        hoodRidges: 2
      }
    }
  },
  {
    id: "toyota-tacoma",
    base: "pickup",
    label: "midsize Toyota pickup",
    matches: ["toyotatacoma", "toyotatundra"],
    overrides: {
      cameraZ: 7.35,
      body: [5.42, 0.6, 1.76],
      hood: [1.44, 0.45, 1.5],
      hoodPos: [1.8, 0.78, 0],
      cabin: [1.36, 0.94, 1.38],
      cabinPos: [0.36, 1.03, 0],
      rear: [2.02, 0.42, 1.58],
      rearPos: [-1.36, 0.76, 0],
      wheelFrontX: 1.9,
      wheelRearX: -1.94,
      wheelZ: 0.98,
      details: {
        style: "midsize pickup",
        grille: { height: 0.46, width: 1.2, y: 0.8, ribs: 3 },
        headlights: "angled",
        bedRails: true,
        tailgate: true,
        wheelArchScale: 1.04,
        hoodRidges: 2
      }
    }
  },
  {
    id: "jeep-wrangler",
    base: "suv",
    label: "Jeep Wrangler off-road SUV",
    matches: ["jeepwrangler"],
    overrides: {
      cameraZ: 6.9,
      body: [4.32, 0.78, 1.72],
      bodyPos: [0, 0.42, 0],
      hood: [1.16, 0.42, 1.48],
      hoodPos: [1.44, 0.86, 0],
      cabin: [1.7, 1.18, 1.44],
      cabinPos: [-0.18, 1.16, 0],
      rear: [0.98, 0.9, 1.44],
      rearPos: [-1.52, 1.02, 0],
      wheelFrontX: 1.48,
      wheelRearX: -1.55,
      wheelZ: 1.0,
      hotspots: {
        engine: [1.42, 1.02, 0],
        wheel: [1.48, 0.18, 1.08],
        underbody: [-0.05, 0.16, 0],
        transmission: [0.18, 0.54, 0],
        steering: [0.62, 1.24, 0.6],
        cabin: [-0.18, 1.5, 0]
      },
      details: {
        style: "off-road SUV",
        grille: { height: 0.52, width: 1.14, y: 0.88, ribs: 7 },
        headlights: "round",
        roofRails: false,
        spareTire: true,
        wheelArchScale: 1.2,
        uprightCabin: true,
        hoodRidges: 2
      }
    }
  },
  {
    id: "toyota-rav4-crv",
    base: "suv",
    label: "compact crossover SUV",
    matches: ["toyotarav4", "hondacrv", "fordescape", "nissanrogue", "hyundaitucson", "kiasportage", "subaruforester", "mazdacx5", "volkswagentiguan"],
    overrides: {
      cameraZ: 6.95,
      body: [4.74, 0.72, 1.7],
      hood: [1.18, 0.38, 1.46],
      hoodPos: [1.46, 0.82, 0],
      cabin: [2.18, 0.96, 1.44],
      cabinPos: [-0.28, 1.06, 0],
      rear: [0.96, 0.68, 1.42],
      rearPos: [-1.72, 0.92, 0],
      wheelFrontX: 1.58,
      wheelRearX: -1.58,
      wheelZ: 0.94,
      details: {
        style: "compact crossover",
        grille: { height: 0.34, width: 1.18, y: 0.78, ribs: 3 },
        headlights: "angled",
        roofRails: true,
        rearLiftgate: true,
        wheelArchScale: 1.03,
        hoodRidges: 2
      }
    }
  },
  {
    id: "large-suv",
    base: "suv",
    label: "large SUV",
    matches: ["fordexplorer", "fordexpedition", "chevytahoe", "chevroletsuburban", "gmcyukon", "toyotahighlander", "toyota4runner", "hondapilot", "nissanpathfinder", "jeepgrandcherokee", "bmwx5", "mercedesbenzgle"],
    overrides: {
      cameraZ: 7.25,
      body: [5.12, 0.78, 1.86],
      hood: [1.32, 0.44, 1.58],
      hoodPos: [1.62, 0.88, 0],
      cabin: [2.42, 1.08, 1.58],
      cabinPos: [-0.34, 1.12, 0],
      rear: [1.08, 0.78, 1.54],
      rearPos: [-1.92, 0.98, 0],
      wheelFrontX: 1.72,
      wheelRearX: -1.78,
      wheelZ: 1.02,
      details: {
        style: "large SUV",
        grille: { height: 0.44, width: 1.28, y: 0.84, ribs: 4 },
        headlights: "wide",
        roofRails: true,
        rearLiftgate: true,
        wheelArchScale: 1.08,
        hoodRidges: 2
      }
    }
  },
  {
    id: "subaru-outback",
    base: "suv",
    label: "wagon crossover",
    matches: ["subaruoutback", "volvov60"],
    overrides: {
      cameraZ: 6.85,
      body: [4.95, 0.62, 1.68],
      bodyPos: [0, 0.36, 0],
      hood: [1.18, 0.34, 1.44],
      hoodPos: [1.52, 0.76, 0],
      cabin: [2.72, 0.86, 1.42],
      cabinPos: [-0.38, 0.98, 0],
      rear: [0.92, 0.54, 1.38],
      rearPos: [-1.84, 0.82, 0],
      wheelFrontX: 1.54,
      wheelRearX: -1.68,
      wheelZ: 0.92,
      details: {
        style: "wagon crossover",
        grille: { height: 0.3, width: 1.08, y: 0.72, ribs: 3 },
        headlights: "angled",
        roofRails: true,
        longRoof: true,
        wheelArchScale: 0.98,
        hoodRidges: 1
      }
    }
  },
  {
    id: "tesla-model-3-y",
    base: "ev",
    label: "Tesla smooth-body EV",
    matches: ["teslamodel3", "teslamodely", "teslamodels", "teslamodelx", "rivian"],
    overrides: {
      cameraZ: 6.75,
      body: [4.58, 0.52, 1.62],
      hood: [1.04, 0.24, 1.34],
      hoodPos: [1.46, 0.6, 0],
      cabin: [2.28, 0.8, 1.3],
      cabinPos: [-0.24, 0.92, 0],
      rear: [1.02, 0.32, 1.32],
      rearPos: [-1.56, 0.62, 0],
      wheelFrontX: 1.56,
      wheelRearX: -1.56,
      wheelZ: 0.9,
      details: {
        style: "electric fastback",
        grille: { hidden: true },
        headlights: "thinbar",
        panoramicGlass: true,
        batterySkateboard: true,
        smoothNose: true,
        wheelArchScale: 0.98
      }
    }
  },
  {
    id: "honda-civic-accord",
    base: "sedan",
    label: "Honda sedan",
    matches: ["hondacivic", "hondaaccord"],
    overrides: {
      cameraZ: 6.45,
      body: [4.42, 0.48, 1.54],
      hood: [1.22, 0.32, 1.34],
      hoodPos: [1.5, 0.66, 0],
      cabin: [1.78, 0.7, 1.18],
      cabinPos: [-0.2, 0.88, 0],
      rear: [1.08, 0.32, 1.32],
      rearPos: [-1.52, 0.62, 0],
      wheelFrontX: 1.52,
      wheelRearX: -1.54,
      wheelZ: 0.84,
      details: {
        style: "compact sedan",
        grille: { height: 0.26, width: 1.08, y: 0.67, ribs: 2 },
        headlights: "thinbar",
        slopedRoof: true,
        wheelArchScale: 0.96,
        hoodRidges: 1
      }
    }
  },
  {
    id: "toyota-camry-corolla",
    base: "sedan",
    label: "Toyota sedan",
    matches: ["toyotacamry", "toyotacorolla", "lexuses", "lexusis"],
    overrides: {
      cameraZ: 6.5,
      body: [4.5, 0.5, 1.56],
      hood: [1.18, 0.34, 1.36],
      hoodPos: [1.48, 0.68, 0],
      cabin: [1.86, 0.72, 1.2],
      cabinPos: [-0.22, 0.9, 0],
      rear: [1.1, 0.34, 1.34],
      rearPos: [-1.54, 0.64, 0],
      wheelFrontX: 1.52,
      wheelRearX: -1.56,
      wheelZ: 0.85,
      details: {
        style: "midsize sedan",
        grille: { height: 0.32, width: 1.18, y: 0.68, ribs: 4 },
        headlights: "angled",
        slopedRoof: true,
        wheelArchScale: 0.98,
        hoodRidges: 2
      }
    }
  },
  {
    id: "mustang-camaro-sports",
    base: "coupe",
    label: "muscle or sports coupe",
    matches: ["fordmustang", "chevroletcamaro", "chevycamaro", "chevroletcorvette", "dodgechallenger", "dodgecharger", "mazdamiata", "toyotasupra", "subarubrz"],
    overrides: {
      cameraZ: 6.55,
      body: [4.6, 0.46, 1.62],
      hood: [1.58, 0.34, 1.42],
      hoodPos: [1.48, 0.64, 0],
      cabin: [1.22, 0.58, 1.14],
      cabinPos: [-0.42, 0.78, 0],
      rear: [1.18, 0.34, 1.38],
      rearPos: [-1.56, 0.58, 0],
      wheelFrontX: 1.56,
      wheelRearX: -1.62,
      wheelZ: 0.88,
      details: {
        style: "long-hood performance coupe",
        grille: { height: 0.3, width: 1.18, y: 0.64, ribs: 3 },
        headlights: "wide",
        slopedRoof: true,
        hoodRidges: 3,
        wheelArchScale: 1.0
      }
    }
  },
  {
    id: "minivan",
    base: "van",
    label: "minivan",
    matches: ["hondaodyssey", "toyotasienna", "chryslerpacifica", "dodgecaravan", "kiacarnival"],
    overrides: {
      cameraZ: 7.05,
      body: [5.05, 0.76, 1.82],
      hood: [0.92, 0.34, 1.52],
      hoodPos: [1.86, 0.82, 0],
      cabin: [3.2, 1.06, 1.54],
      cabinPos: [-0.34, 1.08, 0],
      rear: [0.88, 0.86, 1.52],
      rearPos: [-1.9, 1.0, 0],
      wheelFrontX: 1.62,
      wheelRearX: -1.72,
      wheelZ: 0.98,
      details: {
        style: "minivan",
        grille: { height: 0.32, width: 1.12, y: 0.78, ribs: 3 },
        headlights: "wide",
        slidingDoorTrack: true,
        longRoof: true,
        wheelArchScale: 0.98
      }
    }
  }
];

const hotspotColors = {
  engine: 0xff4f66,
  wheel: 0x8eb1ff,
  underbody: 0x4169e1,
  transmission: 0x8fc7ff,
  steering: 0xc084fc,
  cabin: 0xc7d2e1
};

const interactiveAreaPriority = {
  steering: 0,
  wheel: 0,
  transmission: 1,
  engine: 2,
  underbody: 3,
  cabin: 4
};

currentProfile = vehicleProfiles.sedan;

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, cloneValue(child)]));
  }
  return value;
}

function mergeProfile(base, overrides = {}) {
  const profile = cloneValue(base);
  Object.entries(overrides).forEach(([key, value]) => {
    if (
      value
      && typeof value === "object"
      && !Array.isArray(value)
      && profile[key]
      && typeof profile[key] === "object"
      && !Array.isArray(profile[key])
    ) {
      profile[key] = mergeProfile(profile[key], value);
    } else {
      profile[key] = cloneValue(value);
    }
  });
  return profile;
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
  const style = type.details?.style || type.name;
  return `${name} detailed ${style} blueprint${engine ? ` - ${engine}` : ""}`;
}

function profileTypeForText(text) {
  if (text.includes("f150") || text.includes("f250") || text.includes("f350") || text.includes("silverado") || text.includes("sierra") || text.includes("ram") || text.includes("tacoma") || text.includes("tundra") || text.includes("ranger") || text.includes("colorado") || text.includes("canyon") || text.includes("ridgeline") || text.includes("frontier") || text.includes("maverick")) {
    return "pickup";
  }
  if (text.includes("wrangler") || text.includes("bronco") || text.includes("explorer") || text.includes("escape") || text.includes("expedition") || text.includes("edge") || text.includes("rav4") || text.includes("4runner") || text.includes("highlander") || text.includes("crv") || text.includes("pilot") || text.includes("passport") || text.includes("rogue") || text.includes("pathfinder") || text.includes("murano") || text.includes("forester") || text.includes("outback") || text.includes("crosstrek") || text.includes("santafe") || text.includes("tucson") || text.includes("sorento") || text.includes("sportage") || text.includes("tahoe") || text.includes("suburban") || text.includes("yukon") || text.includes("terrain") || text.includes("acadia") || text.includes("x3") || text.includes("x5")) {
    return "suv";
  }
  if (text.includes("odyssey") || text.includes("sienna") || text.includes("pacifica") || text.includes("caravan") || text.includes("transit") || text.includes("sprinter")) {
    return "van";
  }
  if (text.includes("mustang") || text.includes("camaro") || text.includes("corvette") || text.includes("challenger") || text.includes("charger") || text.includes("miata") || text.includes("brz") || text.includes("86") || text.includes("supra")) {
    return "coupe";
  }
  if (text.includes("tesla") || text.includes("model3") || text.includes("modely") || text.includes("models") || text.includes("modelx") || text.includes("electric")) {
    return "ev";
  }
  return "sedan";
}

function classifyVehicle(vehicle) {
  const text = normalize(`${vehicle.make} ${vehicle.model} ${vehicle.fuel}`);
  const variant = modelSpecificProfiles.find((profile) => profile.matches.some((token) => text.includes(token)));
  const baseKey = variant?.base || profileTypeForText(text);
  const profile = mergeProfile(vehicleProfiles[baseKey] || vehicleProfiles.sedan, variant?.overrides || {});
  profile.key = variant?.id || baseKey;
  profile.name = variant?.label || profile.name;
  profile.baseType = baseKey;
  profile.details = {
    ...(profile.details || {}),
    modelKey: profile.key,
    selectedName: [vehicle.make, vehicle.model].filter(Boolean).join(" ")
  };
  return profile;
}

function normalizeInteractiveZones(profile) {
  if (profile.hotspots?.steering) {
    profile.hotspots.steering[2] = -Math.abs(profile.hotspots.steering[2] || 0.55);
  }
}

function paletteFor(vehicle) {
  return makePalettes[vehicle.make] || [0x4169e1, 0xc7d2e1];
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
  runtime.grid = new THREE.GridHelper(8, 18, 0x4169e1, 0x1b2747);
  runtime.grid.position.y = -0.22;
  runtime.grid.material.transparent = true;
  runtime.grid.material.opacity = 0.32;

  runtime.scene.add(runtime.grid);
  runtime.blueprintGroup.add(runtime.vehicleGroup);
  runtime.scene.add(runtime.blueprintGroup);
  runtime.scene.add(new THREE.AmbientLight(0x8eb1ff, 1.15));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.65);
  keyLight.position.set(3, 4, 5);
  runtime.scene.add(keyLight);

  const rimLight = new THREE.PointLight(0x4169e1, 2.1, 9);
  rimLight.position.set(-3, 2.5, -3);
  runtime.scene.add(rimLight);

  runtime.mode = "three";
  runtime.raycaster = new THREE.Raycaster();
  runtime.pointer = new THREE.Vector2();
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
  normalizeInteractiveZones(profile);
  const [primary, accent] = paletteFor(vehicle);
  const buildKey = `${profile.key || profile.name}:${primary}:${accent}:${runtime.mode}`;
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
  issueZones = {};

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
  const blueprintLine = new THREE.LineBasicMaterial({ color: 0xf6f1e8, transparent: true, opacity: 0.54 });
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
  addBox(profile.rear, profile.rearPos, profile.baseType === "pickup" ? bed : surface, edge);
  addWheels(profile, wheelMaterial, wheelEdge, accent);
  addCenterLine(profile, accent);
  addBlueprintDetails(profile, primary, accent, blueprintLine, edge, accentEdge);
  addIssueZones(profile);
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

function vehicleBounds(profile) {
  const sections = [
    [profile.body, profile.bodyPos],
    [profile.hood, profile.hoodPos],
    [profile.cabin, profile.cabinPos],
    [profile.rear, profile.rearPos]
  ];

  return sections.reduce((bounds, [size, position]) => {
    const [width, height, depth] = size;
    const [x, y, z] = position;
    return {
      frontX: Math.max(bounds.frontX, x + width / 2),
      rearX: Math.min(bounds.rearX, x - width / 2),
      roofY: Math.max(bounds.roofY, y + height / 2),
      sideZ: Math.max(bounds.sideZ, Math.abs(z) + depth / 2)
    };
  }, { frontX: -Infinity, rearX: Infinity, roofY: -Infinity, sideZ: 0 });
}

function addDetailPanel(size, position, color, opacity = 0.28, edgeColor = color, edgeOpacity = 0.72) {
  return addBox(
    size,
    position,
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false
    }),
    new THREE.LineBasicMaterial({
      color: edgeColor,
      transparent: true,
      opacity: edgeOpacity
    })
  );
}

function addLine(start, end, color = 0xf6f1e8, opacity = 0.55) {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ]);
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
  runtime.vehicleGroup.add(line);
  return line;
}

function addBlueprintDetails(profile, primary, accent) {
  const bounds = vehicleBounds(profile);
  const details = profile.details || {};
  addSideGlass(profile, bounds, accent);
  addGrille(profile, bounds, details, primary, accent);
  addHeadlights(profile, bounds, details, accent);
  addTaillights(profile, bounds);
  addHoodRidges(profile, details, primary);
  addWheelArches(profile, details, accent);
  addDimensionalLines(profile, bounds, primary, accent);

  if (details.roofRails || details.longRoof) addRoofRails(profile, bounds, accent);
  if (details.bedRails || profile.baseType === "pickup") addTruckBedDetails(profile, bounds, accent);
  if (details.rearLiftgate) addRearLiftgate(profile, bounds, accent);
  if (details.spareTire) addSpareTire(profile, bounds, accent);
  if (details.batterySkateboard) addBatterySkateboard(profile, bounds, accent);
  if (details.slidingDoorTrack) addSlidingDoorTrack(profile, bounds, accent);
  if (details.panoramicGlass) addPanoramicRoof(profile, bounds);
  if (details.towHooks) addTowHooks(bounds, accent);
}

function addSideGlass(profile, bounds, accent) {
  const glassZ = bounds.sideZ + 0.025;
  const glassY = profile.cabinPos[1] + profile.cabin[1] * 0.05;
  const glassHeight = Math.max(0.28, profile.cabin[1] * 0.42);
  const glassWidth = profile.cabin[0] * 0.86;

  [glassZ, -glassZ].forEach((z) => {
    addDetailPanel([glassWidth, glassHeight, 0.028], [profile.cabinPos[0], glassY, z], 0x9ee8ff, 0.2, accent, 0.68);
    const dividerCount = profile.cabin[0] > 2.2 ? 3 : 2;
    for (let index = 1; index < dividerCount; index += 1) {
      const x = profile.cabinPos[0] - glassWidth / 2 + (glassWidth / dividerCount) * index;
      addLine([x, glassY - glassHeight / 2, z + Math.sign(z) * 0.012], [x, glassY + glassHeight / 2, z + Math.sign(z) * 0.012], accent, 0.58);
    }
  });
}

function addGrille(profile, bounds, details, primary, accent) {
  const grille = details.grille || {};
  if (grille.hidden) {
    addLine([bounds.frontX + 0.04, profile.hoodPos[1], -profile.hood[2] * 0.34], [bounds.frontX + 0.04, profile.hoodPos[1], profile.hood[2] * 0.34], accent, 0.64);
    return;
  }

  const width = grille.width || Math.min(1.24, profile.hood[2] * 0.82);
  const height = grille.height || 0.34;
  const y = grille.y || profile.hoodPos[1] + 0.02;
  const frontX = bounds.frontX + 0.035;
  addDetailPanel([0.04, height, width], [frontX, y, 0], 0x0b0d0e, 0.34, accent, 0.92);

  const ribs = grille.ribs || 3;
  for (let index = 0; index < ribs; index += 1) {
    const z = width * -0.38 + (width * 0.76 / Math.max(1, ribs - 1)) * index;
    addDetailPanel([0.046, height * 0.82, 0.018], [frontX + 0.006, y, z], 0xf6f1e8, 0.22, primary, 0.42);
  }

  if (grille.crossbar || grille.blocky) {
    addDetailPanel([0.048, 0.045, width * 0.88], [frontX + 0.008, y, 0], accent, 0.36, accent, 0.72);
  }
}

function addHeadlights(profile, bounds, details, accent) {
  const frontX = bounds.frontX + 0.052;
  const zBase = Math.min(bounds.sideZ - 0.24, profile.hood[2] * 0.44);
  const y = profile.hoodPos[1] + profile.hood[1] * 0.12;
  const style = details.headlights || "wide";

  if (style === "round") {
    [-zBase, zBase].forEach((z) => addRoundLamp([frontX, y, z], 0xf6f1e8, 0.12));
    return;
  }

  if (style === "stacked" || style === "split") {
    [-zBase, zBase].forEach((z) => {
      const side = Math.sign(z);
      addDetailPanel([0.05, 0.11, 0.3], [frontX, y + 0.08, z], 0xf6f1e8, 0.38, accent, 0.7);
      addDetailPanel([0.05, 0.1, 0.28], [frontX, y - 0.08, z - side * 0.02], 0x9ee8ff, 0.26, accent, 0.58);
    });
    return;
  }

  const lampHeight = style === "thinbar" ? 0.07 : 0.12;
  const lampWidth = style === "angled" ? 0.4 : 0.34;
  [-zBase, zBase].forEach((z) => addDetailPanel([0.05, lampHeight, lampWidth], [frontX, y, z], 0xf6f1e8, 0.36, accent, 0.68));
}

function addRoundLamp(position, color, radius) {
  const lamp = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 0.055, 32),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.42 })
  );
  lamp.rotation.z = Math.PI / 2;
  lamp.position.set(...position);
  runtime.vehicleGroup.add(lamp);
}

function addTaillights(profile, bounds) {
  const rearX = bounds.rearX - 0.04;
  const zBase = bounds.sideZ - 0.2;
  const y = profile.rearPos[1] + profile.rear[1] * 0.1;
  [-zBase, zBase].forEach((z) => {
    addDetailPanel([0.045, 0.28, 0.1], [rearX, y, z], 0xf06f61, 0.42, 0xf06f61, 0.78);
  });
}

function addHoodRidges(profile, details, primary) {
  const count = details.hoodRidges || 0;
  if (!count) return;

  const y = profile.hoodPos[1] + profile.hood[1] / 2 + 0.018;
  const startX = profile.hoodPos[0] - profile.hood[0] / 2 + 0.1;
  const endX = profile.hoodPos[0] + profile.hood[0] / 2 - 0.1;

  for (let index = 0; index < count; index += 1) {
    const offset = count === 1 ? 0 : -0.32 + (0.64 / (count - 1)) * index;
    addLine([startX, y, offset], [endX, y, offset * 0.55], primary, 0.62);
  }
}

function addWheelArches(profile, details, accent) {
  const radius = 0.43 * (details.wheelArchScale || 1);
  const material = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.34 });
  [profile.wheelFrontX, profile.wheelRearX].forEach((x) => {
    [profile.wheelZ + 0.03, -profile.wheelZ - 0.03].forEach((z) => {
      const arch = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.015, 10, 56), material.clone());
      arch.position.set(x, 0.14, z);
      runtime.vehicleGroup.add(arch);
    });
  });
}

function addDimensionalLines(profile, bounds, primary, accent) {
  const y = -0.08;
  const z = bounds.sideZ + 0.28;
  addLine([bounds.rearX, y, z], [bounds.frontX, y, z], primary, 0.42);
  addLine([bounds.rearX, y - 0.06, z], [bounds.rearX, y + 0.16, z], primary, 0.38);
  addLine([bounds.frontX, y - 0.06, z], [bounds.frontX, y + 0.16, z], primary, 0.38);
  addLine([profile.wheelRearX, 0.12, 0.24], [profile.wheelFrontX, 0.12, 0.24], accent, 0.48);
  addLine([profile.wheelRearX, 0.12, -0.24], [profile.wheelFrontX, 0.12, -0.24], accent, 0.48);
}

function addRoofRails(profile, bounds, accent) {
  const y = bounds.roofY + 0.08;
  const frontX = profile.cabinPos[0] + profile.cabin[0] / 2 - 0.16;
  const rearX = Math.min(profile.cabinPos[0] - profile.cabin[0] / 2 + 0.16, profile.rearPos[0] + profile.rear[0] / 2 - 0.14);
  const railStart = Math.min(frontX, rearX);
  const railEnd = Math.max(frontX, rearX);

  [-bounds.sideZ * 0.58, bounds.sideZ * 0.58].forEach((z) => {
    addLine([railStart, y, z], [railEnd, y, z], accent, 0.72);
    addLine([railStart + 0.25, y, z], [railStart + 0.25, y - 0.16, z], accent, 0.48);
    addLine([railEnd - 0.25, y, z], [railEnd - 0.25, y - 0.16, z], accent, 0.48);
  });
}

function addTruckBedDetails(profile, bounds, accent) {
  const rearStart = profile.rearPos[0] - profile.rear[0] / 2;
  const rearEnd = profile.rearPos[0] + profile.rear[0] / 2;
  const topY = profile.rearPos[1] + profile.rear[1] / 2 + 0.04;
  const side = profile.rear[2] / 2 + 0.035;

  [-side, side].forEach((z) => addLine([rearStart, topY, z], [rearEnd, topY, z], accent, 0.78));
  addLine([rearStart, topY, -side], [rearStart, topY, side], accent, 0.58);
  addLine([rearEnd, topY, -side], [rearEnd, topY, side], accent, 0.58);
  addDetailPanel([0.04, profile.rear[1] * 0.64, profile.rear[2] * 0.86], [bounds.rearX - 0.015, profile.rearPos[1], 0], 0x0b0d0e, 0.16, accent, 0.72);
}

function addRearLiftgate(profile, bounds, accent) {
  const rearX = bounds.rearX - 0.02;
  const yTop = profile.rearPos[1] + profile.rear[1] * 0.38;
  addLine([rearX, yTop, -profile.rear[2] * 0.34], [rearX, yTop, profile.rear[2] * 0.34], accent, 0.62);
  addDetailPanel([0.035, 0.22, profile.rear[2] * 0.58], [rearX - 0.005, yTop - 0.28, 0], 0x9ee8ff, 0.12, accent, 0.48);
}

function addSpareTire(profile, bounds, accent) {
  const tire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.38, 0.18, 42),
    new THREE.MeshBasicMaterial({ color: 0x0b0d0e, transparent: true, opacity: 0.6 })
  );
  tire.rotation.z = Math.PI / 2;
  tire.position.set(bounds.rearX - 0.16, profile.rearPos[1] + 0.06, 0);
  const tireEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(tire.geometry),
    new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.72 })
  );
  tireEdges.rotation.copy(tire.rotation);
  tireEdges.position.copy(tire.position);
  runtime.vehicleGroup.add(tire, tireEdges);
}

function addBatterySkateboard(profile, bounds, accent) {
  addDetailPanel([profile.body[0] * 0.72, 0.08, profile.body[2] * 0.74], [profile.bodyPos[0] - 0.08, 0.12, 0], 0x8fc7ff, 0.2, accent, 0.66);
  addLine([bounds.rearX + 0.42, 0.18, -0.32], [bounds.frontX - 0.42, 0.18, -0.32], 0x8fc7ff, 0.56);
  addLine([bounds.rearX + 0.42, 0.18, 0.32], [bounds.frontX - 0.42, 0.18, 0.32], 0x8fc7ff, 0.56);
}

function addSlidingDoorTrack(profile, bounds, accent) {
  const y = profile.cabinPos[1] + profile.cabin[1] * 0.08;
  [bounds.sideZ + 0.035, -bounds.sideZ - 0.035].forEach((z) => {
    addLine([profile.cabinPos[0] - profile.cabin[0] * 0.36, y, z], [profile.cabinPos[0] + profile.cabin[0] * 0.42, y, z], accent, 0.64);
  });
}

function addPanoramicRoof(profile, bounds) {
  addDetailPanel([profile.cabin[0] * 0.7, 0.035, profile.cabin[2] * 0.62], [profile.cabinPos[0], bounds.roofY + 0.02, 0], 0x9ee8ff, 0.16, 0x9ee8ff, 0.46);
}

function addTowHooks(bounds, accent) {
  const frontX = bounds.frontX + 0.07;
  [-0.32, 0.32].forEach((z) => addDetailPanel([0.05, 0.07, 0.12], [frontX, 0.42, z], accent, 0.42, accent, 0.8));
}

function addWheels(profile, wheelMaterial, edgeMaterial, accent) {
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
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.38, 28),
      new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.42 })
    );
    hub.rotation.x = Math.PI / 2;
    hub.position.set(...position);
    runtime.vehicleGroup.add(wheel, wheelEdges, hub);
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

function addIssueZones(profile) {
  const bounds = vehicleBounds(profile);
  addIssueZone("engine", [[
    [profile.hood[0] * 0.9, profile.hood[1] + 0.28, profile.hood[2] * 0.92],
    [profile.hoodPos[0], profile.hoodPos[1] + 0.1, 0]
  ]]);
  addIssueZone("wheel", [
    [[0.86, 0.76, 0.32], [profile.wheelFrontX, 0.22, profile.wheelZ + 0.02]],
    [[0.86, 0.76, 0.32], [profile.wheelFrontX, 0.22, -profile.wheelZ - 0.02]],
    [[0.86, 0.76, 0.32], [profile.wheelRearX, 0.22, profile.wheelZ + 0.02]],
    [[0.86, 0.76, 0.32], [profile.wheelRearX, 0.22, -profile.wheelZ - 0.02]]
  ]);
  addIssueZone("underbody", [[
    [profile.body[0] * 0.82, 0.16, profile.body[2] * 0.84],
    [profile.bodyPos[0], 0.16, 0]
  ]]);
  addIssueZone("transmission", [[
    [0.88, 0.34, profile.body[2] * 0.46],
    [profile.hotspots.transmission?.[0] || 0.25, 0.42, 0]
  ]]);
  addIssueZone("steering", [[
    [0.78, 0.68, 0.88],
    [profile.hotspots.steering?.[0] || 0.7, profile.hotspots.steering?.[1] || 0.95, -bounds.sideZ * 0.55]
  ]]);
  addIssueZone("cabin", [[
    [profile.cabin[0] * 0.92, profile.cabin[1] * 0.86, profile.cabin[2] * 0.9],
    profile.cabinPos
  ]]);
}

function addIssueZone(area, specs) {
  const color = hotspotColors[area] || 0xf0c35f;
  const group = new THREE.Group();
  const items = specs.map(([size, position]) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(...size),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.012,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.08 })
    );
    mesh.position.set(...position);
    mesh.userData.blueprintArea = area;
    edges.position.copy(mesh.position);
    group.add(mesh, edges);
    return { mesh, edges };
  });
  runtime.vehicleGroup.add(group);
  issueZones[area] = { group, items };
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
    glow.userData.blueprintArea = area;
    ring.userData.blueprintArea = area;
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

    Object.entries(issueZones).forEach(([key, zone]) => {
      const isActive = key === activeArea;
      zone.items.forEach(({ mesh, edges }) => {
        mesh.material.opacity = isActive ? 0.18 : 0.012;
        edges.material.opacity = isActive ? 0.92 : 0.08;
      });
    });
  }

  hotspotButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.blueprintArea === activeArea));
  });
  drawFallback();
}

function selectArea(area) {
  if (!currentProfile.hotspots[area]) return;
  setActiveArea(area);
  window.dispatchEvent(new CustomEvent("torquetune:blueprint-select", { detail: { area } }));
}

function selectAreaFromPointer(event) {
  const area = runtime.mode === "three"
    ? areaFromThreePointer(event)
    : areaFromFallbackPointer(event);
  if (area) selectArea(area);
}

function areaFromThreePointer(event) {
  if (!runtime.raycaster || !runtime.pointer || !runtime.camera) return "";

  const rect = canvas.getBoundingClientRect();
  runtime.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  runtime.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  runtime.raycaster.setFromCamera(runtime.pointer, runtime.camera);
  runtime.scene.updateMatrixWorld(true);

  const interactiveObjects = [];
  Object.values(issueZones).forEach((zone) => {
    zone.items.forEach(({ mesh }) => interactiveObjects.push(mesh));
  });
  Object.values(hotspots).forEach((hotspot) => {
    interactiveObjects.push(hotspot.glow, hotspot.ring);
  });

  const hit = runtime.raycaster
    .intersectObjects(interactiveObjects, false)
    .filter((intersection) => intersection.object.userData.blueprintArea)
    .sort((a, b) => {
      const areaA = a.object.userData.blueprintArea;
      const areaB = b.object.userData.blueprintArea;
      const priorityA = interactiveAreaPriority[areaA] ?? 10;
      const priorityB = interactiveAreaPriority[areaB] ?? 10;
      return priorityA === priorityB ? a.distance - b.distance : priorityA - priorityB;
    })[0];

  return hit?.object.userData.blueprintArea || "";
}

function areaFromFallbackPointer(event) {
  const rect = canvas.getBoundingClientRect();
  const pointer = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
  let closest = { area: "", distance: Infinity };

  Object.entries(currentProfile.hotspots).forEach(([area, position]) => {
    const point = projectPoint(position);
    const distance = Math.hypot(point.x - pointer.x, point.y - pointer.y);
    if (distance < closest.distance) closest = { area, distance };
  });

  return closest.distance < 58 ? closest.area : "";
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
    const activeZone = issueZones[activeArea];
    if (activeZone) {
      const opacity = 0.14 + Math.sin(time * 0.006) * 0.04;
      activeZone.items.forEach(({ mesh }) => {
        mesh.material.opacity = Math.max(0.08, opacity);
      });
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
  drawFallbackBox(currentProfile.body, currentProfile.bodyPos, primaryCss, "rgba(65, 105, 225, 0.12)");
  drawFallbackBox(currentProfile.hood, currentProfile.hoodPos, primaryCss, "rgba(240, 111, 97, 0.12)");
  drawFallbackBox(currentProfile.cabin, currentProfile.cabinPos, "#9ee8ff", "rgba(158, 232, 255, 0.1)");
  drawFallbackBox(currentProfile.rear, currentProfile.rearPos, accentCss, "rgba(199, 210, 225, 0.1)");
  drawFallbackWheels(currentProfile);
  drawFallbackDetails(currentProfile, primaryCss, accentCss);
  drawFallbackHotspots(time);
}

function drawFallbackGrid(width, height) {
  fallbackContext.save();
  fallbackContext.strokeStyle = "rgba(65, 105, 225, 0.14)";
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
    fallbackContext.strokeStyle = "rgba(199, 210, 225, 0.76)";
    fallbackContext.lineWidth = 2;
    fallbackContext.fill();
    fallbackContext.stroke();
  });
  fallbackContext.restore();
}

function drawFallbackDetails(profile, primaryCss, accentCss) {
  const bounds = vehicleBounds(profile);
  const details = profile.details || {};
  const frontX = bounds.frontX + 0.04;
  const rearX = bounds.rearX - 0.04;
  const sideZ = bounds.sideZ + 0.05;
  const grille = details.grille || {};

  fallbackContext.save();
  fallbackContext.lineWidth = 2;
  fallbackContext.strokeStyle = accentCss;
  fallbackContext.fillStyle = "rgba(199, 210, 225, 0.18)";

  if (!grille.hidden) {
    drawFallbackRect([frontX, grille.y || profile.hoodPos[1], 0], 28, Math.max(16, (grille.height || 0.34) * 38), accentCss);
    for (let index = 0; index < (grille.ribs || 3); index += 1) {
      const z = (grille.width || 1.1) * -0.36 + ((grille.width || 1.1) * 0.72 / Math.max(1, (grille.ribs || 3) - 1)) * index;
      drawFallbackLine([frontX, (grille.y || profile.hoodPos[1]) - 0.16, z], [frontX, (grille.y || profile.hoodPos[1]) + 0.16, z], primaryCss, 1.5);
    }
  }

  [-sideZ, sideZ].forEach((z) => {
    drawFallbackLine([profile.cabinPos[0] - profile.cabin[0] * 0.42, profile.cabinPos[1] + 0.08, z], [profile.cabinPos[0] + profile.cabin[0] * 0.42, profile.cabinPos[1] + 0.08, z], "#9ee8ff", 2);
    drawFallbackLine([profile.wheelRearX, 0.5, z], [profile.wheelFrontX, 0.5, z], accentCss, 1.5);
  });

  [-profile.wheelZ, profile.wheelZ].forEach((z) => {
    [profile.wheelFrontX, profile.wheelRearX].forEach((x) => {
      const point = projectPoint([x, 0.16, z]);
      fallbackContext.beginPath();
      fallbackContext.arc(point.x, point.y, 26 * point.scale * (details.wheelArchScale || 1), 0, Math.PI * 2);
      fallbackContext.strokeStyle = accentCss;
      fallbackContext.globalAlpha = 0.5;
      fallbackContext.stroke();
      fallbackContext.globalAlpha = 1;
    });
  });

  if (details.roofRails || details.longRoof) {
    const railStart = Math.min(profile.cabinPos[0] + profile.cabin[0] / 2 - 0.16, profile.cabinPos[0] - profile.cabin[0] / 2 + 0.16);
    const railEnd = Math.max(profile.cabinPos[0] + profile.cabin[0] / 2 - 0.16, profile.cabinPos[0] - profile.cabin[0] / 2 + 0.16);
    [-bounds.sideZ * 0.55, bounds.sideZ * 0.55].forEach((z) => {
      drawFallbackLine([railStart, bounds.roofY + 0.08, z], [railEnd, bounds.roofY + 0.08, z], accentCss, 2);
    });
  }

  if (details.bedRails || profile.baseType === "pickup") {
    const topY = profile.rearPos[1] + profile.rear[1] / 2 + 0.04;
    [-profile.rear[2] / 2, profile.rear[2] / 2].forEach((z) => {
      drawFallbackLine([profile.rearPos[0] - profile.rear[0] / 2, topY, z], [profile.rearPos[0] + profile.rear[0] / 2, topY, z], accentCss, 2);
    });
  }

  if (details.spareTire) {
    const point = projectPoint([rearX - 0.14, profile.rearPos[1] + 0.06, 0]);
    fallbackContext.beginPath();
    fallbackContext.ellipse(point.x, point.y, 22 * point.scale, 28 * point.scale, 0, 0, Math.PI * 2);
    fallbackContext.fillStyle = "rgba(6, 8, 9, 0.72)";
    fallbackContext.strokeStyle = accentCss;
    fallbackContext.fill();
    fallbackContext.stroke();
  }

  if (details.batterySkateboard) {
    drawFallbackRect([profile.bodyPos[0], 0.13, 0], 120, 14, "#8fc7ff");
  }

  drawFallbackLine([rearX, -0.08, sideZ + 0.2], [frontX, -0.08, sideZ + 0.2], primaryCss, 1.5);
  fallbackContext.restore();
}

function drawFallbackLine(start, end, color, width = 2) {
  const a = projectPoint(start);
  const b = projectPoint(end);
  fallbackContext.save();
  fallbackContext.strokeStyle = color;
  fallbackContext.lineWidth = width;
  fallbackContext.beginPath();
  fallbackContext.moveTo(a.x, a.y);
  fallbackContext.lineTo(b.x, b.y);
  fallbackContext.stroke();
  fallbackContext.restore();
}

function drawFallbackRect(center, width, height, stroke) {
  const point = projectPoint(center);
  fallbackContext.save();
  fallbackContext.strokeStyle = stroke;
  fallbackContext.fillStyle = "rgba(199, 210, 225, 0.12)";
  fallbackContext.lineWidth = 2;
  fallbackContext.beginPath();
  fallbackContext.rect(point.x - width / 2 * point.scale, point.y - height / 2 * point.scale, width * point.scale, height * point.scale);
  fallbackContext.fill();
  fallbackContext.stroke();
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
  pointerStart = { x: event.clientX, y: event.clientY, time: performance.now() };
  pointerMoved = false;
  canvas.classList.add("is-dragging");
  canvas.setPointerCapture?.(event.pointerId);
}

function onPointerMove(event) {
  if (!isDragging) return;
  const dx = event.clientX - lastPointer.x;
  const dy = event.clientY - lastPointer.y;
  const totalDx = event.clientX - pointerStart.x;
  const totalDy = event.clientY - pointerStart.y;
  if (Math.hypot(totalDx, totalDy) > 7) pointerMoved = true;
  rotationY += dx * 0.008;
  rotationX = Math.max(-0.32, Math.min(0.52, rotationX + dy * 0.006));
  lastPointer = { x: event.clientX, y: event.clientY };
  drawFallback();
}

function onPointerUp(event) {
  const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
  const elapsed = performance.now() - pointerStart.time;
  const shouldSelect = !pointerMoved && distance < 8 && elapsed < 650;
  isDragging = false;
  canvas.classList.remove("is-dragging");
  canvas.releasePointerCapture?.(event.pointerId);
  if (shouldSelect) selectAreaFromPointer(event);
}

function onPointerCancel(event) {
  isDragging = false;
  pointerMoved = false;
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
      selectArea(area);
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
  canvas.addEventListener("pointercancel", onPointerCancel);
  canvas.addEventListener("pointerleave", onPointerCancel);

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
