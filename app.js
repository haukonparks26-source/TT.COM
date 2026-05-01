const recordButton = document.querySelector("#recordButton");
const recordLabel = document.querySelector("#recordLabel");
const resetButton = document.querySelector("#resetButton");
const statusText = document.querySelector("#statusText");
const vehicleYearSelect = document.querySelector("#vehicleYearSelect");
const vehicleMakeSelect = document.querySelector("#vehicleMakeSelect");
const vehicleModelInput = document.querySelector("#vehicleModelInput");
const modelSuggestions = document.querySelector("#modelSuggestions");
const engineFuelSelect = document.querySelector("#engineFuelSelect");
const engineSpecInput = document.querySelector("#engineSpecInput");
const engineAspirationSelect = document.querySelector("#engineAspirationSelect");
const drivetrainSelect = document.querySelector("#drivetrainSelect");
const mileageInput = document.querySelector("#mileageInput");
const vinInput = document.querySelector("#vinInput");
const vinLookupButton = document.querySelector("#vinLookupButton");
const vinStatus = document.querySelector("#vinStatus");
const customerNameInput = document.querySelector("#customerNameInput");
const customerContactInput = document.querySelector("#customerContactInput");
const vehicleBadgePlate = document.querySelector("#vehicleBadgePlate");
const vehicleBadgeDot = document.querySelector("#vehicleBadgeDot");
const vehicleBadgeMake = document.querySelector("#vehicleBadgeMake");
const vehicleBadgeModel = document.querySelector("#vehicleBadgeModel");
const symptomCategorySelect = document.querySelector("#symptomCategorySelect");
const sourceSelect = document.querySelector("#sourceSelect");
const conditionSelect = document.querySelector("#conditionSelect");
const audioUpload = document.querySelector("#audioUpload");
const mechanicNoteInput = document.querySelector("#mechanicNoteInput");
const mediaUpload = document.querySelector("#mediaUpload");
const mediaFileName = document.querySelector("#mediaFileName");
const damagePhotoInput = document.querySelector("#damagePhotoInput");
const damageAreaSelect = document.querySelector("#damageAreaSelect");
const damageDescriptionInput = document.querySelector("#damageDescriptionInput");
const damagePreview = document.querySelector("#damagePreview");
const damageAssessment = document.querySelector("#damageAssessment");
const replacementLinks = document.querySelector("#replacementLinks");
const partsVehicleSummary = document.querySelector("#partsVehicleSummary");
const manualVehicleSummary = document.querySelector("#manualVehicleSummary");
const manualLinks = document.querySelector("#manualLinks");
const refreshManualButton = document.querySelector("#refreshManualButton");
const canvas = document.querySelector("#waveCanvas");
const ctx = canvas.getContext("2d");
const resultTitle = document.querySelector("#resultTitle");
const resultSummary = document.querySelector("#resultSummary");
const confidenceBadge = document.querySelector("#confidenceBadge");
const rattleMeter = document.querySelector("#rattleMeter");
const squealMeter = document.querySelector("#squealMeter");
const knockMeter = document.querySelector("#knockMeter");
const stepsList = document.querySelector("#stepsList");
const matchList = document.querySelector("#matchList");
const vehicleIssuesNote = document.querySelector("#vehicleIssuesNote");
const vehicleIssueList = document.querySelector("#vehicleIssueList");
const recordingList = document.querySelector("#recordingList");
const recordingsNote = document.querySelector("#recordingsNote");
const mechanicDashboard = document.querySelector("#mechanicDashboard");
const exportAllReportButton = document.querySelector("#exportAllReportButton");

let audioContext;
let analyser;
let mediaStream;
let mediaRecorder;
let recordingChunks = [];
let pendingRecordingDiagnosis;
let recordingUrls = [];
let pendingMediaFile = null;
let animationId;
let listeningStartedAt = 0;

const recordingsDbName = "torquetune-recordings";
const recordingsStoreName = "recordings";
const vehicleStorageKey = "torquetune.vehicle.v1";
const customerStorageKey = "torquetune.customer.v1";

const blueprintSourceAreas = {
  unknown: "engine",
  engine: "engine",
  wheel: "wheel",
  underbody: "underbody",
  transmission: "transmission",
  steering: "steering",
  cabin: "cabin"
};
const blueprintDiagnosticAreas = ["engine", "wheel", "underbody", "transmission", "steering", "cabin"];

const makeBadges = {
  Acura: { mark: "A", color: "#d8dce6", accent: "#111827" },
  Audi: { mark: "AUDI", color: "#eef2f7", accent: "#b91c1c" },
  BMW: { mark: "BMW", color: "#eaf3ff", accent: "#2f80ed" },
  Buick: { mark: "B", color: "#f1f5f9", accent: "#9f1239" },
  Cadillac: { mark: "CAD", color: "#f8e8a8", accent: "#5b21b6" },
  Chevrolet: { mark: "CHEVY", color: "#f2c94c", accent: "#2d2a26" },
  Chrysler: { mark: "C", color: "#cfe8ff", accent: "#1f4f7a" },
  Dodge: { mark: "DODGE", color: "#ef4444", accent: "#111111" },
  Ford: { mark: "FORD", color: "#2f80ed", accent: "#ffffff" },
  GMC: { mark: "GMC", color: "#c81e1e", accent: "#ffffff" },
  Honda: { mark: "H", color: "#f4f4f5", accent: "#dc2626" },
  Hyundai: { mark: "HYN", color: "#dbeafe", accent: "#1d4ed8" },
  Infiniti: { mark: "INF", color: "#e5e7eb", accent: "#111827" },
  Jeep: { mark: "JEEP", color: "#5f6f52", accent: "#f6f1e8" },
  Kia: { mark: "KIA", color: "#f4f4f5", accent: "#991b1b" },
  Lexus: { mark: "LEX", color: "#e5e7eb", accent: "#111827" },
  Mazda: { mark: "M", color: "#e5e7eb", accent: "#1f2937" },
  "Mercedes-Benz": { mark: "MB", color: "#f8fafc", accent: "#111827" },
  Nissan: { mark: "NIS", color: "#e5e7eb", accent: "#b91c1c" },
  Ram: { mark: "RAM", color: "#111827", accent: "#f6f1e8" },
  Subaru: { mark: "SUB", color: "#1d4ed8", accent: "#ffffff" },
  Tesla: { mark: "TESLA", color: "#ef4444", accent: "#ffffff" },
  Toyota: { mark: "TOY", color: "#f4f4f5", accent: "#dc2626" },
  Volkswagen: { mark: "VW", color: "#dbeafe", accent: "#1d4ed8" },
  Volvo: { mark: "VOLVO", color: "#dbeafe", accent: "#111827" },
  Other: { mark: "CAR", color: "#58c4a6", accent: "#101314" }
};

const vehicleModelCatalog = {
  Acura: ["Integra", "ILX", "TLX", "RLX", "RDX", "MDX", "NSX"],
  "Alfa Romeo": ["Giulia", "Stelvio", "Tonale", "4C"],
  Audi: ["A3", "A4", "A5", "A6", "A7", "A8", "Q3", "Q5", "Q7", "Q8", "e-tron"],
  BMW: ["2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X7", "i4", "iX"],
  Buick: ["Encore", "Envision", "Enclave", "Regal", "LaCrosse"],
  Cadillac: ["ATS", "CTS", "CT4", "CT5", "XT4", "XT5", "XT6", "Escalade"],
  Chevrolet: ["Camaro", "Corvette", "Cruze", "Equinox", "Impala", "Malibu", "Silverado", "Suburban", "Tahoe", "Trailblazer", "Traverse"],
  Chrysler: ["200", "300", "Pacifica", "Town & Country", "Voyager"],
  Dodge: ["Challenger", "Charger", "Durango", "Grand Caravan", "Journey"],
  Ford: ["Bronco", "Edge", "Escape", "Expedition", "Explorer", "F-150", "F-250", "F-350", "Focus", "Fusion", "Maverick", "Mustang", "Ranger", "Transit"],
  Genesis: ["G70", "G80", "G90", "GV60", "GV70", "GV80"],
  GMC: ["Acadia", "Canyon", "Sierra", "Terrain", "Yukon"],
  Honda: ["Accord", "Civic", "CR-V", "Fit", "HR-V", "Odyssey", "Passport", "Pilot", "Ridgeline"],
  Hyundai: ["Accent", "Elantra", "Ioniq 5", "Kona", "Palisade", "Santa Fe", "Sonata", "Tucson", "Venue"],
  Infiniti: ["Q50", "Q60", "QX50", "QX55", "QX60", "QX80"],
  Jeep: ["Cherokee", "Compass", "Gladiator", "Grand Cherokee", "Renegade", "Wagoneer", "Wrangler"],
  Kia: ["Forte", "K5", "Niro", "Optima", "Rio", "Sorento", "Soul", "Sportage", "Telluride"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"],
  Lexus: ["ES", "GS", "GX", "IS", "LS", "LX", "NX", "RX", "UX"],
  Lincoln: ["Aviator", "Corsair", "MKC", "MKX", "MKZ", "Nautilus", "Navigator"],
  Mazda: ["Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-50", "CX-9", "MX-5 Miata"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "CLA", "GLA", "GLC", "GLE", "GLS", "Sprinter"],
  Mini: ["Cooper", "Clubman", "Countryman", "Paceman"],
  Mitsubishi: ["Eclipse Cross", "Lancer", "Mirage", "Outlander", "Outlander Sport"],
  Nissan: ["Altima", "Frontier", "Maxima", "Murano", "Pathfinder", "Rogue", "Sentra", "Titan", "Versa"],
  Porsche: ["718", "911", "Cayenne", "Macan", "Panamera", "Taycan"],
  Ram: ["1500", "2500", "3500", "ProMaster"],
  Rivian: ["R1S", "R1T", "EDV"],
  Subaru: ["Ascent", "BRZ", "Crosstrek", "Forester", "Impreza", "Legacy", "Outback", "WRX"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y", "Cybertruck"],
  Toyota: ["4Runner", "Avalon", "Camry", "Corolla", "Highlander", "Prius", "RAV4", "Sequoia", "Sienna", "Tacoma", "Tundra"],
  Volkswagen: ["Atlas", "Golf", "GTI", "Jetta", "Passat", "Taos", "Tiguan"],
  Volvo: ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"]
};

const manualPortalHosts = {
  Acura: "owners.acura.com",
  "Alfa Romeo": "alfaromeousa.com",
  Audi: "ownersmanual.audiusa.com",
  BMW: "bmwusa.com",
  Buick: "buick.com",
  Cadillac: "cadillac.com",
  Chevrolet: "chevrolet.com",
  Chrysler: "mopar.com",
  Dodge: "mopar.com",
  Ford: "ford.com",
  Genesis: "genesis.com",
  GMC: "gmc.com",
  Honda: "owners.honda.com",
  Hyundai: "hyundaiusa.com",
  Infiniti: "infinitiusa.com",
  Jeep: "mopar.com",
  Kia: "owners.kia.com",
  "Land Rover": "landroverusa.com",
  Lexus: "lexus.com",
  Lincoln: "lincoln.com",
  Mazda: "mazdausa.com",
  "Mercedes-Benz": "mbusa.com",
  Mini: "miniusa.com",
  Mitsubishi: "mitsubishicars.com",
  Nissan: "nissanusa.com",
  Porsche: "porsche.com",
  Ram: "mopar.com",
  Rivian: "rivian.com",
  Subaru: "subaru.com",
  Tesla: "tesla.com",
  Toyota: "toyota.com",
  Volkswagen: "vw.com",
  Volvo: "volvocars.com"
};

const damageAreaKeywords = [
  ["headlight assembly", ["headlight", "lamp", "lens"]],
  ["tail light assembly", ["taillight", "tail light", "brake light"]],
  ["bumper cover", ["bumper", "cover", "fascia"]],
  ["mirror assembly", ["mirror", "glass"]],
  ["wheel rim", ["rim", "wheel", "curb"]],
  ["tire", ["tire", "sidewall", "nail"]],
  ["radiator", ["radiator", "coolant", "leak"]],
  ["exhaust pipe muffler", ["exhaust", "muffler", "pipe"]],
  ["brake pads rotors", ["brake", "rotor", "pad", "caliper"]],
  ["control arm suspension", ["control arm", "suspension", "ball joint", "strut"]],
  ["serpentine belt", ["belt", "pulley", "tensioner"]]
];

const commonVehicleIssueRules = [
  {
    make: "Toyota",
    models: ["Camry"],
    years: [2007, 2011],
    issues: [
      ["Engine oil consumption", "Watch oil level, blue smoke, ticking, or low oil pressure warnings."],
      ["Water pump seepage", "Look for coolant smell, drips, overheating, or bearing whine."],
      ["Struts and mounts", "Listen for front clunks over bumps or uneven tire wear."]
    ]
  },
  {
    make: "Toyota",
    models: ["Camry", "RAV4", "Corolla"],
    years: [2012, 2018],
    issues: [
      ["Torque converter or shift shudder", "Notice vibration or shudder during light acceleration."],
      ["Door lock actuator wear", "Listen for weak clicking or failed lock movement."],
      ["Brake and tire wear", "Check for squeal, vibration, or uneven tread."]
    ]
  },
  {
    make: "Honda",
    models: ["Civic", "Accord", "CR-V"],
    years: [2006, 2015],
    issues: [
      ["VTC actuator rattle", "A brief cold-start rattle can come from the cam timing actuator."],
      ["Engine mounts", "Look for vibration at idle, thuds shifting into gear, or clunks."],
      ["AC compressor or clutch", "Listen for clicking, grinding, or weak cooling."]
    ]
  },
  {
    make: "Honda",
    models: ["Civic", "Accord", "CR-V"],
    years: [2016, 2024],
    issues: [
      ["AC condenser/compressor concerns", "Weak cooling, hiss, or clutch cycling can point to AC issues."],
      ["Fuel dilution or rough idle checks", "Watch oil smell, rising oil level, rough idle, and cold-start behavior."],
      ["CVT or shift behavior", "Listen for whine, hesitation, or shudder under acceleration."]
    ]
  },
  {
    make: "Ford",
    models: ["F-150", "F150", "Explorer", "Escape"],
    years: [2011, 2017],
    issues: [
      ["EcoBoost timing chain or phaser rattle", "Cold-start rattle or ticking deserves timing-system inspection."],
      ["Turbo, intake, or vacuum leaks", "Hissing or loss of power under boost can point to leaks."],
      ["Transmission hard shifts", "Thuds, delayed shifts, or shudder should be scanned."]
    ]
  },
  {
    make: "Ford",
    models: ["F-150", "F150", "Mustang", "Explorer"],
    years: [2018, 2024],
    issues: [
      ["10-speed transmission shift complaints", "Hard, delayed, or clunky shifts should be logged by gear and temperature."],
      ["Cam phaser or timing noise", "Cold-start rattle from the front of the engine is important."],
      ["Wheel/tire vibration", "Speed-specific vibration can be tires, wheels, or driveline."]
    ]
  },
  {
    make: "Chevrolet",
    models: ["Silverado", "Tahoe", "Suburban", "Equinox", "Malibu"],
    years: [2007, 2020],
    issues: [
      ["AFM/DFM lifter noise", "Ticking, misfires, or rough running can point to valvetrain issues."],
      ["Transmission shudder or hard shifts", "Watch for shudder during light acceleration or shift thuds."],
      ["Evap and sensor faults", "Check engine lights may appear without obvious sound."]
    ]
  },
  {
    make: "GMC",
    models: ["Sierra", "Yukon", "Terrain", "Acadia"],
    years: [2007, 2020],
    issues: [
      ["Lifter or valvetrain tick", "Ticking with misfires or rough running deserves quick attention."],
      ["Transmission shudder", "Record whether it happens warm, cold, or in a specific gear."],
      ["Steering or suspension clunks", "Listen over bumps and during low-speed turns."]
    ]
  },
  {
    make: "Nissan",
    models: ["Altima", "Rogue", "Sentra", "Murano", "Pathfinder"],
    years: [2007, 2022],
    issues: [
      ["CVT whine or shudder", "Whine, hesitation, or slipping under acceleration can point to CVT trouble."],
      ["Motor mounts", "Thuds shifting into gear or idle vibration are common clues."],
      ["MAF or sensor drivability issues", "Rough idle, stalling, or poor acceleration may need scan data."]
    ]
  },
  {
    make: "Hyundai",
    models: ["Sonata", "Elantra", "Santa Fe", "Tucson"],
    years: [2011, 2021],
    issues: [
      ["Engine knocking or oil consumption", "Knock, ticking, or low oil level should be checked immediately."],
      ["Starter/charging issues", "Clicking or no-start can be battery, starter, or alternator related."],
      ["Suspension and steering noises", "Listen for clunks over bumps or steering vibration."]
    ]
  },
  {
    make: "Kia",
    models: ["Optima", "Soul", "Sorento", "Sportage", "Forte"],
    years: [2011, 2021],
    issues: [
      ["Engine knock or oil consumption", "Do not ignore metallic ticking or knock from the engine bay."],
      ["Catalytic converter or exhaust restriction", "Loss of power, rattles, or sulfur smell can be clues."],
      ["Door/window electrical issues", "Clicking, weak motors, or intermittent switches should be checked."]
    ]
  },
  {
    make: "Jeep",
    models: ["Wrangler", "Grand Cherokee", "Cherokee", "Compass"],
    years: [2007, 2024],
    issues: [
      ["Steering shimmy or vibration", "Steering wheel shake can come from tires, alignment, joints, or track bar wear."],
      ["Cooling system leaks", "Watch for overheating, coolant smell, or radiator seepage."],
      ["Transfer case or driveline clunks", "Thuds during shifting or takeoff need driveline inspection."]
    ]
  },
  {
    make: "Subaru",
    models: ["Outback", "Forester", "Impreza", "Crosstrek", "Legacy"],
    years: [2005, 2024],
    issues: [
      ["Wheel bearing hum", "A speed-related hum that changes when turning often points to a bearing."],
      ["CVT whine or shudder", "Whine, hesitation, or shudder should be checked with fluid and scan data."],
      ["Oil or coolant leaks on older models", "Look for smells, drips, smoke, or low fluid levels."]
    ]
  },
  {
    make: "BMW",
    models: ["3 Series", "5 Series", "X3", "X5"],
    years: [2006, 2022],
    issues: [
      ["Oil leaks", "Valve cover and oil filter housing leaks can cause burning-oil smell or smoke."],
      ["Electric water pump or cooling faults", "Overheating warnings, fan roar, or coolant leaks are urgent."],
      ["Coils and misfires", "Rough idle or flashing check engine light often needs ignition diagnosis."]
    ]
  },
  {
    make: "Mercedes-Benz",
    models: ["C-Class", "E-Class", "GLC", "GLE"],
    years: [2008, 2023],
    issues: [
      ["Oil leaks and PCV issues", "Hissing, rough idle, or oil smell can point to intake/PCV or gasket problems."],
      ["Suspension bushings", "Clunks and steering vibration are common inspection points."],
      ["Sensor and module faults", "Warning lights often need full module scanning."]
    ]
  },
  {
    make: "Tesla",
    models: ["Model 3", "Model Y", "Model S", "Model X"],
    years: [2016, 2026],
    issues: [
      ["Control arm or suspension creak", "Creaking over bumps or turning can point to suspension joints."],
      ["Tire wear and road noise", "EV torque and weight can accelerate tire wear and hum."],
      ["HVAC heat pump or fan noise", "Buzzing, whine, or weak heating/cooling should be checked."]
    ]
  }
];

commonVehicleIssueRules.push(
  {
    make: "Audi",
    models: ["A4", "A6", "Q5", "Q7"],
    years: [2008, 2024],
    issues: [
      ["Oil leaks and PCV faults", "Whistling, rough idle, or oil smell can come from PCV and gasket issues."],
      ["Timing chain/tensioner noise", "Rattle from the front of the engine deserves quick inspection."],
      ["Suspension control arm wear", "Clunks over bumps and uneven tire wear are common checks."]
    ]
  },
  {
    make: "Mazda",
    models: ["Mazda3", "Mazda6", "CX-5", "CX-9"],
    years: [2010, 2024],
    issues: [
      ["Belt tensioner seepage or chirp", "Look for belt chirp, pulley noise, or hydraulic tensioner leaks."],
      ["Motor mounts", "Idle vibration or thuds shifting into gear can point to mount wear."],
      ["Brake and wheel bearing noise", "Hum, squeal, or vibration should be checked by speed and braking condition."]
    ]
  },
  {
    make: "Volkswagen",
    models: ["Jetta", "Golf", "GTI", "Passat", "Tiguan", "Atlas"],
    years: [2008, 2024],
    issues: [
      ["Water pump or thermostat housing leaks", "Coolant smell, low coolant, or overheating should be checked."],
      ["Carbon buildup or misfires", "Rough idle and hesitation can need intake and ignition diagnosis."],
      ["DSG/transmission behavior", "Clunks, delay, or shudder should be documented by gear and temperature."]
    ]
  },
  {
    make: "Volvo",
    models: ["S60", "XC60", "XC90", "V60", "S90"],
    years: [2010, 2024],
    issues: [
      ["PCV/oil trap issues", "Whistle, rough idle, or oil leaks can point to crankcase ventilation faults."],
      ["Suspension clunks", "Control arms, links, and struts can make noises over bumps."],
      ["Cooling and turbo checks", "Hiss, whine, coolant smell, or power loss should be inspected."]
    ]
  }
);

const diagnosticProfiles = [
  {
    id: "brake_squeal",
    name: "Brake squeal or screech",
    context: ["wheel", "braking"],
    signature: { rattle: 18, squeal: 88, knock: 16, grind: 32, click: 10, chirp: 42, whine: 28, hiss: 8, thud: 8 },
    summary: "A sharp squeal or screech while braking usually means worn brake pads, glazed pads, or a wear indicator touching the rotor. If the sound is from the engine bay instead, it can also be a loose or damaged serpentine belt.",
    steps: ["Inspect brake pad thickness and rotor condition.", "Check whether the noise only appears while braking.", "If the squeal comes from the engine bay, inspect the serpentine belt and tensioner."],
    urgency: "Service soon"
  },
  {
    id: "brake_grinding",
    name: "Brake grinding",
    context: ["wheel", "braking"],
    signature: { rattle: 58, squeal: 28, knock: 28, grind: 94, click: 18, chirp: 10, whine: 20, hiss: 5, thud: 20 },
    summary: "Grinding during braking can mean the pads are completely worn down and metal is contacting the rotors.",
    steps: ["Stop aggressive driving and inspect the brakes as soon as possible.", "Look for rotor scoring, metal dust, or a burning smell.", "Plan for pads and possibly rotors, not just a quick adjustment."],
    urgency: "High priority"
  },
  {
    id: "cv_click",
    name: "CV axle or joint clicking",
    context: ["wheel", "turning"],
    signature: { rattle: 34, squeal: 8, knock: 58, grind: 24, click: 92, chirp: 5, whine: 16, hiss: 2, thud: 38 },
    summary: "Repeated clicking from a wheel area while turning often points to a worn CV axle or CV joint.",
    steps: ["Listen during slow tight turns in both directions.", "Inspect CV boots for tears or grease spray.", "Repair a failing axle before the joint separates or damages nearby parts."],
    urgency: "High priority"
  },
  {
    id: "engine_knock",
    name: "Engine knock or tapping",
    context: ["engine", "accelerating", "idle"],
    signature: { rattle: 32, squeal: 10, knock: 94, grind: 22, click: 42, chirp: 12, whine: 18, hiss: 4, thud: 48 },
    summary: "Knocking or tapping from the engine can point to low oil pressure, worn bearings, detonation, valvetrain wear, or a serious internal problem.",
    steps: ["Check oil level before driving further.", "Avoid hard acceleration if the knocking is loud or rhythmic.", "Have persistent knocking inspected quickly."],
    urgency: "High priority"
  },
  {
    id: "belt_chirp",
    name: "Belt chirp or serpentine belt squeal",
    context: ["engine", "accelerating", "idle"],
    signature: { rattle: 18, squeal: 82, knock: 8, grind: 12, click: 8, chirp: 92, whine: 40, hiss: 10, thud: 4 },
    summary: "Chirping or a high-pitched belt squeal from the engine bay often points to a worn belt, weak tensioner, misaligned pulley, or accessory bearing.",
    steps: ["Inspect the belt for cracks, glazing, or frayed ribs.", "Watch the tensioner and pulleys for wobble.", "Service it soon if the alternator, water pump, or power steering belt path is involved."],
    urgency: "Service soon"
  },
  {
    id: "underbody_rattle",
    name: "Underbody rattle",
    context: ["underbody", "idle", "accelerating", "bumps"],
    signature: { rattle: 94, squeal: 12, knock: 32, grind: 34, click: 44, chirp: 10, whine: 12, hiss: 8, thud: 28 },
    summary: "Rattling under the car can come from loose exhaust pipes, a heat shield, exhaust hangers, or suspension components.",
    steps: ["Listen under the car while parked and idling.", "Check heat shields, exhaust clamps, and hangers.", "If the rattle happens over bumps, inspect suspension links and bushings."],
    urgency: "Monitor"
  },
  {
    id: "acceleration_whine",
    name: "Acceleration whine",
    context: ["transmission", "steering", "accelerating"],
    signature: { rattle: 12, squeal: 48, knock: 16, grind: 18, click: 8, chirp: 34, whine: 94, hiss: 18, thud: 10 },
    summary: "Whining that rises with speed or acceleration can point to a transmission issue, power steering pump problem, alternator bearing, or low fluid.",
    steps: ["Notice whether the pitch follows engine RPM or road speed.", "Check power steering and transmission fluid condition where applicable.", "Get drivetrain or accessory whine inspected before it gets louder."],
    urgency: "Service soon"
  },
  {
    id: "engine_hiss",
    name: "Engine bay hiss",
    context: ["engine", "hot", "idle"],
    signature: { rattle: 8, squeal: 42, knock: 6, grind: 6, click: 4, chirp: 18, whine: 28, hiss: 94, thud: 2 },
    summary: "A hiss from the engine bay can come from a vacuum leak, coolant leak, escaping pressure, or oil/coolant contacting hot parts.",
    steps: ["Do not open a hot cooling system cap.", "Look for steam, coolant smell, or wet residue after the engine cools.", "If hissing is paired with overheating, stop driving and inspect immediately."],
    urgency: "High priority"
  },
  {
    id: "drivetrain_thud",
    name: "Shifting thud",
    context: ["transmission", "shifting", "accelerating"],
    signature: { rattle: 20, squeal: 6, knock: 66, grind: 28, click: 24, chirp: 4, whine: 18, hiss: 2, thud: 94 },
    summary: "A thud during shifting or when loading the drivetrain can point to worn differential bushings, mounts, U-joints, or driveline slack.",
    steps: ["Notice if the thud happens shifting into drive, reverse, or under acceleration.", "Inspect engine, transmission, and differential mounts.", "Have driveline play checked if the sound is heavy or getting worse."],
    urgency: "Service soon"
  },
  {
    id: "cabin_fan_chirp",
    name: "Cabin fan chirp",
    context: ["cabin", "idle"],
    signature: { rattle: 34, squeal: 58, knock: 4, grind: 10, click: 8, chirp: 86, whine: 32, hiss: 8, thud: 2 },
    summary: "A chirp or squeak from the dashboard area often points to a blower motor bearing, debris in the fan cage, or a loose cabin filter cover.",
    steps: ["Change fan speeds and listen for pitch changes.", "Inspect the cabin air filter area for leaves or debris.", "Service the blower motor if the chirp returns."],
    urgency: "Low priority"
  }
];

diagnosticProfiles.push(
  problemProfile(
    "engine_no_start",
    "Engine will not start",
    ["engine", "idle"],
    { click: 78, thud: 42, whine: 28, rattle: 24 },
    "A no-start sound can point to a weak battery, starter motor issue, ignition problem, fuel delivery problem, or security/immobilizer issue.",
    ["Listen for rapid clicking, slow cranking, or no crank at all.", "Check battery voltage and terminal corrosion.", "If it cranks normally but will not fire, inspect fuel and ignition next."],
    "High priority"
  ),
  problemProfile(
    "rough_idle_misfire",
    "Misfire or rough idle",
    ["engine", "idle"],
    { rattle: 56, knock: 44, thud: 34, hiss: 18 },
    "Uneven idle, shaking, or a puttering exhaust note can come from misfires, vacuum leaks, ignition coils, spark plugs, fuel injectors, or sensor faults.",
    ["Scan for misfire codes if a check engine light is on.", "Inspect plugs, coils, vacuum hoses, and intake leaks.", "Avoid driving hard if the check engine light flashes."],
    "Service soon"
  ),
  problemProfile(
    "overheating",
    "Overheating or coolant leak",
    ["engine", "hot"],
    { hiss: 90, rattle: 18, whine: 24, thud: 6 },
    "Hissing, steam, a sweet smell, or rising temperature can indicate low coolant, radiator leaks, a stuck thermostat, bad water pump, or cooling fan failure.",
    ["Do not open a hot radiator or coolant reservoir.", "Check coolant level only after the engine cools.", "Stop driving if the temperature gauge climbs or steam appears."],
    "High priority"
  ),
  problemProfile(
    "low_oil_pressure",
    "Oil leak or low oil pressure",
    ["engine", "idle", "accelerating"],
    { knock: 88, rattle: 54, thud: 34, hiss: 12 },
    "Ticking, knocking, oil smell, or an oil warning light can point to low oil level, an oil leak, worn bearings, or oil pressure problems.",
    ["Check oil level before driving further.", "Look for fresh oil underneath or burning oil smell.", "Shut the engine off if the oil pressure warning appears."],
    "High priority"
  ),
  problemProfile(
    "timing_belt_chain",
    "Timing belt or chain problem",
    ["engine", "idle", "accelerating"],
    { chirp: 70, rattle: 66, knock: 58, squeal: 46 },
    "A failing timing belt, timing chain, guide, or tensioner can make chirping, slapping, rattling, or ticking sounds and may cause rough running.",
    ["Do not ignore timing-area rattles or slaps.", "Check service history for belt or chain interval.", "Have it inspected quickly because failure can destroy an engine."],
    "High priority"
  ),
  problemProfile(
    "loss_of_power",
    "Loss of power or acceleration",
    ["engine", "accelerating"],
    { whine: 46, rattle: 30, hiss: 28, knock: 24 },
    "Poor acceleration can come from misfires, fuel starvation, clogged filters, turbo/intake leaks, transmission slip, exhaust restriction, or sensor faults.",
    ["Note whether RPM rises without speed increasing.", "Scan for engine and transmission codes.", "Check fuel, intake, exhaust, and transmission symptoms together."],
    "Service soon"
  ),
  problemProfile(
    "engine_stalling",
    "Engine stalling",
    ["engine", "idle", "accelerating"],
    { thud: 46, rattle: 32, hiss: 28, click: 20 },
    "Stalling can be caused by fuel delivery issues, idle control faults, vacuum leaks, dirty throttle body, sensor faults, ignition problems, or charging issues.",
    ["Record whether it stalls at idle, braking, or acceleration.", "Check for warning lights and stored codes.", "Avoid traffic-heavy driving until the cause is found."],
    "High priority"
  ),
  problemProfile(
    "dead_battery",
    "Dead or weak battery",
    ["engine", "idle"],
    { click: 88, thud: 20, whine: 10 },
    "Rapid clicking, dim lights, or very slow cranking often points to a weak battery or bad battery connections.",
    ["Check battery age, voltage, and terminal tightness.", "Clean corrosion from terminals.", "Test the alternator after jump-starting."],
    "Service soon"
  ),
  problemProfile(
    "alternator_fault",
    "Faulty alternator or charging system",
    ["engine", "idle", "accelerating"],
    { whine: 66, squeal: 48, chirp: 32, rattle: 16 },
    "A whining alternator bearing, belt squeal, battery light, or repeated dead battery can indicate charging system trouble.",
    ["Check belt condition and tension.", "Test charging voltage at idle.", "Inspect battery and alternator connections."],
    "Service soon"
  ),
  problemProfile(
    "blown_fuse",
    "Blown fuse",
    ["cabin", "idle"],
    { click: 20, rattle: 6, squeal: 2 },
    "A blown fuse usually has little or no sound, but it can explain sudden loss of accessories, lights, locks, outlets, or controls.",
    ["Identify which circuit stopped working.", "Replace only with the correct fuse rating.", "If it blows again, inspect for a short circuit."],
    "Monitor"
  ),
  problemProfile(
    "wiring_problem",
    "Wiring short or corrosion",
    ["cabin", "engine", "idle"],
    { click: 36, hiss: 10, rattle: 8 },
    "Intermittent clicking relays, flickering lights, burning smell, or random accessory failure can point to wiring damage, corrosion, or a short.",
    ["Inspect grounds and connectors for corrosion.", "Look for rodent damage or melted insulation.", "Do not keep replacing fuses without finding the cause."],
    "High priority"
  ),
  problemProfile(
    "sensor_fault",
    "Malfunctioning sensor",
    ["engine", "idle", "accelerating"],
    { rattle: 18, hiss: 14, whine: 12 },
    "Oxygen, MAF, MAP, crank, cam, or temperature sensor faults may not make a sound directly, but they can cause rough idle, stalling, poor mileage, or warning lights.",
    ["Scan diagnostic trouble codes.", "Check connector condition and live sensor data.", "Fix intake or exhaust leaks before blaming a sensor."],
    "Service soon"
  ),
  problemProfile(
    "dashboard_warning",
    "Dashboard warning light",
    ["cabin", "engine"],
    { click: 10, rattle: 8 },
    "Warning lights often need scan data rather than audio. The sound sample can still help if the light appears with knocking, hissing, grinding, or rough idle.",
    ["Scan the warning code before replacing parts.", "Do not ignore oil, coolant temperature, brake, or charging warnings.", "Pair the code with the sound and driving condition."],
    "Service soon"
  ),
  problemProfile(
    "power_windows_locks",
    "Power windows or locks not working",
    ["cabin", "idle"],
    { click: 46, whine: 32, grind: 26 },
    "Clicking, buzzing, or no motor sound from a door can point to a bad switch, regulator, actuator, fuse, wiring, or window motor.",
    ["Listen for motor movement inside the door.", "Check the fuse and switch first.", "Inspect door wiring where it bends near the hinge."],
    "Monitor"
  ),
  problemProfile(
    "fuel_pump_failure",
    "Fuel pump failure",
    ["engine", "idle"],
    { whine: 62, hiss: 14, rattle: 10 },
    "A loud rear whine, no prime sound, hard starting, stalling, or loss of power can point to fuel pump trouble.",
    ["Listen for fuel pump prime when the key turns on.", "Check fuel pressure before replacing the pump.", "Inspect pump relay and fuse too."],
    "High priority"
  ),
  problemProfile(
    "clogged_fuel_filter",
    "Clogged fuel filter",
    ["engine", "accelerating"],
    { whine: 42, rattle: 24, thud: 16 },
    "A clogged fuel filter may not make a sound directly, but it can cause hesitation, weak acceleration, stalling, or pump strain.",
    ["Check fuel pressure under load.", "Replace serviceable filters at the correct interval.", "Do not overlook contaminated fuel."],
    "Service soon"
  ),
  problemProfile(
    "dirty_injectors",
    "Dirty or failing fuel injectors",
    ["engine", "idle"],
    { click: 38, rattle: 34, knock: 22 },
    "Injector problems can cause ticking, rough idle, misfire, hard starts, poor mileage, or fuel smell.",
    ["Listen for uneven injector clicking.", "Scan misfire and fuel trim data.", "Check fuel quality and pressure."],
    "Service soon"
  ),
  problemProfile(
    "fuel_pressure_regulator",
    "Bad fuel pressure regulator",
    ["engine", "idle", "accelerating"],
    { hiss: 22, rattle: 20, thud: 12 },
    "A bad regulator can cause rich/lean running, fuel smell, hard starts, rough idle, or loss of power.",
    ["Check fuel pressure and vacuum reference.", "Look for fuel in the regulator vacuum line if equipped.", "Pair sound symptoms with scan data."],
    "Service soon"
  ),
  problemProfile(
    "out_of_fuel",
    "Out of fuel",
    ["engine", "idle"],
    { click: 24, thud: 16, whine: 12 },
    "Running out of fuel can sound like cranking with no start, sputtering, or stalling before the engine dies.",
    ["Confirm fuel level instead of relying only on the gauge.", "Listen for fuel pump prime.", "Add fuel and avoid repeated long cranking."],
    "Monitor"
  ),
  problemProfile(
    "radiator_leak",
    "Radiator leak",
    ["engine", "hot"],
    { hiss: 92, whine: 18, rattle: 12 },
    "A radiator leak may sound like hissing or bubbling and can cause overheating, steam, coolant smell, or puddles.",
    ["Let the engine cool before inspecting.", "Pressure-test the cooling system.", "Repair leaks before refilling repeatedly."],
    "High priority"
  ),
  problemProfile(
    "water_pump_failure",
    "Water pump failure",
    ["engine", "idle", "hot"],
    { whine: 72, rattle: 46, hiss: 36, chirp: 30 },
    "A failing water pump can whine, grind, leak coolant, or cause overheating.",
    ["Check for coolant near the pump weep hole.", "Listen for bearing noise at the pump area.", "Avoid overheating the engine."],
    "High priority"
  ),
  problemProfile(
    "thermostat_stuck",
    "Thermostat stuck open or closed",
    ["engine", "hot"],
    { hiss: 34, rattle: 8 },
    "A stuck thermostat may not make a distinct sound, but it can cause overheating, slow warmup, poor heater output, or temperature swings.",
    ["Watch coolant temperature behavior.", "Check heater output and radiator hose temperature.", "Replace with the correct temperature rating."],
    "Service soon"
  ),
  problemProfile(
    "coolant_low_contaminated",
    "Low or contaminated coolant",
    ["engine", "hot"],
    { hiss: 62, rattle: 16, thud: 8 },
    "Low or contaminated coolant can cause gurgling, hissing, overheating, poor heater output, or corrosion.",
    ["Inspect coolant level after the engine cools.", "Look for oil contamination or rusty coolant.", "Find the leak instead of topping off repeatedly."],
    "High priority"
  ),
  problemProfile(
    "cooling_fan_failure",
    "Cooling fan failure",
    ["engine", "hot", "idle"],
    { whine: 50, rattle: 44, click: 24, hiss: 34 },
    "A bad cooling fan, relay, fuse, or sensor can cause overheating at idle or in traffic. A failing fan motor can click, buzz, or rattle.",
    ["Check whether the fan turns on when hot or with AC.", "Inspect fan fuse, relay, and connector.", "Avoid idling if the temperature climbs."],
    "High priority"
  ),
  problemProfile(
    "transmission_slip",
    "Transmission slipping",
    ["transmission", "accelerating"],
    { whine: 66, thud: 28, rattle: 18 },
    "Slipping gears may sound like engine revs rising without matching road speed and can point to low fluid, worn clutch packs, or transmission failure.",
    ["Check transmission fluid level/condition where serviceable.", "Note whether slipping happens cold, hot, or under load.", "Avoid hard acceleration until inspected."],
    "High priority"
  ),
  problemProfile(
    "hard_delayed_shift",
    "Hard or delayed shifting",
    ["transmission", "shifting"],
    { thud: 86, whine: 24, rattle: 18 },
    "Hard or delayed shifts can come from low fluid, worn mounts, valve body issues, solenoids, clutch wear, or software adaptation problems.",
    ["Note gear, temperature, and throttle when it happens.", "Check fluid condition if applicable.", "Scan transmission codes and live data."],
    "Service soon"
  ),
  problemProfile(
    "transmission_fluid_leak",
    "Transmission fluid leak",
    ["transmission", "idle", "accelerating"],
    { whine: 54, thud: 24, hiss: 16 },
    "Transmission leaks may cause whining, delayed engagement, slipping, burning smell, or red/brown fluid under the vehicle.",
    ["Check fluid level only by the correct procedure.", "Look around cooler lines, pan, axle seals, and case seals.", "Do not drive if engagement is delayed or slipping."],
    "High priority"
  ),
  problemProfile(
    "transmission_grinding",
    "Transmission grinding",
    ["transmission", "shifting"],
    { grind: 92, thud: 48, whine: 36 },
    "Grinding while shifting can indicate clutch problems, synchronizer wear, low fluid, or internal transmission damage.",
    ["Avoid forcing the shifter.", "Check fluid level and clutch operation.", "Have grinding diagnosed before gear damage worsens."],
    "High priority"
  ),
  problemProfile(
    "transmission_failure",
    "Major transmission failure",
    ["transmission", "shifting", "accelerating"],
    { grind: 72, thud: 78, whine: 78, rattle: 50 },
    "Loud grinding, no movement, severe slipping, burning smell, or repeated thuds can point to major transmission failure.",
    ["Stop driving if the vehicle will not move normally.", "Check fluid and scan codes.", "Tow it if gear engagement is unsafe."],
    "High priority"
  ),
  problemProfile(
    "brake_fluid_leak",
    "Brake fluid leak",
    ["wheel", "braking"],
    { hiss: 20, thud: 20, grind: 18 },
    "Brake fluid leaks may not make much sound, but a low pedal, warning light, or wet backing plate is urgent.",
    ["Do not drive with a sinking brake pedal.", "Check master cylinder, calipers, wheel cylinders, and lines.", "Repair leaks and bleed the system."],
    "High priority"
  ),
  problemProfile(
    "soft_brake_pedal",
    "Soft or spongy brake pedal",
    ["wheel", "braking"],
    { hiss: 18, thud: 18, grind: 12 },
    "A soft pedal can come from air in the system, brake fluid leaks, failing master cylinder, worn hoses, or overheated fluid.",
    ["Pump the pedal only to move to a safe stop.", "Inspect fluid level and leaks.", "Bleed and repair the system before normal driving."],
    "High priority"
  ),
  problemProfile(
    "abs_malfunction",
    "ABS malfunction",
    ["wheel", "braking"],
    { click: 52, grind: 36, thud: 24 },
    "ABS faults can cause warning lights, pulsing, buzzing, or unexpected activation, often from wheel speed sensors, wiring, tone rings, or the ABS module.",
    ["Scan ABS codes, not only engine codes.", "Inspect wheel speed sensor wiring and tone rings.", "Brake normally but repair ABS faults promptly."],
    "Service soon"
  ),
  problemProfile(
    "brake_caliper_issue",
    "Brake caliper issue",
    ["wheel", "braking"],
    { grind: 68, squeal: 54, rattle: 32, hiss: 8 },
    "A stuck caliper can cause grinding, squeal, dragging, heat, smoke, pulling, or uneven pad wear.",
    ["Check for one wheel hotter than the others.", "Inspect caliper slide pins and piston movement.", "Repair before rotor and bearing damage occur."],
    "High priority"
  ),
  problemProfile(
    "worn_shocks_struts",
    "Worn shocks or struts",
    ["wheel", "bumps"],
    { thud: 58, rattle: 50, squeal: 12 },
    "Clunks, bouncing, nose dive, or poor control over bumps can point to worn shocks or struts.",
    ["Listen over bumps and dips.", "Inspect for leaks around struts or shocks.", "Check tire wear from poor damping."],
    "Service soon"
  ),
  problemProfile(
    "broken_spring",
    "Broken spring",
    ["wheel", "bumps"],
    { thud: 70, rattle: 54, click: 34 },
    "A broken spring can cause clunks, uneven ride height, tire rubbing, or sharp metallic noises over bumps.",
    ["Compare ride height side to side.", "Inspect spring ends and seats.", "Do not drive if the spring can contact the tire."],
    "High priority"
  ),
  problemProfile(
    "ball_joint_wear",
    "Loose or worn ball joint",
    ["wheel", "turning", "bumps"],
    { thud: 74, click: 58, rattle: 42 },
    "Ball joint wear can sound like clunking over bumps or while turning and can create steering looseness or uneven tire wear.",
    ["Inspect for play with the wheel unloaded.", "Listen for clunks during low-speed turns.", "Repair promptly because joint failure can be dangerous."],
    "High priority"
  ),
  problemProfile(
    "steering_vibration",
    "Steering wheel vibration",
    ["wheel", "steering", "accelerating"],
    { rattle: 44, thud: 30, whine: 22 },
    "Steering vibration can come from tire balance, bent rims, uneven wear, suspension wear, brake rotor variation, or alignment issues.",
    ["Note speed range and whether braking changes it.", "Inspect tires and wheels first.", "Check alignment and suspension play."],
    "Service soon"
  ),
  problemProfile(
    "power_steering_failure",
    "Power steering failure",
    ["steering", "turning"],
    { whine: 92, hiss: 40, squeal: 34, chirp: 24 },
    "Whine or groan while turning can point to low power steering fluid, pump failure, belt slip, air in the system, or electric steering faults.",
    ["Check fluid where applicable.", "Listen during slow turns and parking maneuvers.", "Do not ignore sudden heavy steering."],
    "High priority"
  ),
  problemProfile(
    "flat_tire_blowout",
    "Flat tire or blowout",
    ["wheel", "accelerating"],
    { thud: 76, rattle: 58, hiss: 52, grind: 24 },
    "A flat or blowout can create thumping, flapping, hissing air, pulling, vibration, or sudden handling changes.",
    ["Slow down gently and avoid hard braking.", "Inspect sidewalls and tread.", "Do not drive on a flat tire unless absolutely necessary to reach safety."],
    "High priority"
  ),
  problemProfile(
    "uneven_tire_wear_alignment",
    "Uneven tire wear or alignment issue",
    ["wheel", "accelerating"],
    { rattle: 32, whine: 28, thud: 24 },
    "Uneven wear or bad alignment can cause humming, vibration, pulling, and abnormal tire noise.",
    ["Inspect tread across each tire.", "Check alignment if the car pulls.", "Rotate or replace tires as needed."],
    "Service soon"
  ),
  problemProfile(
    "low_tire_pressure",
    "Low tire pressure",
    ["wheel", "accelerating"],
    { thud: 38, rattle: 26, hiss: 34 },
    "Low tire pressure can cause thumping, poor handling, TPMS warnings, tire heat, and uneven wear.",
    ["Check pressure cold with a gauge.", "Inspect for nails or valve leaks.", "Do not rely only on visual tire shape."],
    "Service soon"
  ),
  problemProfile(
    "wheel_imbalance",
    "Wheel imbalance",
    ["wheel", "accelerating"],
    { rattle: 40, thud: 36, whine: 22 },
    "Wheel imbalance often causes speed-specific vibration and humming rather than a sharp mechanical noise.",
    ["Note the speed where vibration starts.", "Balance wheels and inspect tires.", "Check bent wheels if balancing does not fix it."],
    "Service soon"
  ),
  problemProfile(
    "bent_rim",
    "Bent rim",
    ["wheel", "accelerating", "bumps"],
    { thud: 50, rattle: 38, grind: 16 },
    "A bent rim can cause vibration, air loss, thumping, or bead leaks, especially after pothole impacts.",
    ["Inspect the wheel lip and tire bead area.", "Check for slow leaks.", "Repair or replace the wheel if vibration remains."],
    "Service soon"
  ),
  problemProfile(
    "exhaust_leak",
    "Exhaust leak",
    ["underbody", "engine", "accelerating"],
    { hiss: 54, rattle: 62, thud: 20 },
    "An exhaust leak can sound like ticking, puffing, hissing, or a louder exhaust tone, especially during acceleration.",
    ["Check manifolds, flex pipes, gaskets, and flanges.", "Avoid fumes entering the cabin.", "Repair leaks near the engine quickly."],
    "Service soon"
  ),
  problemProfile(
    "catalytic_converter_failure",
    "Catalytic converter failure",
    ["underbody", "accelerating"],
    { rattle: 82, thud: 28, hiss: 18 },
    "A failed catalytic converter can rattle internally, restrict exhaust flow, reduce power, trigger codes, or cause heat/sulfur smells.",
    ["Listen for rattling under the car.", "Check for converter efficiency codes.", "Inspect for exhaust restriction if power is low."],
    "Service soon"
  ),
  problemProfile(
    "failed_emissions",
    "Failed emissions test",
    ["engine", "idle"],
    { rattle: 18, hiss: 18, whine: 12 },
    "Failed emissions can come from oxygen sensors, catalytic converter, EVAP leaks, misfires, fuel trim issues, or software readiness monitors.",
    ["Scan codes and readiness monitors.", "Fix misfires before catalytic converter damage occurs.", "Check EVAP and exhaust leaks."],
    "Service soon"
  ),
  problemProfile(
    "excess_smoke",
    "Excess smoke from exhaust",
    ["engine", "idle", "accelerating"],
    { rattle: 30, hiss: 26, knock: 18 },
    "Blue smoke suggests oil burning, white smoke can suggest coolant or condensation, and black smoke suggests rich fuel mixture.",
    ["Note smoke color and when it happens.", "Check oil and coolant levels.", "Do not ignore white smoke with overheating or coolant loss."],
    "High priority"
  ),
  problemProfile(
    "ac_not_cooling",
    "AC not cooling",
    ["cabin", "idle"],
    { hiss: 38, click: 34, whine: 28 },
    "Weak AC can come from low refrigerant, compressor problems, blend door issues, cooling fan failure, or electrical faults.",
    ["Listen for compressor clutch click or cycling.", "Check cabin airflow and condenser fan operation.", "Leak-test before adding refrigerant."],
    "Service soon"
  ),
  problemProfile(
    "heater_not_working",
    "Heater not working",
    ["cabin", "hot"],
    { hiss: 20, rattle: 12 },
    "No heat can come from low coolant, stuck thermostat, blocked heater core, blend door fault, or blower issue.",
    ["Check coolant level after cooling down.", "Compare engine temperature with vent heat.", "Listen for blend door clicking behind the dash."],
    "Service soon"
  ),
  problemProfile(
    "blower_motor_failure",
    "Blower motor failure",
    ["cabin", "idle"],
    { chirp: 76, squeal: 54, rattle: 46, whine: 44 },
    "A failing blower motor can chirp, squeal, buzz, rattle, or stop moving air.",
    ["Change fan speeds and listen for pitch changes.", "Inspect the cabin filter area for debris.", "Check resistor/module and motor power."],
    "Monitor"
  ),
  problemProfile(
    "refrigerant_leak",
    "Refrigerant leak",
    ["cabin", "engine", "idle"],
    { hiss: 80, click: 20, whine: 18 },
    "A refrigerant leak may hiss briefly and causes poor cooling or rapid compressor cycling.",
    ["Do not vent refrigerant intentionally.", "Use proper leak detection.", "Repair leaks before recharging."],
    "Service soon"
  ),
  problemProfile(
    "door_lock_failure",
    "Door lock failure",
    ["cabin", "idle"],
    { click: 58, grind: 22, whine: 20 },
    "Door lock actuator or latch problems can click, buzz, grind, or fail silently.",
    ["Listen inside the door while pressing lock/unlock.", "Check fuses and door wiring.", "Replace the actuator if it moves weakly or chatters."],
    "Monitor"
  ),
  problemProfile(
    "window_regulator_issue",
    "Window regulator issue",
    ["cabin", "idle"],
    { grind: 62, click: 46, whine: 38, rattle: 26 },
    "A bad window regulator or motor can grind, pop, click, or let glass drop inside the door.",
    ["Stop using the switch if the glass binds.", "Inspect regulator cables/sliders.", "Check motor power and switch operation."],
    "Monitor"
  ),
  problemProfile(
    "seat_adjustment_problem",
    "Seat adjustment problem",
    ["cabin", "idle"],
    { click: 38, grind: 42, whine: 36 },
    "Power seat problems can click, grind, or stop moving due to tracks, motors, switches, or wiring.",
    ["Check for objects in the seat tracks.", "Listen for motor sound.", "Inspect switch and fuse if silent."],
    "Monitor"
  ),
  problemProfile(
    "dashboard_crack_failure",
    "Dashboard rattle or failure",
    ["cabin", "bumps"],
    { rattle: 70, squeal: 8, thud: 18 },
    "Dashboard cracks, loose panels, vents, or clips can create rattles or buzzes over bumps.",
    ["Press lightly on panels to localize the rattle.", "Check vents and trim clips.", "Rule out suspension noises if it seems to come from outside."],
    "Low priority"
  ),
  problemProfile(
    "water_leak_cabin",
    "Water leak into cabin",
    ["cabin", "hot"],
    { hiss: 26, rattle: 8, thud: 4 },
    "Water leaks usually are visual or odor symptoms, but may include dripping, sloshing, fan noise, or wet carpet.",
    ["Check sunroof drains, door seals, windshield seals, and AC drain.", "Dry carpet quickly to prevent mold.", "Look for water trails after rain or washing."],
    "Service soon"
  ),
  problemProfile(
    "ecu_pcm_fault",
    "ECU or PCM fault",
    ["engine", "idle"],
    { click: 18, rattle: 12 },
    "Computer faults may not make sound, but can cause no-start, stalling, warning lights, misfires, or communication codes.",
    ["Scan all modules, not just the engine computer.", "Check power, ground, and connector condition.", "Rule out sensor and wiring faults first."],
    "Service soon"
  ),
  problemProfile(
    "sensor_miscommunication",
    "Sensor communication problem",
    ["engine", "cabin"],
    { click: 16, rattle: 10 },
    "Module or sensor communication issues usually need scan data, but can create rough running, warning lights, or limp mode.",
    ["Scan for network and sensor codes.", "Inspect wiring harnesses and connectors.", "Check battery voltage because low voltage can create false faults."],
    "Service soon"
  ),
  problemProfile(
    "software_glitch",
    "Software glitch",
    ["cabin", "engine"],
    { click: 12, rattle: 6 },
    "Software glitches can cause warning lights, infotainment issues, shifting behavior, or intermittent features without a clear mechanical sound.",
    ["Check for service bulletins or software updates.", "Record exact conditions when it happens.", "Rule out low battery voltage first."],
    "Monitor"
  ),
  problemProfile(
    "check_engine_no_obvious",
    "Check engine light with no obvious symptom",
    ["engine", "idle"],
    { rattle: 12, hiss: 12, click: 10 },
    "A check engine light without obvious sound can still indicate emissions, sensor, fuel trim, EVAP, or intermittent faults.",
    ["Scan codes and freeze-frame data.", "Do not replace parts based only on the light.", "Watch for new sounds, smells, or drivability changes."],
    "Service soon"
  ),
  problemProfile(
    "fluid_leak_general",
    "Fluid leak",
    ["engine", "underbody", "transmission", "steering", "wheel"],
    { hiss: 42, whine: 24, rattle: 16 },
    "Fluid leaks can include oil, coolant, transmission fluid, brake fluid, power steering fluid, or washer fluid. Some hiss, smell, smoke, or cause pump whine.",
    ["Identify fluid color, smell, and location.", "Do not drive with brake fluid or severe coolant/oil leaks.", "Clean the area and recheck to trace the source."],
    "High priority"
  ),
  problemProfile(
    "power_steering_fluid_leak",
    "Power steering fluid leak",
    ["steering", "turning"],
    { whine: 88, hiss: 28, chirp: 20 },
    "Low power steering fluid or a leak can cause groaning or whining while turning and may make steering heavy.",
    ["Check fluid level if hydraulic steering is equipped.", "Inspect hoses, pump, rack, and reservoir.", "Do not run the pump dry."],
    "Service soon"
  ),
  problemProfile(
    "washer_fluid_leak",
    "Washer fluid leak",
    ["cabin", "idle"],
    { hiss: 14, click: 8 },
    "Washer fluid leaks usually do not make a diagnostic sound, but can explain blue fluid puddles or weak washer spray.",
    ["Check reservoir, pump grommet, hoses, and nozzles.", "Use washer fluid, not plain water in freezing climates.", "Repair before winter if freezing is possible."],
    "Low priority"
  ),
  problemProfile(
    "weather_damage",
    "Weather damage",
    ["engine", "cabin", "wheel"],
    { rattle: 20, hiss: 20, click: 18 },
    "Heat, cold, flooding, or moisture can damage batteries, wiring, seals, fluids, tires, electronics, and interior components.",
    ["Check for water intrusion or corrosion.", "Inspect battery condition in extreme temperatures.", "Do not start a flood-damaged engine until inspected."],
    "Service soon"
  ),
  problemProfile(
    "rodent_damage",
    "Rodent damage to wiring",
    ["engine", "cabin"],
    { click: 28, rattle: 10, hiss: 8 },
    "Rodent damage can cause no-start, warning lights, misfires, blower noise, or accessory failures through chewed wiring or nests.",
    ["Look for nesting material and chewed insulation.", "Inspect engine bay and cabin filter area.", "Repair wiring properly rather than twisting wires together."],
    "Service soon"
  ),
  problemProfile(
    "poor_maintenance",
    "Poor or skipped maintenance",
    ["engine", "wheel", "transmission", "underbody"],
    { rattle: 34, squeal: 30, knock: 28, grind: 28, whine: 24 },
    "Skipped maintenance can show up as dirty fluids, worn brakes, old belts, clogged filters, tire wear, overheating, misfires, and noisy components.",
    ["Check service history and overdue items.", "Inspect fluids, belts, filters, brakes, and tires.", "Fix safety-critical items first."],
    "Service soon"
  ),
  problemProfile(
    "bad_fuel_quality",
    "Bad fuel quality",
    ["engine", "idle", "accelerating"],
    { knock: 52, rattle: 36, thud: 24 },
    "Bad fuel can cause knocking, misfires, hard starts, stalling, poor power, or fuel system contamination.",
    ["Note whether symptoms started after refueling.", "Avoid hard acceleration if knocking appears.", "Check fuel quality and drain contaminated fuel if needed."],
    "Service soon"
  ),
  problemProfile(
    "accident_physical_damage",
    "Accident or physical damage",
    ["wheel", "underbody", "engine", "cabin"],
    { rattle: 62, thud: 60, grind: 42, hiss: 30 },
    "Impact damage can cause rattles, rubbing, leaks, bent wheels, steering vibration, exhaust contact, or hidden structural issues.",
    ["Inspect the area that was hit.", "Check for leaks, rubbing tires, and bent parts.", "Avoid driving if steering, brakes, or cooling are affected."],
    "High priority"
  ),
  problemProfile(
    "wrong_fuel_type",
    "Wrong fuel type",
    ["engine", "idle", "accelerating"],
    { knock: 62, rattle: 38, thud: 24 },
    "Wrong fuel can cause knocking, misfires, no-start, smoke, or fuel system damage depending on the engine and fuel.",
    ["Do not keep running the engine if wrong fuel is suspected.", "Tow and drain the system when needed.", "Record when and where the refuel happened."],
    "High priority"
  ),
  problemProfile(
    "improper_repair",
    "Improper repair",
    ["engine", "wheel", "underbody", "cabin", "transmission"],
    { rattle: 48, thud: 38, click: 30, hiss: 24 },
    "A new sound after repairs can come from loose fasteners, misrouted belts/hoses, missing clips, poor wiring repairs, or incorrectly installed parts.",
    ["Compare the sound to the repaired area.", "Check fasteners, clips, connectors, and routing.", "Return to the shop if the issue appeared immediately after service."],
    "Service soon"
  ),
  problemProfile(
    "driving_habits",
    "Driving habit-related wear",
    ["engine", "wheel", "transmission"],
    { squeal: 42, grind: 38, knock: 34, whine: 30, thud: 28 },
    "Hard braking, over-revving, towing, riding the clutch, curbing wheels, or ignoring warmup can accelerate noisy wear.",
    ["Note whether the sound appears after hard driving.", "Inspect brakes, tires, clutch/transmission, and engine fluids.", "Adjust driving habits once the mechanical issue is repaired."],
    "Monitor"
  )
);

diagnosticProfiles.push(
  problemProfile(
    "wheel_bearing_hum",
    "Wheel bearing hum",
    ["wheel", "accelerating", "turning"],
    { whine: 76, rattle: 36, thud: 18 },
    "A speed-related hum or growl that changes when turning often points to a worn wheel bearing or hub.",
    ["Note whether the hum changes when turning left or right.", "Check for wheel play and roughness.", "Repair before bearing heat or hub failure worsens."],
    "Service soon"
  ),
  problemProfile(
    "turbo_wastegate_rattle",
    "Turbo wastegate rattle",
    ["engine", "accelerating"],
    { rattle: 78, whine: 46, hiss: 34 },
    "Rattle, hiss, or power loss on a turbo engine can point to wastegate wear, boost leaks, or turbo plumbing issues.",
    ["Listen during light throttle and deceleration.", "Inspect charge pipes, clamps, and vacuum lines.", "Scan boost pressure and wastegate control data."],
    "Service soon"
  ),
  problemProfile(
    "differential_whine",
    "Differential or axle whine",
    ["transmission", "accelerating"],
    { whine: 90, thud: 34, rattle: 20 },
    "A rear or center whine that changes with throttle can point to differential bearings, low gear oil, or driveline wear.",
    ["Note whether the whine appears on acceleration or coast.", "Check differential fluid level and metal debris.", "Inspect mounts and driveshaft joints."],
    "High priority"
  ),
  problemProfile(
    "driveshaft_u_joint",
    "Driveshaft or U-joint clunk",
    ["transmission", "shifting"],
    { thud: 88, click: 44, rattle: 36 },
    "A clunk when shifting into drive/reverse or taking off can point to U-joints, driveshaft slip yoke, mounts, or differential lash.",
    ["Listen during parking-lot shifts.", "Inspect U-joints and driveshaft play.", "Repair quickly if vibration appears at speed."],
    "Service soon"
  ),
  problemProfile(
    "starter_grinding",
    "Starter grinding",
    ["engine", "idle"],
    { grind: 86, click: 54, whine: 36 },
    "Grinding during start-up can mean starter gear, flywheel/flexplate teeth, weak engagement, or mounting issues.",
    ["Stop repeated grinding starts.", "Inspect starter mounting and gear engagement.", "Check battery voltage because low voltage can cause bad engagement."],
    "High priority"
  ),
  problemProfile(
    "ev_drive_unit_whine",
    "EV drive unit whine",
    ["transmission", "accelerating"],
    { whine: 92, rattle: 18, thud: 12 },
    "A loud EV whine or vibration can come from drive unit bearings, tires, wheel bearings, motor mounts, or inverter cooling components.",
    ["Compare sound under acceleration and regen.", "Check tires and wheel bearings first.", "Have high-voltage drive components inspected by qualified service."],
    "Service soon"
  ),
  problemProfile(
    "hybrid_battery_fan",
    "Hybrid battery cooling fan noise",
    ["cabin", "idle", "accelerating"],
    { whine: 58, rattle: 42, hiss: 18 },
    "A loud fan from the rear seat or cargo area can come from a clogged hybrid battery cooling fan or high battery temperature.",
    ["Check vents for lint or blockage.", "Do not block battery cooling intakes.", "Have hybrid system temperatures scanned if warnings appear."],
    "Service soon"
  ),
  problemProfile(
    "dpf_regen_exhaust",
    "Diesel DPF or emissions noise",
    ["underbody", "engine", "hot"],
    { rattle: 52, hiss: 42, whine: 22 },
    "Diesel emissions systems can cause hot exhaust smells, fan noise, hiss, rattle, or reduced power during DPF/EGR/DEF faults.",
    ["Scan diesel emissions codes.", "Do not ignore repeated reduced-power warnings.", "Check exhaust sensors, DEF level, and DPF status."],
    "Service soon"
  ),
  problemProfile(
    "exhaust_manifold_tick",
    "Exhaust manifold tick",
    ["engine", "accelerating"],
    { rattle: 56, hiss: 46, click: 34 },
    "A ticking or puffing noise that is louder cold and under acceleration can point to exhaust manifold leaks or broken studs.",
    ["Listen near the manifold on cold start.", "Check for soot tracks around gaskets or studs.", "Repair leaks before fumes or heat damage spread."],
    "Service soon"
  ),
  problemProfile(
    "intake_vacuum_leak",
    "Intake or vacuum leak",
    ["engine", "idle"],
    { hiss: 88, rattle: 20, whine: 18 },
    "A steady hiss with rough idle, lean codes, or stalling often points to a vacuum hose, intake boot, PCV, or gasket leak.",
    ["Listen around hoses and intake boots.", "Check fuel trims and smoke-test the intake.", "Repair leaks before replacing sensors."],
    "Service soon"
  )
);

const privateSoundLibrary = [
  {
    issueId: "belt_chirp",
    source: "engine",
    condition: "accelerating",
    signature: { rattle: 73, squeal: 83, knock: 100, grind: 34, click: 20, chirp: 92, whine: 58, hiss: 12, thud: 18 }
  },
  {
    issueId: "brake_squeal",
    source: "wheel",
    condition: "braking",
    signature: { rattle: 42, squeal: 82, knock: 11, grind: 44, click: 14, chirp: 54, whine: 18, hiss: 8, thud: 7 }
  },
  {
    issueId: "engine_knock",
    source: "engine",
    condition: "accelerating",
    signature: { rattle: 100, squeal: 100, knock: 100, grind: 48, click: 52, chirp: 38, whine: 36, hiss: 8, thud: 64 }
  },
  {
    issueId: "underbody_rattle",
    source: "underbody",
    condition: "idle",
    signature: { rattle: 100, squeal: 100, knock: 58, grind: 42, click: 48, chirp: 18, whine: 20, hiss: 10, thud: 30 }
  },
  {
    issueId: "cv_click",
    source: "wheel",
    condition: "turning",
    signature: { rattle: 27, squeal: 25, knock: 100, grind: 24, click: 90, chirp: 8, whine: 8, hiss: 2, thud: 76 }
  },
  {
    issueId: "cabin_fan_chirp",
    source: "cabin",
    condition: "idle",
    signature: { rattle: 77, squeal: 97, knock: 38, grind: 18, click: 12, chirp: 94, whine: 38, hiss: 12, thud: 8 }
  }
];

const profileById = Object.fromEntries(diagnosticProfiles.map((profile) => [profile.id, profile]));

function problemProfile(id, name, context, signature, summary, steps, urgency) {
  return {
    id,
    name,
    context,
    signature: createSignature(signature),
    summary,
    steps,
    urgency
  };
}

function createSignature(overrides = {}) {
  return {
    rattle: 10,
    squeal: 10,
    knock: 10,
    grind: 10,
    click: 10,
    chirp: 10,
    whine: 10,
    hiss: 10,
    thud: 10,
    ...overrides
  };
}

function populateVehicleYears() {
  const currentYear = new Date().getFullYear() + 1;
  vehicleYearSelect.innerHTML = '<option value="">Year</option>';
  for (let year = currentYear; year >= 1980; year -= 1) {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    vehicleYearSelect.append(option);
  }
}

function loadVehicle() {
  try {
    return JSON.parse(localStorage.getItem(vehicleStorageKey)) || {};
  } catch {
    return {};
  }
}

function saveVehicle() {
  localStorage.setItem(vehicleStorageKey, JSON.stringify(getVehicle()));
  updateVehicleLogo();
  renderVehicleIssues();
  updateModelSuggestions();
  renderToolLinks();
  dispatchBlueprintVehicle();
}

function hydrateVehicleControls() {
  populateVehicleYears();
  const vehicle = loadVehicle();
  vehicleYearSelect.value = vehicle.year || "";
  vehicleMakeSelect.value = vehicle.make || "";
  vehicleModelInput.value = vehicle.model || "";
  engineFuelSelect.value = vehicle.fuel || "";
  engineSpecInput.value = vehicle.engine || "";
  engineAspirationSelect.value = vehicle.aspiration || "";
  drivetrainSelect.value = vehicle.drivetrain || "";
  mileageInput.value = vehicle.mileage || "";
  vinInput.value = vehicle.vin || "";
  hydrateCustomerControls();
  updateModelSuggestions();
  updateVehicleLogo();
  renderVehicleIssues();
  renderToolLinks();
  dispatchBlueprintVehicle();
}

function getVehicle() {
  return {
    year: vehicleYearSelect.value,
    make: vehicleMakeSelect.value,
    model: vehicleModelInput.value.trim(),
    fuel: engineFuelSelect.value,
    engine: engineSpecInput.value.trim(),
    aspiration: engineAspirationSelect.value,
    drivetrain: drivetrainSelect.value,
    mileage: mileageInput.value,
    vin: vinInput.value.trim().toUpperCase()
  };
}

function getVehicleLabel() {
  const vehicle = getVehicle();
  const base = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ");
  const engine = [vehicle.engine, vehicle.aspiration, vehicle.fuel, vehicle.drivetrain].filter(Boolean).join(", ");
  return [base, engine].filter(Boolean).join(" - ");
}

function loadCustomer() {
  try {
    return JSON.parse(localStorage.getItem(customerStorageKey)) || {};
  } catch {
    return {};
  }
}

function saveCustomer() {
  localStorage.setItem(customerStorageKey, JSON.stringify(getCustomer()));
  renderMechanicDashboard();
}

function hydrateCustomerControls() {
  const customer = loadCustomer();
  customerNameInput.value = customer.name || "";
  customerContactInput.value = customer.contact || "";
}

function getCustomer() {
  return {
    name: customerNameInput.value.trim(),
    contact: customerContactInput.value.trim()
  };
}

function updateModelSuggestions() {
  if (!modelSuggestions) return;
  const models = vehicleModelCatalog[vehicleMakeSelect.value] || [];
  modelSuggestions.innerHTML = models.map((model) => `<option value="${escapeHtml(model)}"></option>`).join("");
}

function updateVehicleLogo() {
  const vehicle = getVehicle();
  const badge = makeBadges[vehicle.make] || makeBadges.Other;
  const model = vehicle.model || "Select vehicle";
  const modelLabel = model.length > 16 ? `${model.slice(0, 15)}...` : model;

  vehicleBadgeMake.textContent = badge.mark;
  vehicleBadgeModel.textContent = modelLabel;
  vehicleBadgePlate.setAttribute("fill", badge.color);
  vehicleBadgePlate.setAttribute("stroke", badge.accent);
  vehicleBadgeDot.setAttribute("fill", badge.accent);
  vehicleBadgeMake.setAttribute("fill", badge.color === "#111827" ? "#f6f1e8" : badge.accent);
  vehicleBadgeModel.setAttribute("fill", badge.color === "#111827" ? "#f6f1e8" : "#101314");
}

function dispatchBlueprintVehicle() {
  window.dispatchEvent(new CustomEvent("torquetune:vehicle-change", {
    detail: {
      vehicle: getVehicle(),
      label: getVehicleLabel()
    }
  }));
}

function dispatchBlueprintHighlight(area = sourceSelect.value) {
  const blueprintArea = blueprintSourceAreas[area] || area || "engine";
  window.torqueTuneBlueprintArea = blueprintArea;
  window.dispatchEvent(new CustomEvent("torquetune:highlight-area", {
    detail: {
      area: blueprintArea
    }
  }));
}

function blueprintAreaForDiagnosis(profile) {
  const searchable = `${profile?.id || ""} ${profile?.name || ""} ${profile?.summary || ""}`.toLowerCase();
  const keywordAreas = [
    ["wheel", ["brake", "rotor", "pad", "caliper", "abs", "cv ", "axle", "wheel", "tire", "bearing", "rim"]],
    ["underbody", ["exhaust", "catalytic", "converter", "heat shield", "underbody", "hanger", "pipe"]],
    ["transmission", ["transmission", "drivetrain", "differential", "shifting", "gear", "transfer case", "driveline"]],
    ["steering", ["steering", "power steering", "ball joint", "tie rod"]],
    ["cabin", ["cabin", "dash", "dashboard", "hvac", "blower", "window", "door lock", "seat"]],
    ["engine", ["engine", "belt", "oil", "coolant", "radiator", "pump", "fuel", "starter", "battery", "alternator", "misfire", "injector", "sensor"]]
  ];
  const keywordMatch = keywordAreas.find(([, terms]) => terms.some((term) => searchable.includes(term)));
  return keywordMatch?.[0]
    || profile?.context?.find((item) => blueprintDiagnosticAreas.includes(item))
    || blueprintSourceAreas[sourceSelect.value]
    || "engine";
}

function renderVehicleIssues() {
  const vehicle = getVehicle();
  const vehicleLabel = getVehicleLabel();
  vehicleIssueList.innerHTML = "";

  if (!vehicle.year || !vehicle.make || !vehicle.model) {
    vehicleIssuesNote.textContent = "Select year, make, and model to see common trouble spots.";
    return;
  }

  const matches = matchingVehicleIssueRules(vehicle);
  const engineIssues = engineSpecificIssues(vehicle);
  const issues = [
    ...engineIssues,
    ...(matches.length ? matches.flatMap((rule) => rule.issues) : fallbackVehicleIssues(vehicle))
  ];
  vehicleIssuesNote.textContent = matches.length
    ? `Commonly reported checks for ${vehicleLabel}.`
    : `No exact starter match yet for ${vehicleLabel}, so these are engine and age-based checks.`;

  issues.slice(0, 5).forEach(([title, detail]) => {
    const card = document.createElement("article");
    card.className = "vehicle-issue-card";

    const strong = document.createElement("strong");
    strong.textContent = title;

    const span = document.createElement("span");
    span.textContent = detail;

    card.append(strong, span);
    vehicleIssueList.append(card);
  });
}

function matchingVehicleIssueRules(vehicle) {
  const year = Number(vehicle.year);
  const make = normalizeText(vehicle.make);
  const model = normalizeText(vehicle.model);

  return commonVehicleIssueRules.filter((rule) => {
    const makeMatches = normalizeText(rule.make) === make;
    const yearMatches = year >= rule.years[0] && year <= rule.years[1];
    const modelMatches = rule.models.some((ruleModel) => {
      const normalizedRuleModel = normalizeText(ruleModel);
      return model.includes(normalizedRuleModel) || normalizedRuleModel.includes(model);
    });
    return makeMatches && yearMatches && modelMatches;
  });
}

function fallbackVehicleIssues(vehicle) {
  const year = Number(vehicle.year);
  const age = new Date().getFullYear() - year;

  if (age >= 15) {
    return [
      ["Rubber and gasket leaks", "Older vehicles commonly develop oil, coolant, vacuum, and power steering leaks."],
      ["Suspension wear", "Listen for clunks from shocks, struts, bushings, ball joints, and sway bar links."],
      ["Electrical corrosion", "Check grounds, connectors, window motors, door locks, and aging wiring."],
      ["Cooling system age", "Inspect radiator, water pump, thermostat, hoses, and fans."],
      ["Brake and tire condition", "Check pads, rotors, calipers, tires, wheel bearings, and alignment."]
    ];
  }

  if (age >= 7) {
    return [
      ["Battery and charging system", "Battery age, alternator output, and corroded terminals are common checks."],
      ["Belts, brakes, and tires", "Listen for belt chirps, brake squeal/grind, tire hum, or vibration."],
      ["Fluid leaks", "Inspect oil, coolant, transmission, brake, and power steering fluid areas."],
      ["Sensors and emissions", "Check engine lights often come from sensors, EVAP leaks, or fuel trim issues."],
      ["Suspension noise", "Clunks over bumps can come from links, bushings, struts, or mounts."]
    ];
  }

  return [
    ["Software and sensor updates", "Newer vehicles may need module scans, software updates, or sensor diagnosis."],
    ["Tire wear and alignment", "Modern tires can hum or vibrate early if pressure or alignment is off."],
    ["Brake noise", "Surface rust, pad compounds, or caliper hardware can cause squeal or grind."],
    ["Warranty-related checks", "Document noises with saved clips before visiting the dealer."],
    ["Fluid seepage", "Even newer cars can have coolant, oil, or AC refrigerant seepage."]
  ];
}

function engineSpecificIssues(vehicle) {
  const issues = [];
  const engine = normalizeText(vehicle.engine);
  const fuel = normalizeText(vehicle.fuel);
  const aspiration = normalizeText(vehicle.aspiration);
  const drivetrain = normalizeText(vehicle.drivetrain);
  const mileage = Number(vehicle.mileage);

  if (fuel === "electric") {
    issues.push(
      ["EV drivetrain noise", "Whine, hum, or vibration can come from drive units, wheel bearings, tires, or cooling pumps."],
      ["High-voltage cooling or HVAC", "Buzzing, fan roar, or weak heating/cooling can point to coolant pumps, heat pump, or compressor issues."]
    );
  }

  if (fuel === "diesel") {
    issues.push(
      ["Diesel injector or high-pressure fuel noise", "Sharp ticking, hard starts, smoke, or rough idle can point to injector or fuel pressure issues."],
      ["Turbo and emissions system checks", "Whine, hiss, loss of power, or warning lights can involve turbo plumbing, EGR, DPF, or DEF systems."]
    );
  }

  if (fuel.includes("hybrid")) {
    issues.push(
      ["Hybrid start-stop transition", "Shudder, clunk, or warning lights during engine on/off transitions can involve mounts, battery state, or hybrid controls."],
      ["Cooling fans and pumps", "Unusual electric pump or fan noise can relate to inverter, battery, or engine cooling loops."]
    );
  }

  if (aspiration.includes("turbo")) {
    issues.push(
      ["Turbo boost leak or wastegate rattle", "Hissing, whistling, rattling, or power loss under acceleration can point to boost plumbing or wastegate wear."],
      ["Turbo oil/cooling concerns", "Smoke, burning smell, or siren-like whine can point to turbo bearing or oil feed issues."]
    );
  }

  if (aspiration.includes("supercharged")) {
    issues.push(["Supercharger belt or bearing noise", "Chirp, squeal, whine, or grinding near the supercharger should be inspected quickly."]);
  }

  if (engine.includes("v8") || engine.includes("v6")) {
    issues.push(["Mounts and accessory drive", "Larger engines often make mount thuds, belt chirps, pulley noise, or exhaust leaks easier to hear."]);
  }

  if (engine.includes("i4") || engine.includes("4cyl") || engine.includes("4cylinder")) {
    issues.push(["Four-cylinder vibration checks", "Rough idle, mount wear, misfires, or balance-shaft related noise may feel more obvious."]);
  }

  if (drivetrain === "awd" || drivetrain === "4wd") {
    issues.push(["AWD/4WD driveline checks", "Binding, clicking, thuds, or whine can involve transfer case, driveshaft, CV axles, or differential fluids."]);
  }

  if (mileage >= 100000) {
    issues.push(["High-mileage wear items", "At this mileage, check belts/chains, mounts, wheel bearings, suspension, leaks, pumps, and charging system first."]);
  } else if (mileage > 0 && mileage < 36000) {
    issues.push(["Warranty documentation", "Save recordings and note exact conditions so a dealer can reproduce noises while warranty coverage may apply."]);
  }

  return issues;
}

function normalizeText(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function renderToolLinks() {
  renderManualLinks();
  renderReplacementLinks();
}

function renderManualLinks() {
  if (!manualLinks || !manualVehicleSummary) return;
  const vehicle = getVehicle();
  const vehicleName = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ");
  manualVehicleSummary.textContent = vehicleName
    ? `${vehicleName}${vehicle.engine ? ` - ${vehicle.engine}` : ""}`
    : "Select year, make, and model first.";

  if (!vehicle.year || !vehicle.make || !vehicle.model) {
    manualLinks.innerHTML = "";
    return;
  }

  const host = manualPortalHosts[vehicle.make];
  const manualQuery = `${vehicle.year} ${vehicle.make} ${vehicle.model} owners manual PDF`;
  const links = [
    {
      label: "Official manual search",
      detail: "Searches the maker's owner support/manual pages first.",
      url: host
        ? `https://www.google.com/search?q=${encodeURIComponent(`${manualQuery} site:${host}`)}`
        : `https://www.google.com/search?q=${encodeURIComponent(manualQuery)}`
    },
    {
      label: "NHTSA safety and recalls",
      detail: "Check recalls and safety information for this vehicle.",
      url: `https://www.nhtsa.gov/recalls?vin=${encodeURIComponent(vehicle.vin || "")}`
    },
    {
      label: "Web manual search",
      detail: "Fallback search if the official portal needs login or region selection.",
      url: `https://www.google.com/search?q=${encodeURIComponent(manualQuery)}`
    }
  ];
  manualLinks.innerHTML = links.map(linkCard).join("");
}

function renderReplacementLinks() {
  if (!replacementLinks || !partsVehicleSummary || !damageAssessment) return;
  const vehicle = getVehicle();
  const vehicleName = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ");
  const selectedArea = getSelectedDamagePart();
  const description = damageDescriptionInput.value.trim();
  const partQuery = [vehicleName, description || selectedArea, "replacement part"].filter(Boolean).join(" ");
  partsVehicleSummary.textContent = vehicleName
    ? `${vehicleName}${vehicle.engine ? ` - ${vehicle.engine}` : ""}`
    : "Select year, make, and model first.";

  if (!vehicleName) {
    replacementLinks.innerHTML = "";
    damageAssessment.textContent = "Select the vehicle first, then take a photo or choose a damaged part area.";
    return;
  }

  damageAssessment.textContent = `Replacement search prepared for: ${description || selectedArea}. Confirm trim, engine, side, and VIN fitment before buying.`;
  const links = [
    {
      label: "Parts search",
      detail: "Broad web search for exact fit replacement options.",
      url: `https://www.google.com/search?q=${encodeURIComponent(partQuery)}`
    },
    {
      label: "AutoZone fitment search",
      detail: "After opening, confirm year/make/model/engine on the retailer site.",
      url: `https://www.autozone.com/searchresult?searchText=${encodeURIComponent(partQuery)}`
    },
    {
      label: "O'Reilly fitment search",
      detail: "Use the vehicle selector there before purchasing.",
      url: `https://www.oreillyauto.com/search?q=${encodeURIComponent(partQuery)}`
    },
    {
      label: "RockAuto web search",
      detail: "Catalog results vary, so this opens a web search scoped to RockAuto.",
      url: `https://www.google.com/search?q=${encodeURIComponent(`${partQuery} site:rockauto.com`)}`
    },
    {
      label: "OEM part number search",
      detail: "Useful when body panels, lights, or trim have side/color/trim differences.",
      url: `https://www.google.com/search?q=${encodeURIComponent(`${partQuery} OEM part number`)}`
    }
  ];
  replacementLinks.innerHTML = links.map(linkCard).join("");
}

function linkCard(link) {
  return `
    <a class="link-card" href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">
      <strong>${escapeHtml(link.label)}</strong>
      <span>${escapeHtml(link.detail)}</span>
    </a>
  `;
}

function getSelectedDamagePart() {
  if (damageAreaSelect.value && damageAreaSelect.value !== "auto") return damageAreaSelect.value;
  const searchText = `${damageDescriptionInput.value} ${pendingMediaFile?.name || ""}`.toLowerCase();
  const match = damageAreaKeywords.find(([, keywords]) => keywords.some((keyword) => searchText.includes(keyword)));
  return match?.[0] || blueprintPartFromArea(sourceSelect.value);
}

function blueprintPartFromArea(area) {
  return {
    engine: "engine component",
    wheel: "brake wheel suspension part",
    underbody: "underbody exhaust part",
    transmission: "transmission drivetrain part",
    steering: "steering suspension part",
    cabin: "interior electrical part",
    unknown: "damaged car part"
  }[area] || "damaged car part";
}

async function decodeVin() {
  const vin = vinInput.value.trim().toUpperCase();
  if (!vin || vin.length < 11) {
    vinStatus.textContent = "Enter at least 11 VIN characters, ideally the full 17.";
    return;
  }

  vinStatus.textContent = "Decoding VIN with NHTSA...";
  try {
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`);
    const data = await response.json();
    const result = data.Results?.[0] || {};

    if (result.ModelYear) vehicleYearSelect.value = result.ModelYear;
    if (result.Make) vehicleMakeSelect.value = titleCase(result.Make);
    if (result.Model) vehicleModelInput.value = result.Model;
    if (result.FuelTypePrimary) engineFuelSelect.value = mapFuelType(result.FuelTypePrimary);
    if (result.DriveType) drivetrainSelect.value = mapDriveType(result.DriveType);

    const enginePieces = [
      result.DisplacementL ? `${result.DisplacementL}L` : "",
      result.EngineConfiguration || "",
      result.EngineCylinders ? `${result.EngineCylinders} cyl` : ""
    ].filter(Boolean);
    if (enginePieces.length) engineSpecInput.value = enginePieces.join(" ");

    saveVehicle();
    vinStatus.textContent = result.ErrorText && !result.ErrorText.startsWith("0")
      ? `VIN decoded with note: ${result.ErrorText}`
      : "VIN decoded and vehicle fields updated.";
  } catch {
    vinStatus.textContent = "VIN lookup could not connect. You can still enter vehicle details manually.";
  }
}

function mapFuelType(value) {
  const fuel = normalizeText(value);
  if (fuel.includes("electric")) return "electric";
  if (fuel.includes("diesel")) return "diesel";
  if (fuel.includes("hybrid")) return "hybrid";
  if (fuel.includes("gas") || fuel.includes("petrol")) return "gas";
  return "";
}

function mapDriveType(value) {
  const drive = normalizeText(value);
  if (drive.includes("awd") || drive.includes("allwheel")) return "AWD";
  if (drive.includes("4wd") || drive.includes("fourwheel")) return "4WD";
  if (drive.includes("rwd") || drive.includes("rear")) return "RWD";
  if (drive.includes("fwd") || drive.includes("front")) return "FWD";
  return "";
}

function titleCase(value) {
  return String(value || "").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function drawIdleWave() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0c0f10";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(246,241,232,.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < canvas.width; x += 8) {
    const y = canvas.height / 2 + Math.sin(x * 0.025) * 12 + Math.sin(x * 0.006) * 24;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawLiveWave() {
  if (!analyser) return;
  const data = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(data);
  ctx.fillStyle = "#0c0f10";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#58c4a6";
  ctx.beginPath();
  const slice = canvas.width / data.length;
  data.forEach((value, index) => {
    const x = index * slice;
    const y = (value / 255) * canvas.height;
    index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.strokeStyle = "rgba(240,195,95,.55)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i += 1) {
    const x = ((Date.now() / 18 + i * 110) % canvas.width);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  animationId = requestAnimationFrame(drawLiveWave);
}

async function startListening() {
  mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 1024;
  const source = audioContext.createMediaStreamSource(mediaStream);
  source.connect(analyser);
  startRecordingClip(mediaStream);
  listeningStartedAt = Date.now();
  document.body.classList.add("is-recording");
  recordButton.classList.add("is-active");
  recordLabel.textContent = "Stop and diagnose";
  statusText.textContent = "Listening now. Five seconds is enough for a first pass.";
  drawLiveWave();
}

function stopListening({ diagnose = true } = {}) {
  const wasListening = Boolean(mediaStream);
  const traits = diagnose && wasListening ? deriveTraits(Date.now() - listeningStartedAt) : null;
  if (mediaRecorder?.state === "recording") {
    mediaRecorder.stop();
  }
  mediaStream?.getTracks().forEach((track) => track.stop());
  audioContext?.close();
  cancelAnimationFrame(animationId);
  mediaStream = null;
  audioContext = null;
  analyser = null;
  document.body.classList.remove("is-recording");
  recordButton.classList.remove("is-active");
  recordLabel.textContent = "Start listening";
  if (traits) {
    statusText.textContent = "Analyzing pitch, roughness, rhythm, and your driving context.";
    pendingRecordingDiagnosis = updateDiagnosis(traits);
  }
}

function startRecordingClip(stream) {
  recordingChunks = [];
  pendingRecordingDiagnosis = null;

  if (!window.MediaRecorder) {
    statusText.textContent = "Listening works here, but this browser cannot save playback clips.";
    return;
  }

  try {
    const options = preferredRecorderOptions();
    mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data?.size) recordingChunks.push(event.data);
    });
    mediaRecorder.addEventListener("stop", () => {
      const type = mediaRecorder.mimeType || options.mimeType || "audio/webm";
      const blob = new Blob(recordingChunks, { type });
      const diagnosis = pendingRecordingDiagnosis;
      recordingChunks = [];
      mediaRecorder = null;
      pendingRecordingDiagnosis = null;
      if (diagnosis && blob.size) {
        saveRecording(blob, diagnosis, "Recorded clip").catch(() => {
          statusText.textContent = "Diagnosis complete, but the recording could not be saved for playback.";
        });
      }
    });
    mediaRecorder.start();
  } catch {
    mediaRecorder = null;
    statusText.textContent = "Listening works here, but this browser cannot save playback clips.";
  }
}

function preferredRecorderOptions() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  const mimeType = candidates.find((type) => MediaRecorder.isTypeSupported?.(type));
  return mimeType ? { mimeType } : {};
}

function deriveTraits(durationMs = 5200) {
  const frequencyData = new Uint8Array(analyser?.frequencyBinCount || 512);
  if (analyser) analyser.getByteFrequencyData(frequencyData);
  const bins = Array.from(frequencyData);
  const low = average(bins.slice(0, 45));
  const mid = average(bins.slice(45, 145));
  const high = average(bins.slice(145));
  const energy = low + mid + high;
  const durationFactor = Math.min(1, durationMs / 6000);
  const source = sourceSelect.value;
  const condition = conditionSelect.value;

  if (!analyser || energy < 8) {
    return normalizeTraits(contextFallbackProfile().signature);
  }

  return normalizeTraits({
    rattle: (mid * 0.62 + high * 0.16 + contextBoost(source, ["underbody"], 22) + contextBoost(condition, ["bumps"], 12)) * durationFactor + 6,
    squeal: (high * 0.72 + contextBoost(condition, ["braking"], 18) + contextBoost(source, ["cabin"], 10)) * durationFactor + 6,
    knock: (low * 0.78 + mid * 0.2 + contextBoost(condition, ["accelerating", "bumps"], 18)) * durationFactor + 6,
    grind: (mid * 0.56 + high * 0.24 + contextBoost(condition, ["braking"], 26)) * durationFactor + 4,
    click: (low * 0.25 + mid * 0.38 + contextBoost(condition, ["turning"], 32) + contextBoost(source, ["wheel"], 16)) * durationFactor + 4,
    chirp: (high * 0.66 + contextBoost(source, ["engine", "cabin"], 16) + contextBoost(condition, ["idle"], 8)) * durationFactor + 5,
    whine: (high * 0.5 + mid * 0.25 + contextBoost(condition, ["accelerating"], 26) + contextBoost(source, ["transmission", "steering"], 24)) * durationFactor + 5,
    hiss: (high * 0.48 + contextBoost(condition, ["hot"], 34) + contextBoost(source, ["engine"], 12)) * durationFactor + 3,
    thud: (low * 0.74 + contextBoost(condition, ["shifting", "bumps"], 28) + contextBoost(source, ["transmission"], 18)) * durationFactor + 4
  });
}

async function analyzeUpload(file) {
  statusText.textContent = `Loaded ${file.name}. Running a quick sound fingerprint.`;
  const fingerprint = await fingerprintFile(file);
  const diagnosis = updateDiagnosis(fingerprint.traits);
  saveRecording(file, diagnosis, "Uploaded clip").catch(() => {
    statusText.textContent = "Diagnosis complete, but the uploaded clip could not be saved for playback.";
  });
}

async function fingerprintFile(file) {
  const buffer = await file.arrayBuffer();
  const decodeContext = new AudioContext();
  try {
    const audioBuffer = await decodeContext.decodeAudioData(buffer.slice(0));
    const samples = audioBuffer.getChannelData(0);
    const traits = deriveUploadedTraits(samples, audioBuffer.sampleRate, sourceSelect.value, conditionSelect.value);
    return {
      traits: normalizeTraits(traits),
      duration: audioBuffer.duration
    };
  } finally {
    await decodeContext.close().catch(() => {});
  }
}

function deriveUploadedTraits(samples, sampleRate, source, condition) {
  let crossings = 0;
  let peak = 0;
  let energy = 0;
  const stride = Math.max(1, Math.floor(samples.length / sampleRate));
  for (let i = stride; i < samples.length; i += stride) {
    const value = samples[i];
    const prev = samples[i - stride];
    if ((value >= 0 && prev < 0) || (value < 0 && prev >= 0)) crossings += 1;
    peak = Math.max(peak, Math.abs(value));
    energy += value * value;
  }
  const sampled = samples.length / stride;
  const zcr = crossings / Math.max(1, sampled);
  const rms = Math.sqrt(energy / Math.max(1, sampled));

  return {
    rattle: zcr * 250 + rms * 120 + contextBoost(source, ["underbody"], 16),
    squeal: zcr * 360 + contextBoost(condition, ["braking"], 24) + contextBoost(source, ["cabin"], 10),
    knock: peak * 90 + contextBoost(condition, ["accelerating", "bumps"], 18),
    grind: rms * 150 + zcr * 180 + contextBoost(condition, ["braking"], 28),
    click: peak * 88 + contextBoost(condition, ["turning"], 30) + contextBoost(source, ["wheel"], 14),
    chirp: zcr * 300 + contextBoost(source, ["engine", "cabin"], 18),
    whine: zcr * 220 + rms * 80 + contextBoost(condition, ["accelerating"], 28) + contextBoost(source, ["transmission", "steering"], 28),
    hiss: zcr * 240 + rms * 70 + contextBoost(condition, ["hot"], 34) + contextBoost(source, ["engine"], 12) - peak * 20,
    thud: peak * 92 + contextBoost(condition, ["shifting", "bumps"], 30) + contextBoost(source, ["transmission"], 18)
  };
}

function updateDiagnosis(traits) {
  const ranked = candidateProfiles()
    .map((profile) => ({ profile, score: scoreProfile(profile, traits) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0].profile;
  const confidence = Math.round(Math.min(96, Math.max(54, ranked[0].score)));
  const vehicleLabel = getVehicleLabel();

  resultTitle.textContent = best.name;
  resultSummary.textContent = vehicleLabel ? `${best.summary} Vehicle noted: ${vehicleLabel}.` : best.summary;
  confidenceBadge.textContent = `${confidence}% match`;
  rattleMeter.value = traits.rattle;
  squealMeter.value = traits.squeal;
  knockMeter.value = traits.knock;
  stepsList.innerHTML = best.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
  matchList.innerHTML = ranked.slice(0, 3).map(({ profile, score }) => `
    <article class="match-card">
      <strong>${escapeHtml(profile.name)}</strong>
      <span>${Math.round(score)}% similarity - ${escapeHtml(profile.urgency)}</span>
    </article>
  `).join("");
  statusText.textContent = `${best.urgency}: this is an assistive estimate, not a replacement for a mechanic's inspection.`;
  dispatchBlueprintHighlight(blueprintAreaForDiagnosis(best));
  return { best, confidence, traits };
}

function candidateProfiles() {
  const privateCandidates = privateSoundLibrary.map((sample) => {
    const base = profileById[sample.issueId] || diagnosticProfiles[0];
    return {
      ...base,
      context: [...new Set([sample.source, sample.condition, ...base.context])],
      signature: sample.signature,
      privateSample: true
    };
  });
  return [...privateCandidates, ...diagnosticProfiles];
}

function scoreProfile(profile, traits) {
  const keys = Object.keys(profile.signature);
  const traitDistance = keys.reduce((sum, key) => sum + Math.abs((profile.signature[key] || 0) - (traits[key] || 0)), 0);
  const contextMatch = profile.context.includes(sourceSelect.value) || profile.context.includes(conditionSelect.value);
  const contextScore = contextMatch ? 18 : 0;
  const categoryScore = symptomCategorySelect.value && profile.context.includes(symptomCategorySelect.value) ? 12 : 0;
  const privateScore = profile.privateSample ? 5 : 0;
  const vehicleScore = vehicleAgeScore(profile);
  return clamp(100 - traitDistance / keys.length + contextScore + categoryScore + privateScore + vehicleScore);
}

function vehicleAgeScore(profile) {
  const year = Number(vehicleYearSelect.value);
  const vehicle = getVehicle();
  const searchable = `${profile.id} ${profile.name} ${profile.summary}`.toLowerCase();
  let score = 0;

  if (year) {
    const age = new Date().getFullYear() - year;
    const olderVehicleIssues = ["leak", "wear", "worn", "failure", "corrosion", "battery", "alternator", "pump", "belt", "chain", "sensor", "bushing", "mount", "strut", "spring", "joint", "caliper", "converter", "rust"];
    const newerVehicleIssues = ["software", "sensor", "communication", "ecu", "pcm"];

    if (age >= 10 && olderVehicleIssues.some((term) => searchable.includes(term))) score += 4;
    if (age <= 5 && newerVehicleIssues.some((term) => searchable.includes(term))) score += 3;
  }

  const fuel = normalizeText(vehicle.fuel);
  const aspiration = normalizeText(vehicle.aspiration);
  const drivetrain = normalizeText(vehicle.drivetrain);
  const mileage = Number(vehicle.mileage);

  if (fuel === "diesel" && ["injector", "fuel", "turbo", "emissions", "rough", "stall"].some((term) => searchable.includes(term))) score += 3;
  if (fuel === "electric" && ["software", "sensor", "tire", "wheel", "hvac", "suspension"].some((term) => searchable.includes(term))) score += 3;
  if (fuel.includes("hybrid") && ["battery", "cooling", "software", "sensor", "stall"].some((term) => searchable.includes(term))) score += 2;
  if (aspiration.includes("turbo") && ["hiss", "whine", "loss", "power", "turbo", "oil"].some((term) => searchable.includes(term))) score += 3;
  if ((drivetrain === "awd" || drivetrain === "4wd") && ["driveline", "differential", "transfer", "cv", "wheel", "vibration", "thud"].some((term) => searchable.includes(term))) score += 3;
  if (mileage >= 100000 && ["wear", "worn", "leak", "bearing", "mount", "joint", "pump", "belt", "chain"].some((term) => searchable.includes(term))) score += 3;

  return score;
}

function contextFallbackProfile() {
  return diagnosticProfiles.find((profile) => profile.context.includes(sourceSelect.value) && profile.context.includes(conditionSelect.value))
    || diagnosticProfiles.find((profile) => profile.context.includes(conditionSelect.value))
    || diagnosticProfiles.find((profile) => profile.context.includes(sourceSelect.value))
    || diagnosticProfiles[0];
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function contextBoost(value, matches, amount) {
  return matches.includes(value) ? amount : 0;
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function normalizeTraits(traits) {
  const normalized = {};
  ["rattle", "squeal", "knock", "grind", "click", "chirp", "whine", "hiss", "thud"].forEach((key) => {
    normalized[key] = Math.round(clamp(traits[key] || 0));
  });
  return normalized;
}

async function saveRecording(blob, diagnosis, sourceType) {
  const mediaBlob = pendingMediaFile ? pendingMediaFile.slice(0, pendingMediaFile.size, pendingMediaFile.type) : null;
  const record = {
    id: createId(),
    blob,
    mimeType: blob.type || "audio/webm",
    createdAt: new Date().toISOString(),
    diagnosisName: diagnosis.best.name,
    urgency: diagnosis.best.urgency,
    confidence: diagnosis.confidence,
    sourceType,
    vehicle: getVehicleLabel() || "Vehicle not set",
    vehicleData: getVehicle(),
    customer: getCustomer(),
    soundSource: labelFor(sourceSelect, sourceSelect.value),
    condition: labelFor(conditionSelect, conditionSelect.value),
    mechanicNote: mechanicNoteInput.value.trim(),
    mediaBlob,
    mediaType: pendingMediaFile?.type || "",
    mediaName: pendingMediaFile?.name || "",
    trainingCandidate: false
  };

  await putRecording(record);
  pendingMediaFile = null;
  if (mediaUpload) mediaUpload.value = "";
  if (mediaFileName) mediaFileName.textContent = "No photo or video attached.";
  await renderSavedRecordings();
  statusText.textContent = `${diagnosis.best.urgency}: clip saved below for mechanic playback.`;
}

function openRecordingsDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const request = indexedDB.open(recordingsDbName, 1);
    request.addEventListener("upgradeneeded", () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(recordingsStoreName)) {
        db.createObjectStore(recordingsStoreName, { keyPath: "id" });
      }
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

async function withRecordingsStore(mode, action) {
  const db = await openRecordingsDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(recordingsStoreName, mode);
    const store = transaction.objectStore(recordingsStoreName);
    const request = action(store);
    request.addEventListener("error", () => reject(request.error));
    transaction.addEventListener("complete", () => {
      db.close();
      resolve(request.result);
    });
    transaction.addEventListener("error", () => {
      db.close();
      reject(transaction.error);
    });
  });
}

function putRecording(record) {
  return withRecordingsStore("readwrite", (store) => store.put(record));
}

function getRecordings() {
  return withRecordingsStore("readonly", (store) => store.getAll());
}

function deleteRecording(id) {
  return withRecordingsStore("readwrite", (store) => store.delete(id));
}

async function updateRecording(id, updates) {
  const recordings = await getRecordings();
  const existing = recordings.find((recording) => recording.id === id);
  if (!existing) return;
  await putRecording({ ...existing, ...updates, updatedAt: new Date().toISOString() });
}

async function renderSavedRecordings() {
  if (!recordingList || !recordingsNote || !window.indexedDB) return;

  let recordings = [];
  try {
    recordings = await getRecordings();
  } catch {
    recordingsNote.textContent = "Saved playback is unavailable in this browser.";
    return;
  }

  recordingUrls.forEach((url) => URL.revokeObjectURL(url));
  recordingUrls = [];
  recordings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  recordingsNote.textContent = recordings.length
    ? `${recordings.length} saved clip${recordings.length === 1 ? "" : "s"} ready for playback.`
    : "Diagnosed clips you record or upload will appear here for playback.";
  recordingList.innerHTML = "";

  recordings.slice(0, 8).forEach((recording) => {
    const card = document.createElement("article");
    card.className = "recording-card";

    const title = document.createElement("strong");
    title.textContent = recording.diagnosisName;

    const details = document.createElement("span");
    details.textContent = `${recording.sourceType} - ${recording.confidence}% match - ${recording.vehicle || "Vehicle not set"} - ${recording.soundSource} - ${recording.condition} - ${formatDate(recording.createdAt)}`;

    const audio = document.createElement("audio");
    const url = URL.createObjectURL(recording.blob);
    recordingUrls.push(url);
    audio.controls = true;
    audio.src = url;

    const note = document.createElement("textarea");
    note.className = "recording-note-input";
    note.dataset.recordingNote = recording.id;
    note.placeholder = "Add mechanic notes, inspected parts, repair estimate, or customer comments";
    note.value = recording.mechanicNote || "";

    if (recording.mediaBlob) {
      const mediaUrl = URL.createObjectURL(recording.mediaBlob);
      recordingUrls.push(mediaUrl);
      const media = recording.mediaType.startsWith("video/") ? document.createElement("video") : document.createElement("img");
      if (media.tagName === "VIDEO") media.controls = true;
      media.src = mediaUrl;
      media.alt = recording.mediaName || "Attached vehicle media";
      card.append(title, details, audio, media, note);
    } else {
      card.append(title, details, audio, note);
    }

    const actions = document.createElement("div");
    actions.className = "recording-actions";

    const saveNoteButton = document.createElement("button");
    saveNoteButton.className = "text-button";
    saveNoteButton.type = "button";
    saveNoteButton.dataset.saveRecordingNote = recording.id;
    saveNoteButton.textContent = "Save note";

    const trainingButton = document.createElement("button");
    trainingButton.className = "text-button";
    trainingButton.type = "button";
    trainingButton.dataset.toggleTraining = recording.id;
    trainingButton.textContent = recording.trainingCandidate ? "Training set: yes" : "Mark for AI training";

    const reportButton = document.createElement("button");
    reportButton.className = "text-button";
    reportButton.type = "button";
    reportButton.dataset.exportRecording = recording.id;
    reportButton.textContent = "Report";

    const removeButton = document.createElement("button");
    removeButton.className = "text-button";
    removeButton.type = "button";
    removeButton.dataset.deleteRecording = recording.id;
    removeButton.textContent = "Remove";

    actions.append(saveNoteButton, trainingButton, reportButton, removeButton);
    card.append(actions);
    recordingList.append(card);
  });

  renderMechanicDashboard(recordings);
}

function renderMechanicDashboard(recordings = []) {
  if (!mechanicDashboard) return;
  const trainingCount = recordings.filter((recording) => recording.trainingCandidate).length;
  const withMedia = recordings.filter((recording) => recording.mediaBlob).length;
  const highPriority = recordings.filter((recording) => /high/i.test(recording.urgency || "") || Number(recording.confidence) >= 85).length;
  const last = recordings[0]?.diagnosisName || "No diagnosis yet";
  const customer = getCustomer();
  const cards = [
    [`${recordings.length}`, "Saved clips"],
    [`${highPriority}`, "High-priority checks"],
    [`${withMedia}`, "Photo/video attachments"],
    [`${trainingCount}`, "Future AI training clips"],
    [customer.name || "Guest", "Local profile"],
    [getVehicleLabel() || "Vehicle not set", "Selected vehicle"],
    [last, "Latest diagnosis"]
  ];
  mechanicDashboard.innerHTML = cards.map(([value, label]) => `
    <article class="dashboard-card">
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(label)}</span>
    </article>
  `).join("");
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function labelFor(select, value) {
  return Array.from(select.options).find((option) => option.value === value)?.textContent || value;
}

function createId() {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createMechanicReport(recordings) {
  const vehicle = getVehicleLabel() || "Vehicle not set";
  const customer = getCustomer();
  const lines = [
    "MK7TORQUETUNE mechanic report",
    `Created: ${new Date().toLocaleString()}`,
    `Customer: ${customer.name || "Not set"}`,
    `Contact: ${customer.contact || "Not set"}`,
    `Vehicle: ${vehicle}`,
    "",
    "Saved clips:"
  ];

  if (!recordings.length) {
    lines.push("No saved clips yet.");
  }

  recordings.forEach((recording, index) => {
    lines.push(
      "",
      `${index + 1}. ${recording.diagnosisName}`,
      `Confidence: ${recording.confidence}%`,
      `Urgency: ${recording.urgency || "Not stored"}`,
      `Recorded/uploaded: ${formatDate(recording.createdAt)}`,
      `Source: ${recording.soundSource} / ${recording.condition}`,
      `Vehicle then: ${recording.vehicle || "Vehicle not set"}`,
      `Note: ${recording.mechanicNote || "None"}`,
      `Attached media: ${recording.mediaName || "None"}`,
      `Marked for future AI training: ${recording.trainingCandidate ? "Yes" : "No"}`
    );
  });

  lines.push("", "Important: confirm all diagnosis and replacement part fitment with a qualified mechanic.");
  return lines.join("\n");
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function resetApp() {
  stopListening({ diagnose: false });
  resultTitle.textContent = "Ready for a sound sample";
  resultSummary.textContent = "Record 5-8 seconds of the noise or upload an audio clip. The prototype listens for pitch, harshness, rhythm, and context to suggest likely problems.";
  confidenceBadge.textContent = "Waiting";
  rattleMeter.value = 0;
  squealMeter.value = 0;
  knockMeter.value = 0;
  stepsList.innerHTML = `
    <li>Capture a short clip close to the sound source.</li>
    <li>Add driving context before recording for a better match.</li>
    <li>Do not keep driving if the sound is loud, metallic, or paired with warning lights.</li>
  `;
  matchList.innerHTML = "";
  statusText.textContent = "Hold your phone near the sound: engine bay, wheels or brakes, underbody, drivetrain, or cabin.";
  drawIdleWave();
}

vehicleYearSelect.addEventListener("change", saveVehicle);
vehicleMakeSelect.addEventListener("change", saveVehicle);
vehicleModelInput.addEventListener("input", saveVehicle);
engineFuelSelect.addEventListener("change", saveVehicle);
engineSpecInput.addEventListener("input", saveVehicle);
engineAspirationSelect.addEventListener("change", saveVehicle);
drivetrainSelect.addEventListener("change", saveVehicle);
mileageInput.addEventListener("input", saveVehicle);
vinInput.addEventListener("input", saveVehicle);
customerNameInput.addEventListener("input", saveCustomer);
customerContactInput.addEventListener("input", saveCustomer);
vinLookupButton.addEventListener("click", decodeVin);
sourceSelect.addEventListener("change", () => dispatchBlueprintHighlight());
symptomCategorySelect.addEventListener("change", () => {
  if (symptomCategorySelect.value) {
    sourceSelect.value = symptomCategorySelect.value;
    dispatchBlueprintHighlight(symptomCategorySelect.value);
  }
});
refreshManualButton.addEventListener("click", renderManualLinks);
damageAreaSelect.addEventListener("change", renderReplacementLinks);
damageDescriptionInput.addEventListener("input", renderReplacementLinks);

mediaUpload.addEventListener("change", (event) => {
  pendingMediaFile = event.target.files?.[0] || null;
  mediaFileName.textContent = pendingMediaFile ? `Attached: ${pendingMediaFile.name}` : "No photo or video attached.";
});

damagePhotoInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const guessedPart = damageAreaKeywords.find(([, keywords]) => keywords.some((keyword) => file.name.toLowerCase().includes(keyword)))?.[0];
  if (guessedPart && damageAreaSelect.value === "auto") {
    damageAssessment.textContent = `Photo loaded. Auto guess: ${guessedPart}. Confirm the part area before buying.`;
  }
  damagePreview.innerHTML = "";
  const image = document.createElement("img");
  image.src = url;
  image.alt = "Damaged vehicle part preview";
  image.addEventListener("load", () => URL.revokeObjectURL(url), { once: true });
  damagePreview.append(image);
  pendingMediaFile = file;
  mediaFileName.textContent = `Attached: ${file.name}`;
  renderReplacementLinks();
});

window.addEventListener("torquetune:blueprint-select", (event) => {
  const area = event.detail?.area;
  if (!area || area === sourceSelect.value) return;
  const option = Array.from(sourceSelect.options).find((item) => item.value === area);
  if (!option) return;
  sourceSelect.value = area;
  dispatchBlueprintHighlight(area);
});

recordButton.addEventListener("click", async () => {
  try {
    if (mediaStream) {
      stopListening();
    } else {
      await startListening();
    }
  } catch (error) {
    statusText.textContent = "Microphone access was blocked. You can still upload an audio clip.";
  }
});

audioUpload.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) analyzeUpload(file).catch(() => {
    statusText.textContent = "That audio file could not be decoded. Try a shorter MP3, M4A, or WAV clip.";
  });
});

recordingList.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest("[data-delete-recording]");
  const noteButton = event.target.closest("[data-save-recording-note]");
  const trainingButton = event.target.closest("[data-toggle-training]");
  const reportButton = event.target.closest("[data-export-recording]");

  try {
    if (deleteButton) {
      if (!window.confirm("Remove this saved recording from this browser?")) return;
      await deleteRecording(deleteButton.dataset.deleteRecording);
      await renderSavedRecordings();
      return;
    }

    if (noteButton) {
      const note = recordingList.querySelector(`[data-recording-note="${noteButton.dataset.saveRecordingNote}"]`)?.value || "";
      await updateRecording(noteButton.dataset.saveRecordingNote, { mechanicNote: note });
      await renderSavedRecordings();
      statusText.textContent = "Mechanic note saved.";
      return;
    }

    if (trainingButton) {
      const recordings = await getRecordings();
      const record = recordings.find((recording) => recording.id === trainingButton.dataset.toggleTraining);
      await updateRecording(trainingButton.dataset.toggleTraining, { trainingCandidate: !record?.trainingCandidate });
      await renderSavedRecordings();
      statusText.textContent = "AI training flag updated locally.";
      return;
    }

    if (reportButton) {
      const recordings = await getRecordings();
      const record = recordings.find((recording) => recording.id === reportButton.dataset.exportRecording);
      if (record) downloadTextFile(`MK7TORQUETUNE-${record.id}.txt`, createMechanicReport([record]));
    }
  } catch {
    statusText.textContent = "That saved recording action could not be completed.";
  }
});

exportAllReportButton.addEventListener("click", async () => {
  try {
    const recordings = await getRecordings();
    recordings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    downloadTextFile("MK7TORQUETUNE-mechanic-report.txt", createMechanicReport(recordings));
  } catch {
    statusText.textContent = "The mechanic report could not be exported.";
  }
});

resetButton.addEventListener("click", resetApp);
hydrateVehicleControls();
drawIdleWave();
renderSavedRecordings();
renderMechanicDashboard();
