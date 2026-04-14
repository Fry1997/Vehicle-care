(function(){
'use strict';

// ---- src/utils.js ----
const STATUS_META = {
  green: { label: 'Green', tone: 'green' },
  amber: { label: 'Amber', tone: 'amber' },
  red: { label: 'Red', tone: 'red' },
  critical: { label: 'Critical', tone: 'critical' },
  grey: { label: 'Unknown', tone: 'grey' },
};

const PRIORITY_ORDER = ['critical', 'red', 'amber', 'green', 'grey'];

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '—';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function addMonths(dateString, months) {
  const date = parseDate(dateString);
  if (!date || !months) return null;
  const clone = new Date(date);
  clone.setMonth(clone.getMonth() + Number(months));
  return clone.toISOString().split('T')[0];
}

function daysBetween(targetDateString, fromDateString = todayISO()) {
  const target = parseDate(targetDateString);
  const from = parseDate(fromDateString);
  if (!target || !from) return null;
  const diffMs = target.getTime() - from.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function chooseWorstStatus(statuses = []) {
  for (const priority of PRIORITY_ORDER) {
    if (statuses.includes(priority)) return priority;
  }
  return 'grey';
}

function escapeHtml(input = '') {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function badge(status) {
  const meta = STATUS_META[status] || STATUS_META.grey;
  return `<span class="badge badge--${meta.tone}">${meta.label}</span>`;
}

function pluralise(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function sum(values = []) {
  return values.reduce((acc, value) => acc + (Number(value) || 0), 0);
}

function maybeNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function normaliseArray(value) {
  return Array.isArray(value) ? value : [];
}

function lineBreakList(items = []) {
  if (!items.length) return '<span class="muted">None</span>';
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

function mileageDistance(currentMileage, targetMileage) {
  if (!currentMileage || !targetMileage) return null;
  return Number(targetMileage) - Number(currentMileage);
}

function progressPercent(value, total) {
  if (!total || total <= 0) return 0;
  return clamp(Math.round((value / total) * 100), 0, 100);
}

// ---- src/seed.js ----

const EQUIPMENT_CATALOG = [
  {
    id: 'tread-gauge',
    name: 'Tread depth gauge',
    tier: 'core',
    usedFor: ['Tyre monthly check', 'Before long trip', 'Winter check'],
    guidance: 'Lets the owner record measured tread depth in mm rather than guessing.',
  },
  {
    id: 'pressure-gauge',
    name: 'Tyre pressure gauge',
    tier: 'core',
    usedFor: ['Tyre monthly check', 'Before long trip'],
    guidance: 'Useful even if the compressor has a built-in gauge, so readings can be checked twice.',
  },
  {
    id: 'inflator',
    name: 'Portable inflator',
    tier: 'core',
    usedFor: ['Tyre monthly check', 'Before long trip'],
    guidance: 'Supports small top-ups and quick reactions to TPMS warnings.',
  },
  {
    id: 'torch',
    name: 'Torch',
    tier: 'core',
    usedFor: ['Monthly walkaround', 'Night-time breakdown', 'Winter check'],
    guidance: 'Makes it realistic to check tyres, leaks, lights and document details after dark.',
  },
  {
    id: 'screenwash',
    name: 'Screenwash',
    tier: 'core',
    usedFor: ['Monthly mechanical check', 'Winter check'],
    guidance: 'A simple item, but frequently the difference between a safe journey and poor visibility.',
  },
  {
    id: 'jump-pack',
    name: 'Jump leads or jump starter',
    tier: 'core',
    usedFor: ['Winter check', 'Battery readiness'],
    guidance: 'Useful for a weak 12V battery or a car that has been standing.',
  },
  {
    id: 'ice-kit',
    name: 'Ice scraper and de-icer',
    tier: 'core',
    usedFor: ['Winter check'],
    guidance: 'Helps the user prep for cold-weather visibility and frozen glass.',
  },
  {
    id: 'phone-power',
    name: 'Phone charger or battery pack',
    tier: 'core',
    usedFor: ['Breakdown readiness', 'Long-trip check'],
    guidance: 'Important when the phone is needed for navigation, recovery or insurer contact.',
  },
  {
    id: 'obd',
    name: 'OBD scanner',
    tier: 'capable owner',
    usedFor: ['Warning light follow-up'],
    guidance: 'Useful for reading codes, but it does not replace diagnosis or safe repair practice.',
  },
  {
    id: 'charger',
    name: 'Battery charger / maintainer',
    tier: 'capable owner',
    usedFor: ['Battery support', 'Stored vehicle'],
    guidance: 'Helpful for infrequently driven vehicles or winter weakness.',
  },
  {
    id: 'torque-wrench',
    name: 'Torque wrench',
    tier: 'advanced',
    usedFor: ['Wheel removal'],
    guidance: 'Torque-critical. Tasks involving wheel fitment should use correct settings.',
  },
  {
    id: 'stands',
    name: 'Axle stands and wheel chocks',
    tier: 'advanced',
    usedFor: ['Supported DIY work'],
    guidance: 'Safety-critical support equipment. Not for casual or unsupported use.',
  },
];

const CHECKLIST_TEMPLATES = [
  {
    id: 'monthly-mechanical',
    title: 'Monthly mechanical owner check',
    frequency: 'monthly',
    seasonal: false,
    items: [
      { id: uid('chk'), label: 'Tyre tread depth measured', equipment: ['tread-gauge'] },
      { id: uid('chk'), label: 'Tyre pressures checked', equipment: ['pressure-gauge', 'inflator'] },
      { id: uid('chk'), label: 'Tyre sidewalls inspected', equipment: ['torch'] },
      { id: uid('chk'), label: 'Engine oil level checked', equipment: ['torch'] },
      { id: uid('chk'), label: 'Coolant level checked', equipment: ['torch'] },
      { id: uid('chk'), label: 'Washer fluid topped if needed', equipment: ['screenwash'] },
      { id: uid('chk'), label: 'Lights checked', equipment: ['torch'] },
      { id: uid('chk'), label: 'Wipers and washers checked', equipment: ['screenwash'] },
      { id: uid('chk'), label: 'Warning lights reviewed', equipment: [] },
      { id: uid('chk'), label: 'Leaks under vehicle checked', equipment: ['torch'] },
    ],
  },
  {
    id: 'winter-readiness',
    title: 'Winter readiness',
    frequency: 'annual',
    seasonal: true,
    items: [
      { id: uid('chk'), label: 'Tyres have suitable tread for wet and cold conditions', equipment: ['tread-gauge'] },
      { id: uid('chk'), label: 'Battery behaviour reviewed', equipment: ['jump-pack'] },
      { id: uid('chk'), label: 'Lights and demisters checked', equipment: ['torch'] },
      { id: uid('chk'), label: 'Screenwash suitable for winter', equipment: ['screenwash'] },
      { id: uid('chk'), label: 'De-icer and scraper packed', equipment: ['ice-kit'] },
      { id: uid('chk'), label: 'Phone charger and emergency gear packed', equipment: ['phone-power'] },
    ],
  },
];

function createSeedState() {
  const vehicleId = uid('vehicle');
  const motId = uid('mot');
  const serviceRuleId = uid('rule');
  const tyreCheckId = uid('tyre');
  const symptomId = uid('sym');
  const garageId = uid('garage');

  return {
    appMeta: {
      title: 'Vehicle Care System',
      createdAt: todayISO(),
    },
    user: {
      id: uid('user'),
      name: 'Primary Owner',
    },
    vehicles: [
      {
        id: vehicleId,
        registration: 'AB12 CDE',
        make: 'Ford',
        model: 'Focus',
        trim: 'Titanium',
        year: 2019,
        vin: 'WF0KXXGCBKAA12345',
        powertrain: 'petrol',
        transmission: 'manual',
        currentMileage: 58240,
        dateAcquired: '2022-09-17',
        purchasePrice: 12995,
        ownershipNotes: 'Family car with mixed town and motorway use.',
        motRecords: [
          {
            id: motId,
            testDate: '2026-02-21',
            recordedMileage: 57620,
            result: 'pass',
            dueDate: '2027-02-21',
            certificateRef: 'MOT-2026-112233',
            failures: [],
            advisories: [
              {
                id: uid('adv'),
                text: 'Rear tyres wearing close to legal limit',
                component: 'tyres',
                status: 'amber',
              },
              {
                id: uid('adv'),
                text: 'Brake fluid due by age',
                component: 'brakes',
                status: 'amber',
              },
            ],
          },
        ],
        recalls: [
          {
            id: uid('recall'),
            title: 'No open recalls recorded',
            status: 'green',
            urgency: 'monitor',
            details: 'Manual entry only in v1. Future version can connect to official lookup sources.',
            actionBy: '',
          },
        ],
        maintenanceRules: [
          {
            id: serviceRuleId,
            title: 'Engine oil and filter',
            component: 'engine',
            category: 'service',
            intervalMonths: 12,
            intervalMiles: 10000,
            scheduleType: 'whichever-first',
            lastDoneDate: '2025-08-19',
            lastDoneMileage: 50410,
            amberDays: 30,
            amberMiles: 1000,
            redDays: 0,
            redMiles: 0,
            taskType: 'garage',
            notes: 'Use manufacturer-spec oil only.',
          },
          {
            id: uid('rule'),
            title: 'Brake fluid renewal',
            component: 'brakes',
            category: 'fluid',
            intervalMonths: 24,
            intervalMiles: null,
            scheduleType: 'date',
            lastDoneDate: '2024-04-10',
            lastDoneMileage: 40110,
            amberDays: 45,
            amberMiles: null,
            redDays: 0,
            redMiles: null,
            taskType: 'garage',
            notes: 'MOT advisory suggests booking this.',
          },
          {
            id: uid('rule'),
            title: 'Tyre inspection',
            component: 'tyres',
            category: 'inspection',
            intervalMonths: 1,
            intervalMiles: null,
            scheduleType: 'date',
            lastDoneDate: '2026-03-01',
            lastDoneMileage: 57910,
            amberDays: 5,
            amberMiles: null,
            redDays: 0,
            redMiles: null,
            taskType: 'owner-check',
            notes: 'Monthly check and before long trips.',
          },
          {
            id: uid('rule'),
            title: 'Timing belt inspection milestone',
            component: 'engine',
            category: 'milestone',
            intervalMonths: 72,
            intervalMiles: 60000,
            scheduleType: 'whichever-first',
            lastDoneDate: '2020-02-01',
            lastDoneMileage: 0,
            amberDays: 180,
            amberMiles: 2500,
            redDays: 0,
            redMiles: 0,
            taskType: 'garage',
            notes: 'Inspection reminder placeholder. Exact interval should follow vehicle-specific guidance.',
          },
        ],
        maintenanceLogs: [
          {
            id: uid('log'),
            date: '2025-08-19',
            mileage: 50410,
            title: 'Minor service',
            component: 'engine',
            completedWork: ['Engine oil changed', 'Oil filter changed', 'Cabin filter changed'],
            partsUsed: ['5W-30 oil', 'Oil filter', 'Cabin filter'],
            garageVisitId: garageId,
            cost: 239,
            notes: 'Recorded from invoice.',
          },
        ],
        tyres: [
          {
            id: uid('tyre'),
            position: 'FL',
            brand: 'Michelin',
            model: 'Primacy 4+',
            size: '205/55 R16',
            fitmentDate: '2025-03-16',
            fitmentMileage: 52000,
            treadDepth: 5.3,
            pressure: 34,
            dotAgeMonths: 14,
            sidewallDamage: false,
            punctureHistory: false,
            unevenWear: false,
            innerEdgeWear: false,
            vibrationSymptoms: false,
            alignmentConcerns: false,
            tpmsWarning: false,
            seasonalType: 'summer',
            lastCheckedDate: '2026-03-01',
          },
          {
            id: uid('tyre'),
            position: 'FR',
            brand: 'Michelin',
            model: 'Primacy 4+',
            size: '205/55 R16',
            fitmentDate: '2025-03-16',
            fitmentMileage: 52000,
            treadDepth: 5.1,
            pressure: 34,
            dotAgeMonths: 14,
            sidewallDamage: false,
            punctureHistory: false,
            unevenWear: false,
            innerEdgeWear: false,
            vibrationSymptoms: false,
            alignmentConcerns: false,
            tpmsWarning: false,
            seasonalType: 'summer',
            lastCheckedDate: '2026-03-01',
          },
          {
            id: uid('tyre'),
            position: 'RL',
            brand: 'BudgetGrip',
            model: 'EcoTour',
            size: '205/55 R16',
            fitmentDate: '2024-06-02',
            fitmentMileage: 46120,
            treadDepth: 2.8,
            pressure: 31,
            dotAgeMonths: 29,
            sidewallDamage: false,
            punctureHistory: true,
            unevenWear: true,
            innerEdgeWear: true,
            vibrationSymptoms: false,
            alignmentConcerns: true,
            tpmsWarning: false,
            seasonalType: 'summer',
            lastCheckedDate: '2026-03-01',
          },
          {
            id: uid('tyre'),
            position: 'RR',
            brand: 'BudgetGrip',
            model: 'EcoTour',
            size: '205/55 R16',
            fitmentDate: '2024-06-02',
            fitmentMileage: 46120,
            treadDepth: 2.5,
            pressure: 30,
            dotAgeMonths: 29,
            sidewallDamage: false,
            punctureHistory: false,
            unevenWear: true,
            innerEdgeWear: false,
            vibrationSymptoms: true,
            alignmentConcerns: true,
            tpmsWarning: false,
            seasonalType: 'summer',
            lastCheckedDate: '2026-03-01',
          },
        ],
        componentChecks: {
          brakes: {
            padThicknessMm: 5,
            discCondition: 'Light lip on front discs, monitor.',
            brakeFluidDate: '2024-04-10',
            brakeFeel: 'Slightly soft after first press',
            vibrationUnderBraking: false,
            pullingUnderBraking: false,
            handbrakeConcerns: false,
            absWarning: false,
            lastCheckedDate: '2026-02-21',
          },
          battery: {
            replacementDate: '2022-11-01',
            batteryAgeMonths: 41,
            slowStart: true,
            jumpStarts: 1,
            voltageTest: '12.3V rested',
            chargingNotes: 'Worth testing before winter.',
            evChargeConcern: false,
            lastCheckedDate: '2026-01-10',
          },
          fluids: {
            oilLevelStatus: 'checked',
            coolantLevelStatus: 'checked',
            washerFluidStatus: 'top-up needed',
            adblueApplicable: false,
            transmissionServiceNotes: 'No record found yet.',
            lastCheckedDate: '2026-03-01',
          },
          lights: {
            bulbFailures: 0,
            headlampAimIssue: false,
            wiperCondition: 'replace soon',
            washerOperation: 'good',
            mirrorDamage: false,
            seatBeltConcern: false,
            lastCheckedDate: '2026-03-01',
          },
          suspension: {
            knocks: true,
            creaks: false,
            pulling: true,
            potholeStrikeDate: '2026-01-25',
            shockLeak: false,
            steeringWarning: false,
            lastCheckedDate: '2026-02-21',
          },
        },
        warningLights: [
          {
            id: uid('light'),
            type: 'TPMS warning',
            seenAt: '2026-01-05',
            mileage: 56910,
            persistent: false,
            severity: 'amber',
            safeToDrive: true,
            resolved: true,
            notes: 'Cold weather pressure drop. Pressures corrected at home.',
          },
        ],
        symptoms: [
          {
            id: symptomId,
            type: 'Vibration at speed',
            seenAt: '2026-03-01',
            mileage: 57910,
            persistent: true,
            severity: 'amber',
            safeToDrive: true,
            linkedComponent: 'tyres',
            notes: 'Felt mainly above 60 mph. Rear tyres also showing uneven wear.',
            garageVisitId: garageId,
            resolved: false,
          },
        ],
        checklists: [
          {
            id: uid('run'),
            templateId: 'monthly-mechanical',
            title: 'Monthly mechanical owner check',
            runDate: '2026-03-01',
            status: 'completed',
            items: [
              { label: 'Tyre tread depth measured', result: 'flagged', notes: 'Rear tyres below preferred threshold.' },
              { label: 'Tyre pressures checked', result: 'flagged', notes: 'Rear axle low.' },
              { label: 'Tyre sidewalls inspected', result: 'complete', notes: '' },
              { label: 'Engine oil level checked', result: 'complete', notes: '' },
              { label: 'Coolant level checked', result: 'complete', notes: '' },
              { label: 'Washer fluid topped if needed', result: 'skipped', notes: 'No screenwash available.' },
              { label: 'Lights checked', result: 'complete', notes: '' },
              { label: 'Wipers and washers checked', result: 'flagged', notes: 'Front blades streaking.' },
              { label: 'Warning lights reviewed', result: 'complete', notes: '' },
              { label: 'Leaks under vehicle checked', result: 'complete', notes: '' },
            ],
          },
        ],
        garageVisits: [
          {
            id: garageId,
            status: 'follow-up needed',
            dateBooked: '2026-03-06',
            dateAttended: '2026-03-09',
            garageName: 'North Road Autos',
            garageContact: '01604 000000',
            reason: 'Investigate vibration and rear tyre wear',
            symptomsReported: ['Vibration at speed', 'Pulling slightly left'],
            findings: ['Rear tyres worn unevenly', 'Alignment likely out', 'Front wipers streaking'],
            diagnosis: 'Rear tyres near replacement threshold and alignment recommended.',
            workRecommended: ['Replace rear tyres', '4-wheel alignment', 'Replace wiper blades'],
            workApproved: ['4-wheel alignment'],
            workDeclined: ['Rear tyre replacement deferred by owner for 3 weeks'],
            workCompleted: ['4-wheel alignment completed'],
            partsUsed: [],
            fluidSpecUsed: '',
            mileage: 58040,
            totalCost: 89,
            labourCost: 89,
            partsCost: 0,
            warranty: '30 day alignment recheck',
            followUpDueDate: '2026-04-18',
            linkedMaintenanceIds: [],
            linkedSymptomIds: [symptomId],
            linkedAdvisories: ['Rear tyres wearing close to legal limit'],
            notes: 'Owner to book tyre replacement shortly.',
          },
        ],
        documents: [
          {
            id: uid('doc'),
            type: 'insurance',
            title: 'Insurance policy',
            provider: 'Example Insurance',
            reference: 'POL-778899',
            renewalDate: '2026-09-01',
            contactNumber: '0800 111 222',
            notes: 'Comprehensive cover.',
          },
          {
            id: uid('doc'),
            type: 'breakdown',
            title: 'Breakdown cover',
            provider: 'Rescue Assist',
            reference: 'RA-12345',
            renewalDate: '2026-08-10',
            contactNumber: '0800 222 999',
            notes: 'UK roadside + home start.',
          },
          {
            id: uid('doc'),
            type: 'warranty',
            title: 'Used vehicle warranty',
            provider: 'DealerCare',
            reference: 'DW-6632',
            renewalDate: '2026-05-30',
            contactNumber: '0800 555 010',
            notes: 'Ends soon; inspect unresolved issues before expiry.',
          },
        ],
        valuations: [
          { id: uid('val'), date: '2025-09-01', value: 9800, source: 'Manual estimate' },
          { id: uid('val'), date: '2026-03-15', value: 9100, source: 'Manual estimate' },
        ],
        costEntries: [
          { id: uid('cost'), date: '2026-03-09', category: 'garage', amount: 89, note: 'Alignment' },
          { id: uid('cost'), date: '2025-08-19', category: 'service', amount: 239, note: 'Minor service' },
        ],
        ownedEquipmentIds: ['tread-gauge', 'pressure-gauge', 'torch', 'screenwash', 'jump-pack', 'phone-power'],
      },
    ],
    checklistTemplates: CHECKLIST_TEMPLATES,
    equipmentCatalog: EQUIPMENT_CATALOG,
  };
}

// ---- src/state.js ----

const STORAGE_KEY = 'vehicle-care-system-v1';

let state = load();
let listeners = [];

function load() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return createSeedState();
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse saved state', error);
    return createSeedState();
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function emit() {
  save();
  listeners.forEach((listener) => listener(getState()));
}

function getState() {
  return structuredClone(state);
}

function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
}

function resetState() {
  state = createSeedState();
  emit();
}

function getVehicle(vehicleId) {
  return state.vehicles.find((vehicle) => vehicle.id === vehicleId) ?? state.vehicles[0];
}

function getPrimaryVehicleId() {
  return state.vehicles[0]?.id ?? null;
}

function mutateVehicle(vehicleId, updater) {
  state.vehicles = state.vehicles.map((vehicle) => {
    if (vehicle.id !== vehicleId) return vehicle;
    const updated = structuredClone(vehicle);
    updater(updated);
    return updated;
  });
  emit();
}

function addVehicle(payload) {
  const vehicle = {
    id: uid('vehicle'),
    registration: payload.registration,
    make: payload.make,
    model: payload.model,
    trim: payload.trim,
    year: maybeNumber(payload.year),
    vin: payload.vin,
    powertrain: payload.powertrain,
    transmission: payload.transmission,
    currentMileage: maybeNumber(payload.currentMileage),
    dateAcquired: payload.dateAcquired,
    purchasePrice: maybeNumber(payload.purchasePrice),
    ownershipNotes: payload.ownershipNotes,
    motRecords: [],
    recalls: [],
    maintenanceRules: [],
    maintenanceLogs: [],
    tyres: ['FL', 'FR', 'RL', 'RR'].map((position) => ({
      id: uid('tyre'),
      position,
      brand: '',
      model: '',
      size: '',
      fitmentDate: '',
      fitmentMileage: null,
      treadDepth: null,
      pressure: null,
      dotAgeMonths: null,
      sidewallDamage: false,
      punctureHistory: false,
      unevenWear: false,
      innerEdgeWear: false,
      vibrationSymptoms: false,
      alignmentConcerns: false,
      tpmsWarning: false,
      seasonalType: 'summer',
      lastCheckedDate: '',
    })),
    componentChecks: {
      brakes: { lastCheckedDate: '' },
      battery: { lastCheckedDate: '' },
      fluids: { lastCheckedDate: '' },
      lights: { lastCheckedDate: '' },
      suspension: { lastCheckedDate: '' },
    },
    warningLights: [],
    symptoms: [],
    checklists: [],
    garageVisits: [],
    documents: [],
    valuations: [],
    costEntries: [],
    ownedEquipmentIds: [],
  };

  state.vehicles.push(vehicle);
  emit();
  return vehicle.id;
}

function addMotRecord(vehicleId, payload) {
  mutateVehicle(vehicleId, (vehicle) => {
    vehicle.motRecords.unshift({
      id: uid('mot'),
      testDate: payload.testDate,
      recordedMileage: maybeNumber(payload.recordedMileage),
      result: payload.result,
      dueDate: payload.dueDate,
      certificateRef: payload.certificateRef,
      failures: splitLines(payload.failures),
      advisories: splitLines(payload.advisories).map((text) => ({
        id: uid('adv'),
        text,
        component: payload.advisoryComponent || 'general',
        status: 'amber',
      })),
    });
  });
}

function addRecall(vehicleId, payload) {
  mutateVehicle(vehicleId, (vehicle) => {
    vehicle.recalls.unshift({
      id: uid('recall'),
      title: payload.title,
      status: payload.status,
      urgency: payload.urgency,
      details: payload.details,
      actionBy: payload.actionBy,
    });
  });
}

function addMaintenanceRule(vehicleId, payload) {
  mutateVehicle(vehicleId, (vehicle) => {
    vehicle.maintenanceRules.unshift({
      id: uid('rule'),
      title: payload.title,
      component: payload.component,
      category: payload.category,
      intervalMonths: maybeNumber(payload.intervalMonths),
      intervalMiles: maybeNumber(payload.intervalMiles),
      scheduleType: payload.scheduleType,
      lastDoneDate: payload.lastDoneDate,
      lastDoneMileage: maybeNumber(payload.lastDoneMileage),
      amberDays: maybeNumber(payload.amberDays),
      amberMiles: maybeNumber(payload.amberMiles),
      redDays: maybeNumber(payload.redDays),
      redMiles: maybeNumber(payload.redMiles),
      taskType: payload.taskType,
      notes: payload.notes,
    });
  });
}

function completeMaintenance(vehicleId, payload) {
  mutateVehicle(vehicleId, (vehicle) => {
    vehicle.maintenanceLogs.unshift({
      id: uid('log'),
      date: payload.date,
      mileage: maybeNumber(payload.mileage),
      title: payload.title,
      component: payload.component,
      completedWork: splitLines(payload.completedWork),
      partsUsed: splitLines(payload.partsUsed),
      garageVisitId: payload.garageVisitId || null,
      cost: maybeNumber(payload.cost),
      notes: payload.notes,
    });

    const matchingRule = vehicle.maintenanceRules.find((rule) => rule.title === payload.title || rule.component === payload.component);
    if (matchingRule) {
      matchingRule.lastDoneDate = payload.date;
      matchingRule.lastDoneMileage = maybeNumber(payload.mileage);
    }

    if (payload.cost) {
      vehicle.costEntries.unshift({
        id: uid('cost'),
        date: payload.date,
        category: 'service',
        amount: maybeNumber(payload.cost),
        note: payload.title,
      });
    }
  });
}

function updateTyre(vehicleId, position, payload) {
  mutateVehicle(vehicleId, (vehicle) => {
    const tyre = vehicle.tyres.find((entry) => entry.position === position);
    if (!tyre) return;
    Object.assign(tyre, {
      brand: payload.brand,
      model: payload.model,
      size: payload.size,
      fitmentDate: payload.fitmentDate,
      fitmentMileage: maybeNumber(payload.fitmentMileage),
      treadDepth: maybeNumber(payload.treadDepth),
      pressure: maybeNumber(payload.pressure),
      dotAgeMonths: maybeNumber(payload.dotAgeMonths),
      sidewallDamage: Boolean(payload.sidewallDamage),
      punctureHistory: Boolean(payload.punctureHistory),
      unevenWear: Boolean(payload.unevenWear),
      innerEdgeWear: Boolean(payload.innerEdgeWear),
      vibrationSymptoms: Boolean(payload.vibrationSymptoms),
      alignmentConcerns: Boolean(payload.alignmentConcerns),
      tpmsWarning: Boolean(payload.tpmsWarning),
      seasonalType: payload.seasonalType,
      lastCheckedDate: payload.lastCheckedDate,
    });
  });
}

function addChecklistRun(vehicleId, templateId) {
  mutateVehicle(vehicleId, (vehicle) => {
    const template = state.checklistTemplates.find((entry) => entry.id === templateId);
    if (!template) return;
    vehicle.checklists.unshift({
      id: uid('run'),
      templateId,
      title: template.title,
      runDate: new Date().toISOString().split('T')[0],
      status: 'in-progress',
      items: template.items.map((item) => ({
        label: item.label,
        result: 'skipped',
        notes: '',
      })),
    });
  });
}

function updateChecklistResult(vehicleId, checklistId, itemIndex, result, notes = '') {
  mutateVehicle(vehicleId, (vehicle) => {
    const checklist = vehicle.checklists.find((entry) => entry.id === checklistId);
    if (!checklist) return;
    const item = checklist.items[itemIndex];
    if (!item) return;
    item.result = result;
    item.notes = notes;
    const results = checklist.items.map((entry) => entry.result);
    checklist.status = results.every((entry) => entry === 'complete') ? 'completed' : 'completed';
  });
}

function addSymptom(vehicleId, payload) {
  mutateVehicle(vehicleId, (vehicle) => {
    vehicle.symptoms.unshift({
      id: uid('sym'),
      type: payload.type,
      seenAt: payload.seenAt,
      mileage: maybeNumber(payload.mileage),
      persistent: payload.persistent === 'true',
      severity: payload.severity,
      safeToDrive: payload.safeToDrive === 'true',
      linkedComponent: payload.linkedComponent,
      notes: payload.notes,
      garageVisitId: null,
      resolved: false,
    });
  });
}

function addGarageVisit(vehicleId, payload) {
  mutateVehicle(vehicleId, (vehicle) => {
    vehicle.garageVisits.unshift({
      id: uid('garage'),
      status: payload.status,
      dateBooked: payload.dateBooked,
      dateAttended: payload.dateAttended,
      garageName: payload.garageName,
      garageContact: payload.garageContact,
      reason: payload.reason,
      symptomsReported: splitLines(payload.symptomsReported),
      findings: splitLines(payload.findings),
      diagnosis: payload.diagnosis,
      workRecommended: splitLines(payload.workRecommended),
      workApproved: splitLines(payload.workApproved),
      workDeclined: splitLines(payload.workDeclined),
      workCompleted: splitLines(payload.workCompleted),
      partsUsed: splitLines(payload.partsUsed),
      fluidSpecUsed: payload.fluidSpecUsed,
      mileage: maybeNumber(payload.mileage),
      totalCost: maybeNumber(payload.totalCost),
      labourCost: maybeNumber(payload.labourCost),
      partsCost: maybeNumber(payload.partsCost),
      warranty: payload.warranty,
      followUpDueDate: payload.followUpDueDate,
      linkedMaintenanceIds: [],
      linkedSymptomIds: [],
      linkedAdvisories: [],
      notes: payload.notes,
    });

    if (payload.totalCost) {
      vehicle.costEntries.unshift({
        id: uid('cost'),
        date: payload.dateAttended || payload.dateBooked,
        category: 'garage',
        amount: maybeNumber(payload.totalCost),
        note: payload.reason,
      });
    }
  });
}

function addDocument(vehicleId, payload) {
  mutateVehicle(vehicleId, (vehicle) => {
    vehicle.documents.unshift({
      id: uid('doc'),
      type: payload.type,
      title: payload.title,
      provider: payload.provider,
      reference: payload.reference,
      renewalDate: payload.renewalDate,
      contactNumber: payload.contactNumber,
      notes: payload.notes,
    });
  });
}

function toggleOwnedEquipment(vehicleId, equipmentId) {
  mutateVehicle(vehicleId, (vehicle) => {
    const exists = vehicle.ownedEquipmentIds.includes(equipmentId);
    vehicle.ownedEquipmentIds = exists
      ? vehicle.ownedEquipmentIds.filter((id) => id !== equipmentId)
      : [...vehicle.ownedEquipmentIds, equipmentId];
  });
}

function splitLines(input) {
  return String(input || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

// ---- src/domain/maintenance-engine.js ----

function deriveMaintenanceStatus(rule, currentMileage) {
  const nextDueDate = rule.intervalMonths ? addMonths(rule.lastDoneDate, rule.intervalMonths) : null;
  const nextDueMileage = rule.intervalMiles && rule.lastDoneMileage !== null && rule.lastDoneMileage !== undefined
    ? Number(rule.lastDoneMileage) + Number(rule.intervalMiles)
    : null;

  const daysRemaining = nextDueDate ? daysBetween(nextDueDate) : null;
  const milesRemaining = nextDueMileage !== null ? mileageDistance(currentMileage, nextDueMileage) : null;

  const overdueByDate = daysRemaining !== null && daysRemaining < 0;
  const overdueByMileage = milesRemaining !== null && milesRemaining < 0;

  const dueSoonByDate = daysRemaining !== null && rule.amberDays !== null && rule.amberDays !== undefined && daysRemaining <= Number(rule.amberDays);
  const dueSoonByMileage = milesRemaining !== null && rule.amberMiles !== null && rule.amberMiles !== undefined && milesRemaining <= Number(rule.amberMiles);

  let status = 'green';
  if (!rule.lastDoneDate && !rule.lastDoneMileage) {
    status = 'grey';
  } else if (overdueByDate || overdueByMileage) {
    status = 'red';
  } else if (dueSoonByDate || dueSoonByMileage) {
    status = 'amber';
  }

  const basis = [];
  if (nextDueDate) basis.push(`date ${nextDueDate}`);
  if (nextDueMileage !== null) basis.push(`mileage ${nextDueMileage.toLocaleString('en-GB')} mi`);

  return {
    ...rule,
    nextDueDate,
    nextDueMileage,
    daysRemaining,
    milesRemaining,
    status,
    basis,
  };
}

function deriveMaintenanceOverview(vehicle) {
  return (vehicle.maintenanceRules || [])
    .map((rule) => deriveMaintenanceStatus(rule, vehicle.currentMileage))
    .sort((a, b) => sortByStatus(a.status) - sortByStatus(b.status));
}

function sortByStatus(status) {
  switch (status) {
    case 'critical':
      return 0;
    case 'red':
      return 1;
    case 'amber':
      return 2;
    case 'green':
      return 3;
    default:
      return 4;
  }
}

// ---- src/domain/status-engine.js ----

function getTyreStatus(tyre) {
  if (!tyre || tyre.treadDepth === null || tyre.treadDepth === undefined) {
    return { status: 'grey', reason: 'No measured tread recorded yet.' };
  }

  const depth = Number(tyre.treadDepth);
  const issueFlags = [
    tyre.sidewallDamage,
    tyre.unevenWear,
    tyre.innerEdgeWear,
    tyre.alignmentConcerns,
    tyre.tpmsWarning,
  ].filter(Boolean).length;

  if (tyre.sidewallDamage || depth < 1.6) {
    return { status: 'critical', reason: 'Below legal minimum or unsafe damage logged.' };
  }
  if (depth < 3.0) {
    return { status: 'red', reason: 'Below preferred replacement-planning threshold.' };
  }
  if (depth < 4.0 || issueFlags > 0) {
    return { status: 'amber', reason: 'Monitor wear pattern, pressure, or replacement timing.' };
  }
  return { status: 'green', reason: 'Healthy tread depth with no notable issues recorded.' };
}

function getMotStatus(vehicle) {
  const latest = vehicle.motRecords?.[0];
  if (!latest) return { status: 'grey', detail: 'No MOT record stored.' };
  const daysRemaining = latest.dueDate ? daysBetween(latest.dueDate) : null;
  if (latest.result === 'fail') return { status: 'critical', detail: 'Latest recorded MOT is a fail.' };
  if (daysRemaining !== null && daysRemaining < 0) return { status: 'critical', detail: 'MOT due date has passed.' };
  if (daysRemaining !== null && daysRemaining <= 30) return { status: 'amber', detail: 'MOT due within 30 days.' };
  return { status: 'green', detail: 'MOT recorded and currently in date.' };
}

function getRecallStatus(vehicle) {
  const recalls = vehicle.recalls || [];
  if (!recalls.length) return { status: 'grey', detail: 'No recall record stored.' };
  const statuses = recalls.map((item) => item.status || 'grey');
  const worst = chooseWorstStatus(statuses);
  const critical = recalls.find((item) => item.urgency === 'do-not-drive');
  if (critical) return { status: 'critical', detail: `Urgent recall: ${critical.title}` };
  if (worst === 'green') return { status: 'green', detail: 'No open recall risk recorded.' };
  return { status: worst, detail: 'Recall records need attention.' };
}

function getDocumentsStatus(vehicle) {
  const datedDocs = (vehicle.documents || []).filter((doc) => doc.renewalDate);
  if (!datedDocs.length) return { status: 'grey', detail: 'No timed cover documents stored.' };
  const statuses = datedDocs.map((doc) => {
    const days = daysBetween(doc.renewalDate);
    if (days < 0) return 'red';
    if (days <= 30) return 'amber';
    return 'green';
  });
  return {
    status: chooseWorstStatus(statuses),
    detail: 'Insurance, breakdown and warranty renewals tracked here.',
  };
}

function getChecklistStatus(vehicle, templates) {
  const statuses = templates.map((template) => {
    const runs = (vehicle.checklists || []).filter((entry) => entry.templateId === template.id);
    const latest = runs[0];
    if (!latest) return 'grey';
    const days = daysBetween(addChecklistThresholdDate(latest.runDate, template.frequency));
    if (days < 0) return 'red';
    if (days <= 7) return 'amber';
    return 'green';
  });
  return {
    status: statuses.length ? chooseWorstStatus(statuses) : 'grey',
    detail: 'Owner check routines support tyres, fluids, lights and winter readiness.',
  };
}

function getEquipmentStatus(vehicle, equipmentCatalog) {
  const owned = new Set(vehicle.ownedEquipmentIds || []);
  const coreItems = equipmentCatalog.filter((item) => item.tier === 'core');
  const ownedCoreCount = coreItems.filter((item) => owned.has(item.id)).length;
  if (!coreItems.length) return { status: 'grey', detail: 'No equipment catalogue loaded.' };
  if (ownedCoreCount === 0) return { status: 'red', detail: 'No core owner kit marked as owned.' };
  if (ownedCoreCount < coreItems.length * 0.7) return { status: 'amber', detail: 'Core owner kit partly covered.' };
  return { status: 'green', detail: 'Core owner kit mostly covered.' };
}

function getGarageStatus(vehicle) {
  const activeVisits = (vehicle.garageVisits || []).filter((visit) => ['booked', 'inspected', 'quoted', 'approved', 'follow-up needed'].includes(visit.status));
  if (!activeVisits.length) return { status: 'green', detail: 'No active garage actions.' };
  const overdueFollowUp = activeVisits.some((visit) => visit.followUpDueDate && daysBetween(visit.followUpDueDate) < 0);
  if (overdueFollowUp) return { status: 'red', detail: 'At least one follow-up date has passed.' };
  return { status: 'amber', detail: 'Open garage work or follow-up still in flight.' };
}

function getSymptomsStatus(vehicle) {
  const unresolved = (vehicle.symptoms || []).filter((item) => !item.resolved);
  if (!unresolved.length) return { status: 'green', detail: 'No unresolved symptoms logged.' };
  const worst = chooseWorstStatus(unresolved.map((item) => item.severity || 'amber'));
  return { status: worst, detail: `${unresolved.length} unresolved symptom(s) logged.` };
}

function deriveComponentMap(vehicle, templates, equipmentCatalog) {
  const tyres = vehicle.tyres || [];
  const tyreStatuses = Object.fromEntries(tyres.map((tyre) => [tyre.position, getTyreStatus(tyre)]));
  const maintenance = deriveMaintenanceOverview(vehicle);

  const ruleByComponent = (component) => maintenance.filter((rule) => rule.component === component).map((rule) => rule.status);

  return {
    FL: tyreStatuses.FL || { status: 'grey', reason: 'No data.' },
    FR: tyreStatuses.FR || { status: 'grey', reason: 'No data.' },
    RL: tyreStatuses.RL || { status: 'grey', reason: 'No data.' },
    RR: tyreStatuses.RR || { status: 'grey', reason: 'No data.' },
    frontBrakes: brakesStatus(vehicle),
    rearBrakes: brakesStatus(vehicle),
    engineDriveUnit: { status: chooseWorstStatus(ruleByComponent('engine')), reason: 'Driven from maintenance and symptom records.' },
    batteryCharging: batteryStatus(vehicle),
    cooling: coolingStatus(vehicle),
    fluids: fluidsStatus(vehicle),
    steeringSuspension: suspensionStatus(vehicle),
    lightsVisibility: lightsStatus(vehicle),
    bodyCorrosion: { status: 'grey', reason: 'No corrosion/body inspection history in sample yet.' },
    cabinSafety: { status: getMotStatus(vehicle).status, reason: 'Seat belts, restraints and legal dashboard warnings belong here.' },
    compliance: getMotStatus(vehicle),
    recalls: getRecallStatus(vehicle),
    checklists: getChecklistStatus(vehicle, templates),
    equipment: getEquipmentStatus(vehicle, equipmentCatalog),
    garage: getGarageStatus(vehicle),
    symptoms: getSymptomsStatus(vehicle),
  };
}

function brakesStatus(vehicle) {
  const checks = vehicle.componentChecks?.brakes || {};
  const statuses = [];
  if (!checks.lastCheckedDate) statuses.push('grey');
  if (checks.absWarning) statuses.push('critical');
  if (checks.brakeFeel?.toLowerCase().includes('soft')) statuses.push('amber');
  const advisory = vehicle.motRecords?.[0]?.advisories?.some((item) => item.component === 'brakes');
  if (advisory) statuses.push('amber');
  return { status: chooseWorstStatus(statuses.length ? statuses : ['green']), reason: 'Brake condition, brake fluid age and MOT-linked items.' };
}

function batteryStatus(vehicle) {
  const battery = vehicle.componentChecks?.battery || {};
  const statuses = [];
  if (!battery.lastCheckedDate) statuses.push('grey');
  if (battery.slowStart || (battery.jumpStarts || 0) > 0) statuses.push('amber');
  if ((battery.batteryAgeMonths || 0) > 60) statuses.push('amber');
  return { status: chooseWorstStatus(statuses.length ? statuses : ['green']), reason: '12V battery age and starting behaviour.' };
}

function coolingStatus(vehicle) {
  const fluid = vehicle.componentChecks?.fluids || {};
  if (!fluid.lastCheckedDate) return { status: 'grey', reason: 'Cooling checks not yet logged.' };
  return { status: fluid.coolantLevelStatus === 'checked' ? 'green' : 'amber', reason: 'Coolant level and service history.' };
}

function fluidsStatus(vehicle) {
  const fluid = vehicle.componentChecks?.fluids || {};
  const statuses = [];
  if (!fluid.lastCheckedDate) statuses.push('grey');
  if (fluid.washerFluidStatus?.includes('top-up')) statuses.push('amber');
  if (String(fluid.transmissionServiceNotes || '').toLowerCase().includes('no record')) statuses.push('amber');
  return { status: chooseWorstStatus(statuses.length ? statuses : ['green']), reason: 'Oil, coolant, washer fluid and applicable service fluids.' };
}

function lightsStatus(vehicle) {
  const lights = vehicle.componentChecks?.lights || {};
  const statuses = [];
  if (!lights.lastCheckedDate) statuses.push('grey');
  if (lights.bulbFailures > 0) statuses.push('red');
  if (lights.wiperCondition?.includes('replace')) statuses.push('amber');
  return { status: chooseWorstStatus(statuses.length ? statuses : ['green']), reason: 'Bulbs, washer operation, wipers and mirror status.' };
}

function suspensionStatus(vehicle) {
  const suspension = vehicle.componentChecks?.suspension || {};
  const statuses = [];
  if (!suspension.lastCheckedDate) statuses.push('grey');
  if (suspension.knocks || suspension.pulling) statuses.push('amber');
  const tyreIssues = (vehicle.tyres || []).some((tyre) => tyre.alignmentConcerns || tyre.unevenWear || tyre.innerEdgeWear);
  if (tyreIssues) statuses.push('amber');
  return { status: chooseWorstStatus(statuses.length ? statuses : ['green']), reason: 'Pulling, knocks, wear pattern and pothole history.' };
}

function addChecklistThresholdDate(runDate, frequency) {
  const date = new Date(`${runDate}T00:00:00`);
  if (frequency === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  } else {
    date.setFullYear(date.getFullYear() + 1);
  }
  return date.toISOString().split('T')[0];
}

function deriveDashboard(vehicle, templates, equipmentCatalog) {
  const maintenance = deriveMaintenanceOverview(vehicle);
  const components = deriveComponentMap(vehicle, templates, equipmentCatalog);
  const componentStatuses = Object.values(components).map((entry) => entry.status);
  const overall = chooseWorstStatus(componentStatuses);
  const openAdvisories = sum((vehicle.motRecords || []).map((record) => (record.advisories || []).length));
  const recentCosts = sum((vehicle.costEntries || []).filter((entry) => {
    const days = daysBetween(entry.date);
    return days !== null && days >= -365;
  }).map((entry) => entry.amount));

  return {
    overall,
    mot: getMotStatus(vehicle),
    recalls: getRecallStatus(vehicle),
    documents: getDocumentsStatus(vehicle),
    garage: getGarageStatus(vehicle),
    symptoms: getSymptomsStatus(vehicle),
    maintenance,
    componentMap: components,
    openAdvisories,
    activeSymptoms: (vehicle.symptoms || []).filter((item) => !item.resolved).length,
    recentCosts,
    nextDue: maintenance.filter((item) => ['amber', 'red', 'critical'].includes(item.status)).slice(0, 5),
  };
}

// ---- src/views/dashboard.js ----

const COMPONENT_LABELS = {
  FL: 'Front left tyre',
  FR: 'Front right tyre',
  RL: 'Rear left tyre',
  RR: 'Rear right tyre',
  frontBrakes: 'Front brakes',
  rearBrakes: 'Rear brakes',
  engineDriveUnit: 'Engine / drive unit',
  batteryCharging: 'Battery / charging',
  cooling: 'Cooling',
  fluids: 'Fluids',
  steeringSuspension: 'Steering / suspension',
  lightsVisibility: 'Lights / visibility',
  bodyCorrosion: 'Body / corrosion',
  cabinSafety: 'Cabin safety',
  compliance: 'Legal compliance',
  recalls: 'Recalls',
  checklists: 'Checklists',
  equipment: 'Equipment',
  garage: 'Garage work',
  symptoms: 'Symptoms',
};

function renderDashboard(vehicle, dashboard) {
  return `
    <section class="hero">
      <div>
        <p class="eyebrow">Vehicle care system</p>
        <h1>${escapeHtml(vehicle.make)} ${escapeHtml(vehicle.model)} · ${escapeHtml(vehicle.registration)}</h1>
        <p class="hero__copy">This dashboard treats legal compliance, maintenance, condition monitoring, symptoms, garage evidence and owner checks as separate but connected parts of vehicle care.</p>
      </div>
      <div class="hero__stats">
        <div class="stat-card">
          <span class="stat-card__label">Overall health</span>
          <strong>${badge(dashboard.overall)}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Open advisories</span>
          <strong>${dashboard.openAdvisories}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Active symptoms</span>
          <strong>${dashboard.activeSymptoms}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">12-month spend logged</span>
          <strong>${formatCurrency(dashboard.recentCosts)}</strong>
        </div>
      </div>
    </section>

    <section class="summary-grid">
      ${statusTile('Legal status', dashboard.mot.status, dashboard.mot.detail)}
      ${statusTile('Recall status', dashboard.recalls.status, dashboard.recalls.detail)}
      ${statusTile('Garage actions', dashboard.garage.status, dashboard.garage.detail)}
      ${statusTile('Symptoms', dashboard.symptoms.status, dashboard.symptoms.detail)}
      ${statusTile('Documents & renewals', dashboard.documents.status, dashboard.documents.detail)}
      ${statusTile('Maintenance plan', worstMaintenance(dashboard).status, worstMaintenance(dashboard).detail)}
    </section>

    <section class="panel">
      <div class="panel__header">
        <div>
          <p class="section-kicker">Signature view</p>
          <h2>Vehicle status map</h2>
        </div>
        <p class="muted">Tap-ready component cards. In a production mobile app these would open a dedicated component history screen.</p>
      </div>
      <div class="component-map">
        ${Object.entries(dashboard.componentMap)
          .map(([key, value]) => `
            <button class="component-card component-card--${value.status}" type="button" data-component-key="${key}">
              <span class="component-card__title">${COMPONENT_LABELS[key] || key}</span>
              ${badge(value.status)}
              <span class="component-card__reason">${escapeHtml(value.reason || value.detail || '')}</span>
            </button>
          `)
          .join('')}
      </div>
    </section>

    <section class="panel panel--split">
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">What needs doing next</p>
            <h2>Next due items</h2>
          </div>
        </div>
        <div class="list-stack">
          ${dashboard.nextDue.length ? dashboard.nextDue.map((item) => `
            <article class="list-card">
              <div class="list-card__row">
                <strong>${escapeHtml(item.title)}</strong>
                ${badge(item.status)}
              </div>
              <p class="muted">${escapeHtml(item.component)} · ${escapeHtml(item.taskType)}</p>
              <p>${dueLine(item)}</p>
              <p class="muted">${escapeHtml(item.notes || 'No notes')}</p>
            </article>
          `).join('') : '<p class="muted">Nothing urgent or due soon right now.</p>'}
        </div>
      </div>
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Ownership trail</p>
            <h2>Latest timeline events</h2>
          </div>
        </div>
        <div class="timeline">
          ${buildTimeline(vehicle)}
        </div>
      </div>
    </section>
  `;
}

function statusTile(title, status, detail) {
  return `
    <article class="status-tile">
      <div class="list-card__row">
        <strong>${escapeHtml(title)}</strong>
        ${badge(status)}
      </div>
      <p>${escapeHtml(detail)}</p>
    </article>
  `;
}

function worstMaintenance(dashboard) {
  const first = dashboard.maintenance.find((item) => ['critical', 'red', 'amber'].includes(item.status));
  if (!first) return { status: 'green', detail: 'No due or overdue maintenance rules at the moment.' };
  return { status: first.status, detail: `${first.title} is the next maintenance pressure point.` };
}

function dueLine(item) {
  const parts = [];
  if (item.nextDueDate) parts.push(`Due ${formatDate(item.nextDueDate)}`);
  if (item.nextDueMileage !== null && item.nextDueMileage !== undefined) parts.push(`Due at ${Number(item.nextDueMileage).toLocaleString('en-GB')} mi`);
  return parts.join(' · ');
}

function buildTimeline(vehicle) {
  const events = [];
  (vehicle.motRecords || []).forEach((record) => {
    events.push({ date: record.testDate, title: `MOT ${record.result}`, detail: `${record.recordedMileage?.toLocaleString('en-GB')} mi` });
  });
  (vehicle.maintenanceLogs || []).forEach((record) => {
    events.push({ date: record.date, title: record.title, detail: record.completedWork.join(', ') || record.component });
  });
  (vehicle.garageVisits || []).forEach((record) => {
    events.push({ date: record.dateAttended || record.dateBooked, title: `Garage: ${record.reason}`, detail: record.status });
  });
  (vehicle.valuations || []).forEach((record) => {
    events.push({ date: record.date, title: 'Valuation snapshot', detail: formatCurrency(record.value) });
  });

  return events
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 8)
    .map((event) => `
      <article class="timeline__item">
        <span class="timeline__date">${formatDate(event.date)}</span>
        <strong>${escapeHtml(event.title)}</strong>
        <p class="muted">${escapeHtml(event.detail)}</p>
      </article>
    `)
    .join('');
}

// ---- src/views/vehicles.js ----

function renderVehicles(state, activeVehicleId) {
  return `
    <section class="panel panel--split panel--tight">
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Garage</p>
            <h2>Your vehicles</h2>
          </div>
        </div>
        <div class="vehicle-list">
          ${state.vehicles.map((vehicle) => `
            <button type="button" class="vehicle-chip ${vehicle.id === activeVehicleId ? 'vehicle-chip--active' : ''}" data-action="switch-vehicle" data-vehicle-id="${vehicle.id}">
              <strong>${escapeHtml(vehicle.registration)}</strong>
              <span>${escapeHtml(vehicle.make)} ${escapeHtml(vehicle.model)}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Version 1 input</p>
            <h2>Add vehicle</h2>
          </div>
        </div>
        <form class="form-grid" data-form="add-vehicle">
          <label>Registration<input name="registration" required placeholder="AB12 CDE"></label>
          <label>Make<input name="make" required placeholder="Ford"></label>
          <label>Model<input name="model" required placeholder="Focus"></label>
          <label>Trim<input name="trim" placeholder="Titanium"></label>
          <label>Year<input name="year" type="number" placeholder="2019"></label>
          <label>VIN<input name="vin" placeholder="Optional"></label>
          <label>Powertrain
            <select name="powertrain">
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybrid</option>
              <option value="plug-in hybrid">Plug-in hybrid</option>
              <option value="EV">EV</option>
            </select>
          </label>
          <label>Transmission
            <select name="transmission">
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </select>
          </label>
          <label>Current mileage<input name="currentMileage" type="number" placeholder="58240"></label>
          <label>Date acquired<input name="dateAcquired" type="date"></label>
          <label>Purchase price<input name="purchasePrice" type="number" placeholder="12995"></label>
          <label class="form-grid__full">Ownership notes<textarea name="ownershipNotes" rows="3" placeholder="Household car, mixed urban use, tow use, storage history, etc."></textarea></label>
          <div class="form-actions form-grid__full">
            <button class="button button--primary" type="submit">Add vehicle</button>
          </div>
        </form>
      </div>
    </section>

    <section class="panel">
      <div class="panel__header">
        <div>
          <p class="section-kicker">Vehicle profile</p>
          <h2>${escapeHtml(state.vehicles.find((v) => v.id === activeVehicleId)?.registration || '')}</h2>
        </div>
      </div>
      ${renderVehicleProfile(state.vehicles.find((v) => v.id === activeVehicleId))}
    </section>
  `;
}

function renderVehicleProfile(vehicle) {
  if (!vehicle) return '<p class="muted">No vehicle selected.</p>';
  return `
    <div class="detail-grid">
      ${detail('Make / model', `${escapeHtml(vehicle.make)} ${escapeHtml(vehicle.model)}`)}
      ${detail('Trim / year', `${escapeHtml(vehicle.trim || '—')} · ${vehicle.year || '—'}`)}
      ${detail('Powertrain', escapeHtml(vehicle.powertrain || '—'))}
      ${detail('Transmission', escapeHtml(vehicle.transmission || '—'))}
      ${detail('Current mileage', vehicle.currentMileage?.toLocaleString('en-GB') ? `${vehicle.currentMileage.toLocaleString('en-GB')} mi` : '—')}
      ${detail('Date acquired', formatDate(vehicle.dateAcquired))}
      ${detail('Purchase price', formatCurrency(vehicle.purchasePrice))}
      ${detail('VIN', escapeHtml(vehicle.vin || '—'))}
      ${detail('Notes', escapeHtml(vehicle.ownershipNotes || '—'), true)}
    </div>
  `;
}

function detail(label, value, full = false) {
  return `
    <article class="detail-card ${full ? 'detail-card--full' : ''}">
      <span class="detail-card__label">${label}</span>
      <strong>${value}</strong>
    </article>
  `;
}

// ---- src/views/maintenance.js ----

function renderMaintenance(vehicle, maintenance) {
  return `
    <section class="panel panel--split">
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Rules engine</p>
            <h2>Maintenance rules</h2>
          </div>
        </div>
        <div class="list-stack">
          ${maintenance.map((rule) => `
            <article class="list-card">
              <div class="list-card__row">
                <strong>${escapeHtml(rule.title)}</strong>
                ${badge(rule.status)}
              </div>
              <p class="muted">${escapeHtml(rule.component)} · ${escapeHtml(rule.scheduleType)} · ${escapeHtml(rule.taskType)}</p>
              <p>${buildRuleSummary(rule)}</p>
              <p class="muted">Last done ${formatDate(rule.lastDoneDate)}${rule.lastDoneMileage ? ` at ${rule.lastDoneMileage.toLocaleString('en-GB')} mi` : ''}</p>
              <p class="muted">${escapeHtml(rule.notes || 'No notes')}</p>
            </article>
          `).join('')}
        </div>
      </div>
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Add new rule</p>
            <h2>Create maintenance schedule</h2>
          </div>
        </div>
        <form class="form-grid" data-form="add-maintenance-rule">
          <label>Title<input name="title" required placeholder="Brake fluid renewal"></label>
          <label>Component
            <select name="component">
              <option value="engine">Engine</option>
              <option value="tyres">Tyres</option>
              <option value="brakes">Brakes</option>
              <option value="battery">Battery / charging</option>
              <option value="cooling">Cooling</option>
              <option value="fluids">Fluids</option>
              <option value="suspension">Steering / suspension</option>
              <option value="lights">Lights / visibility</option>
            </select>
          </label>
          <label>Category<input name="category" placeholder="service / fluid / inspection"></label>
          <label>Schedule type
            <select name="scheduleType">
              <option value="whichever-first">Whichever comes first</option>
              <option value="date">Date only</option>
              <option value="mileage">Mileage only</option>
            </select>
          </label>
          <label>Interval months<input name="intervalMonths" type="number" placeholder="12"></label>
          <label>Interval miles<input name="intervalMiles" type="number" placeholder="10000"></label>
          <label>Last done date<input name="lastDoneDate" type="date"></label>
          <label>Last done mileage<input name="lastDoneMileage" type="number" placeholder="58000"></label>
          <label>Amber days window<input name="amberDays" type="number" placeholder="30"></label>
          <label>Amber miles window<input name="amberMiles" type="number" placeholder="1000"></label>
          <label>Task type
            <select name="taskType">
              <option value="owner-check">Owner check</option>
              <option value="DIY">DIY</option>
              <option value="garage">Garage</option>
            </select>
          </label>
          <label class="form-grid__full">Notes<textarea name="notes" rows="3" placeholder="Manufacturer warranty condition, fluid spec, torque-critical note, etc."></textarea></label>
          <div class="form-actions form-grid__full">
            <button class="button button--primary" type="submit">Add rule</button>
          </div>
        </form>
      </div>
    </section>

    <section class="panel panel--split">
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Service history</p>
            <h2>Completed work</h2>
          </div>
        </div>
        <div class="list-stack">
          ${(vehicle.maintenanceLogs || []).map((log) => `
            <article class="list-card">
              <div class="list-card__row">
                <strong>${escapeHtml(log.title)}</strong>
                <span class="muted">${formatDate(log.date)}</span>
              </div>
              <p>${escapeHtml((log.completedWork || []).join(', ') || log.component)}</p>
              <p class="muted">${log.mileage?.toLocaleString('en-GB') || '—'} mi · ${(log.partsUsed || []).join(', ') || 'No parts listed'}</p>
            </article>
          `).join('') || '<p class="muted">No maintenance log entries yet.</p>'}
        </div>
      </div>
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Log completion</p>
            <h2>Complete maintenance</h2>
          </div>
        </div>
        <form class="form-grid" data-form="complete-maintenance">
          <label>Title<input name="title" required placeholder="Engine oil and filter"></label>
          <label>Component<input name="component" required placeholder="engine"></label>
          <label>Date<input name="date" type="date" required></label>
          <label>Mileage<input name="mileage" type="number" required></label>
          <label>Cost<input name="cost" type="number" placeholder="239"></label>
          <label class="form-grid__full">Completed work<textarea name="completedWork" rows="3" placeholder="One line per completed item"></textarea></label>
          <label class="form-grid__full">Parts used<textarea name="partsUsed" rows="3" placeholder="One line per part"></textarea></label>
          <label class="form-grid__full">Notes<textarea name="notes" rows="3"></textarea></label>
          <div class="form-actions form-grid__full">
            <button class="button button--primary" type="submit">Log completed work</button>
          </div>
        </form>
      </div>
    </section>

    <section class="panel panel--split">
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">MOT</p>
            <h2>History and advisories</h2>
          </div>
        </div>
        <div class="list-stack">
          ${(vehicle.motRecords || []).map((record) => `
            <article class="list-card">
              <div class="list-card__row">
                <strong>${formatDate(record.testDate)}</strong>
                ${badge(record.result === 'pass' ? 'green' : 'red')}
              </div>
              <p class="muted">${record.recordedMileage?.toLocaleString('en-GB') || '—'} mi · due ${formatDate(record.dueDate)}</p>
              <p><strong>Advisories / minors</strong></p>
              <ul>${(record.advisories || []).map((advisory) => `<li>${escapeHtml(advisory.text)}</li>`).join('') || '<li>None logged</li>'}</ul>
              <p><strong>Failures</strong></p>
              <ul>${(record.failures || []).map((failure) => `<li>${escapeHtml(failure)}</li>`).join('') || '<li>None logged</li>'}</ul>
            </article>
          `).join('') || '<p class="muted">No MOT records yet.</p>'}
        </div>
      </div>
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Manual entry</p>
            <h2>Add MOT record</h2>
          </div>
        </div>
        <form class="form-grid" data-form="add-mot">
          <label>Test date<input name="testDate" type="date" required></label>
          <label>Recorded mileage<input name="recordedMileage" type="number"></label>
          <label>Result
            <select name="result">
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
            </select>
          </label>
          <label>Next due date<input name="dueDate" type="date"></label>
          <label>Certificate ref<input name="certificateRef"></label>
          <label>Advisory component<input name="advisoryComponent" placeholder="tyres / brakes / general"></label>
          <label class="form-grid__full">Advisories<textarea name="advisories" rows="3" placeholder="One advisory per line"></textarea></label>
          <label class="form-grid__full">Failures<textarea name="failures" rows="3" placeholder="One failure per line"></textarea></label>
          <div class="form-actions form-grid__full">
            <button class="button button--primary" type="submit">Add MOT record</button>
          </div>
        </form>
      </div>
    </section>

    <section class="panel panel--split">
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Recalls</p>
            <h2>Recall register</h2>
          </div>
        </div>
        <div class="list-stack">
          ${(vehicle.recalls || []).map((recall) => `
            <article class="list-card">
              <div class="list-card__row">
                <strong>${escapeHtml(recall.title)}</strong>
                ${badge(recall.status)}
              </div>
              <p class="muted">Urgency: ${escapeHtml(recall.urgency || 'monitor')}</p>
              <p>${escapeHtml(recall.details || '')}</p>
            </article>
          `).join('') || '<p class="muted">No recall entries yet.</p>'}
        </div>
      </div>
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Manual entry</p>
            <h2>Add recall item</h2>
          </div>
        </div>
        <form class="form-grid" data-form="add-recall">
          <label>Title<input name="title" required placeholder="Airbag inflator recall"></label>
          <label>Status
            <select name="status">
              <option value="amber">Amber</option>
              <option value="red">Red</option>
              <option value="critical">Critical</option>
              <option value="green">Green / closed</option>
            </select>
          </label>
          <label>Urgency
            <select name="urgency">
              <option value="monitor">Monitor</option>
              <option value="book-now">Book now</option>
              <option value="do-not-drive">Do not drive</option>
            </select>
          </label>
          <label>Action by<input name="actionBy" type="date"></label>
          <label class="form-grid__full">Details<textarea name="details" rows="3" placeholder="Manufacturer wording, campaign reference, safety note, etc."></textarea></label>
          <div class="form-actions form-grid__full">
            <button class="button button--primary" type="submit">Add recall</button>
          </div>
        </form>
      </div>
    </section>
  `;
}

function buildRuleSummary(rule) {
  const parts = [];
  if (rule.nextDueDate) parts.push(`Due ${formatDate(rule.nextDueDate)}`);
  if (rule.nextDueMileage !== null && rule.nextDueMileage !== undefined) parts.push(`Due at ${rule.nextDueMileage.toLocaleString('en-GB')} mi`);
  if (!parts.length) return 'No due calculation possible until last-done values are recorded.';
  return parts.join(' · ');
}

// ---- src/views/tyres.js ----

function renderTyres(vehicle) {
  const tyres = vehicle.tyres || [];
  const rearDepths = tyres.filter((t) => t.position.startsWith('R')).map((t) => Number(t.treadDepth));
  const frontDepths = tyres.filter((t) => t.position.startsWith('F')).map((t) => Number(t.treadDepth));
  const axleWarnings = [];
  if (Math.abs(diff(frontDepths)) > 1.0) axleWarnings.push('Front axle tread depth imbalance over 1.0 mm');
  if (Math.abs(diff(rearDepths)) > 1.0) axleWarnings.push('Rear axle tread depth imbalance over 1.0 mm');
  if (tyres.some((tyre) => tyre.innerEdgeWear || tyre.unevenWear)) axleWarnings.push('Uneven wear pattern detected');

  return `
    <section class="panel">
      <div class="panel__header">
        <div>
          <p class="section-kicker">Condition monitoring</p>
          <h2>Tyres by wheel</h2>
        </div>
        <div class="callout callout--compact">
          <strong>Owner kit prompt</strong>
          <p>This module assumes tread depth gauge + pressure gauge ownership as a practical baseline.</p>
        </div>
      </div>
      <div class="tyre-grid">
        ${tyres.map((tyre) => {
          const status = getTyreStatus(tyre);
          return `
            <article class="tyre-card tyre-card--${status.status}">
              <div class="list-card__row">
                <strong>${escapeHtml(tyre.position)}</strong>
                ${badge(status.status)}
              </div>
              <p>${escapeHtml(tyre.brand || 'Unknown brand')} ${escapeHtml(tyre.model || '')}</p>
              <p class="muted">${escapeHtml(tyre.size || 'Size not entered')} · checked ${formatDate(tyre.lastCheckedDate)}</p>
              <div class="metric-grid">
                <div><span>Tread</span><strong>${tyre.treadDepth ?? '—'} mm</strong></div>
                <div><span>Pressure</span><strong>${tyre.pressure ?? '—'} psi</strong></div>
                <div><span>DOT age</span><strong>${tyre.dotAgeMonths ?? '—'} mo</strong></div>
                <div><span>Type</span><strong>${escapeHtml(tyre.seasonalType || '—')}</strong></div>
              </div>
              <p class="muted">${escapeHtml(status.reason)}</p>
              <div class="tag-row">
                ${flag(tyre.unevenWear, 'Uneven wear')}
                ${flag(tyre.innerEdgeWear, 'Inner edge wear')}
                ${flag(tyre.alignmentConcerns, 'Alignment concern')}
                ${flag(tyre.vibrationSymptoms, 'Vibration')}
                ${flag(tyre.sidewallDamage, 'Sidewall damage')}
                ${flag(tyre.punctureHistory, 'Repair history')}
              </div>
            </article>
          `;
        }).join('')}
      </div>
      <div class="warning-strip">
        <strong>Axle and wear notes</strong>
        <ul>${axleWarnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('') || '<li>No axle imbalance warning currently triggered.</li>'}</ul>
      </div>
    </section>

    <section class="panel panel--split">
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Update wheel record</p>
            <h2>Log tyre measurement</h2>
          </div>
        </div>
        <form class="form-grid" data-form="update-tyre">
          <label>Position
            <select name="position">
              <option value="FL">Front left</option>
              <option value="FR">Front right</option>
              <option value="RL">Rear left</option>
              <option value="RR">Rear right</option>
            </select>
          </label>
          <label>Brand<input name="brand"></label>
          <label>Model<input name="model"></label>
          <label>Size<input name="size" placeholder="205/55 R16"></label>
          <label>Fitment date<input name="fitmentDate" type="date"></label>
          <label>Fitment mileage<input name="fitmentMileage" type="number"></label>
          <label>Tread depth (mm)<input name="treadDepth" type="number" step="0.1" required></label>
          <label>Pressure (psi)<input name="pressure" type="number" step="0.5"></label>
          <label>DOT age (months)<input name="dotAgeMonths" type="number"></label>
          <label>Seasonal type
            <select name="seasonalType">
              <option value="summer">Summer</option>
              <option value="all-season">All-season</option>
              <option value="winter">Winter</option>
            </select>
          </label>
          <label>Last checked<input name="lastCheckedDate" type="date" required></label>
          <label><input name="unevenWear" type="checkbox"> Uneven wear</label>
          <label><input name="innerEdgeWear" type="checkbox"> Inner-edge wear</label>
          <label><input name="alignmentConcerns" type="checkbox"> Alignment concern</label>
          <label><input name="vibrationSymptoms" type="checkbox"> Vibration at speed</label>
          <label><input name="sidewallDamage" type="checkbox"> Sidewall damage</label>
          <label><input name="punctureHistory" type="checkbox"> Puncture / repair history</label>
          <label><input name="tpmsWarning" type="checkbox"> TPMS warning</label>
          <div class="form-actions form-grid__full">
            <button class="button button--primary" type="submit">Save tyre record</button>
          </div>
        </form>
      </div>
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Threshold model</p>
            <h2>Tyre status rules used</h2>
          </div>
        </div>
        <div class="list-stack">
          <article class="list-card"><div class="list-card__row"><strong>Green</strong>${badge('green')}</div><p>4.0 mm or above with no logged condition issues.</p></article>
          <article class="list-card"><div class="list-card__row"><strong>Amber</strong>${badge('amber')}</div><p>3.0–3.9 mm or wear/pressure/alignment concerns logged.</p></article>
          <article class="list-card"><div class="list-card__row"><strong>Red</strong>${badge('red')}</div><p>Below 3.0 mm and planning replacement.</p></article>
          <article class="list-card"><div class="list-card__row"><strong>Critical</strong>${badge('critical')}</div><p>Below 1.6 mm or unsafe damage recorded.</p></article>
        </div>
      </div>
    </section>
  `;
}

function flag(condition, label) {
  return condition ? `<span class="tag">${escapeHtml(label)}</span>` : '';
}

function diff(values) {
  if (!values.length || values.some(Number.isNaN)) return 0;
  return Math.max(...values) - Math.min(...values);
}

// ---- src/views/checklists.js ----

function renderChecklists(vehicle, templates, equipmentCatalog) {
  const owned = new Set(vehicle.ownedEquipmentIds || []);
  const missingEquipmentByTemplate = Object.fromEntries(templates.map((template) => {
    const needed = new Set(template.items.flatMap((item) => item.equipment || []));
    const missing = [...needed].filter((item) => !owned.has(item));
    return [template.id, missing];
  }));

  return `
    <section class="panel panel--split">
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Inspection routines</p>
            <h2>Checklist templates</h2>
          </div>
        </div>
        <div class="list-stack">
          ${templates.map((template) => `
            <article class="list-card">
              <div class="list-card__row">
                <strong>${escapeHtml(template.title)}</strong>
                ${badge(template.seasonal ? 'amber' : 'green')}
              </div>
              <p class="muted">${escapeHtml(template.frequency)}${template.seasonal ? ' · seasonal trigger' : ''}</p>
              <p>${template.items.length} checklist items</p>
              <p class="muted">Missing kit: ${missingEquipmentByTemplate[template.id].length ? missingEquipmentByTemplate[template.id].map((id) => escapeHtml(equipmentCatalog.find((item) => item.id === id)?.name || id)).join(', ') : 'none'}</p>
              <button class="button button--secondary" type="button" data-action="run-checklist" data-template-id="${template.id}">Start checklist run</button>
            </article>
          `).join('')}
        </div>
      </div>
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Runs</p>
            <h2>Recorded checklist runs</h2>
          </div>
        </div>
        <div class="list-stack">
          ${(vehicle.checklists || []).map((run) => `
            <article class="list-card">
              <div class="list-card__row">
                <strong>${escapeHtml(run.title)}</strong>
                ${badge(run.status === 'completed' ? 'green' : 'amber')}
              </div>
              <p class="muted">${formatDate(run.runDate)}</p>
              <ul>
                ${run.items.map((item, index) => `
                  <li>
                    <strong>${escapeHtml(item.label)}</strong> — ${escapeHtml(item.result)}${item.notes ? ` (${escapeHtml(item.notes)})` : ''}
                    <div class="inline-actions">
                      <button type="button" class="mini-button" data-action="checklist-result" data-checklist-id="${run.id}" data-item-index="${index}" data-result="complete">Complete</button>
                      <button type="button" class="mini-button" data-action="checklist-result" data-checklist-id="${run.id}" data-item-index="${index}" data-result="flagged">Flag</button>
                      <button type="button" class="mini-button" data-action="checklist-result" data-checklist-id="${run.id}" data-item-index="${index}" data-result="skipped">Skip</button>
                    </div>
                  </li>
                `).join('')}
              </ul>
            </article>
          `).join('') || '<p class="muted">No checklist runs recorded yet.</p>'}
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel__header">
        <div>
          <p class="section-kicker">Equipment advisor</p>
          <h2>Owner equipment</h2>
        </div>
      </div>
      <div class="equipment-grid">
        ${equipmentCatalog.map((item) => `
          <article class="equipment-card">
            <div class="list-card__row">
              <strong>${escapeHtml(item.name)}</strong>
              <span class="tag">${escapeHtml(item.tier)}</span>
            </div>
            <p>${escapeHtml(item.guidance)}</p>
            <p class="muted">Used for: ${escapeHtml(item.usedFor.join(', '))}</p>
            <button type="button" class="button ${owned.has(item.id) ? 'button--primary' : 'button--secondary'}" data-action="toggle-equipment" data-equipment-id="${item.id}">
              ${owned.has(item.id) ? 'Owned' : 'Mark as owned'}
            </button>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

// ---- src/views/garage.js ----

function renderGarage(vehicle) {
  return `
    <section class="panel panel--split">
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Symptoms</p>
            <h2>Warning lights and owner-reported issues</h2>
          </div>
        </div>
        <div class="list-stack">
          ${(vehicle.symptoms || []).map((symptom) => `
            <article class="list-card">
              <div class="list-card__row">
                <strong>${escapeHtml(symptom.type)}</strong>
                ${badge(symptom.severity)}
              </div>
              <p class="muted">${formatDate(symptom.seenAt)} · ${symptom.mileage?.toLocaleString('en-GB') || '—'} mi · ${symptom.safeToDrive ? 'Safe to drive recorded' : 'Do not drive recorded'}</p>
              <p>${escapeHtml(symptom.notes || '')}</p>
              <p class="muted">Linked component: ${escapeHtml(symptom.linkedComponent || 'general')} · ${symptom.resolved ? 'Resolved' : 'Unresolved'}</p>
            </article>
          `).join('') || '<p class="muted">No symptom logs yet.</p>'}

          ${(vehicle.warningLights || []).map((light) => `
            <article class="list-card">
              <div class="list-card__row">
                <strong>${escapeHtml(light.type)}</strong>
                ${badge(light.severity)}
              </div>
              <p class="muted">${formatDate(light.seenAt)} · ${light.mileage?.toLocaleString('en-GB') || '—'} mi</p>
              <p>${escapeHtml(light.notes || '')}</p>
            </article>
          `).join('')}
        </div>
      </div>
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Log issue</p>
            <h2>Add symptom</h2>
          </div>
        </div>
        <form class="form-grid" data-form="add-symptom">
          <label>Symptom / warning<input name="type" required placeholder="Brake warning light"></label>
          <label>Date seen<input name="seenAt" type="date" required></label>
          <label>Mileage<input name="mileage" type="number"></label>
          <label>Severity
            <select name="severity">
              <option value="amber">Amber</option>
              <option value="red">Red</option>
              <option value="critical">Critical</option>
            </select>
          </label>
          <label>Persistent
            <select name="persistent">
              <option value="true">Persistent</option>
              <option value="false">Intermittent</option>
            </select>
          </label>
          <label>Safe to drive
            <select name="safeToDrive">
              <option value="true">Yes</option>
              <option value="false">No / unsure</option>
            </select>
          </label>
          <label>Linked component<input name="linkedComponent" placeholder="brakes"></label>
          <label class="form-grid__full">Notes<textarea name="notes" rows="4" placeholder="Owner language is fine here: smell, pull, noise, vibration, light, rough idle, etc."></textarea></label>
          <div class="form-actions form-grid__full">
            <button class="button button--primary" type="submit">Save symptom</button>
          </div>
        </form>
      </div>
    </section>

    <section class="panel panel--split">
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Garage visits</p>
            <h2>Visit log</h2>
          </div>
        </div>
        <div class="list-stack">
          ${(vehicle.garageVisits || []).map((visit) => `
            <article class="list-card">
              <div class="list-card__row">
                <strong>${escapeHtml(visit.reason)}</strong>
                ${badge(statusFromGarage(visit.status))}
              </div>
              <p class="muted">${escapeHtml(visit.garageName || 'Garage')} · ${formatDate(visit.dateAttended || visit.dateBooked)}</p>
              <p>${escapeHtml(visit.diagnosis || visit.reason)}</p>
              <p><strong>Recommended:</strong> ${escapeHtml((visit.workRecommended || []).join(', ') || 'None listed')}</p>
              <p><strong>Completed:</strong> ${escapeHtml((visit.workCompleted || []).join(', ') || 'Nothing recorded')}</p>
              <p><strong>Declined:</strong> ${escapeHtml((visit.workDeclined || []).join(', ') || 'Nothing recorded')}</p>
              <p class="muted">Cost ${formatCurrency(visit.totalCost)}${visit.followUpDueDate ? ` · follow-up ${formatDate(visit.followUpDueDate)}` : ''}</p>
            </article>
          `).join('') || '<p class="muted">No garage visits recorded yet.</p>'}
        </div>
      </div>
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Add visit</p>
            <h2>Garage record</h2>
          </div>
        </div>
        <form class="form-grid" data-form="add-garage-visit">
          <label>Status
            <select name="status">
              <option value="booked">Booked</option>
              <option value="inspected">Inspected</option>
              <option value="quoted">Quoted</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="follow-up needed">Follow-up needed</option>
            </select>
          </label>
          <label>Date booked<input name="dateBooked" type="date"></label>
          <label>Date attended<input name="dateAttended" type="date"></label>
          <label>Garage name<input name="garageName" required></label>
          <label>Garage contact<input name="garageContact"></label>
          <label>Reason for visit<input name="reason" required placeholder="Investigate vibration at speed"></label>
          <label>Mileage<input name="mileage" type="number"></label>
          <label>Total cost<input name="totalCost" type="number"></label>
          <label>Labour cost<input name="labourCost" type="number"></label>
          <label>Parts cost<input name="partsCost" type="number"></label>
          <label>Warranty on work<input name="warranty"></label>
          <label>Follow-up due<input name="followUpDueDate" type="date"></label>
          <label class="form-grid__full">Symptoms reported<textarea name="symptomsReported" rows="3" placeholder="One line per symptom"></textarea></label>
          <label class="form-grid__full">Findings<textarea name="findings" rows="3" placeholder="One line per finding"></textarea></label>
          <label class="form-grid__full">Diagnosis<textarea name="diagnosis" rows="3"></textarea></label>
          <label class="form-grid__full">Work recommended<textarea name="workRecommended" rows="3"></textarea></label>
          <label class="form-grid__full">Work approved<textarea name="workApproved" rows="3"></textarea></label>
          <label class="form-grid__full">Work declined<textarea name="workDeclined" rows="3"></textarea></label>
          <label class="form-grid__full">Work completed<textarea name="workCompleted" rows="3"></textarea></label>
          <label class="form-grid__full">Parts used<textarea name="partsUsed" rows="3"></textarea></label>
          <label>Fluid spec used<input name="fluidSpecUsed"></label>
          <label class="form-grid__full">Notes<textarea name="notes" rows="3"></textarea></label>
          <div class="form-actions form-grid__full">
            <button class="button button--primary" type="submit">Save garage visit</button>
          </div>
        </form>
      </div>
    </section>
  `;
}

function statusFromGarage(status) {
  switch (status) {
    case 'completed':
      return 'green';
    case 'follow-up needed':
      return 'amber';
    case 'quoted':
    case 'inspected':
    case 'approved':
      return 'amber';
    case 'booked':
      return 'amber';
    default:
      return 'grey';
  }
}

// ---- src/views/documents.js ----

function renderDocuments(vehicle) {
  return `
    <section class="panel panel--split">
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Documents vault</p>
            <h2>Stored records and renewals</h2>
          </div>
        </div>
        <div class="list-stack">
          ${(vehicle.documents || []).map((doc) => `
            <article class="list-card">
              <div class="list-card__row">
                <strong>${escapeHtml(doc.title)}</strong>
                ${badge(statusForRenewal(doc.renewalDate))}
              </div>
              <p class="muted">${escapeHtml(doc.type)} · ${escapeHtml(doc.provider || '—')}</p>
              <p>Reference: ${escapeHtml(doc.reference || '—')}</p>
              <p>Renewal: ${formatDate(doc.renewalDate)}</p>
              <p>${doc.contactNumber ? `<a href="tel:${escapeHtml(doc.contactNumber)}">${escapeHtml(doc.contactNumber)}</a>` : '<span class="muted">No phone number</span>'}</p>
              <p class="muted">${escapeHtml(doc.notes || '')}</p>
            </article>
          `).join('') || '<p class="muted">No documents stored yet.</p>'}
        </div>
      </div>
      <div>
        <div class="panel__header">
          <div>
            <p class="section-kicker">Add record</p>
            <h2>Document metadata</h2>
          </div>
        </div>
        <form class="form-grid" data-form="add-document">
          <label>Type
            <select name="type">
              <option value="insurance">Insurance</option>
              <option value="breakdown">Breakdown cover</option>
              <option value="warranty">Warranty</option>
              <option value="service invoice">Service invoice</option>
              <option value="MOT certificate">MOT certificate</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>Title<input name="title" required></label>
          <label>Provider<input name="provider"></label>
          <label>Reference<input name="reference"></label>
          <label>Renewal date<input name="renewalDate" type="date"></label>
          <label>Contact number<input name="contactNumber" type="tel"></label>
          <label class="form-grid__full">Notes<textarea name="notes" rows="4" placeholder="PDF and image upload would attach here in the production build."></textarea></label>
          <div class="form-actions form-grid__full">
            <button class="button button--primary" type="submit">Save document record</button>
          </div>
        </form>
      </div>
    </section>

    <section class="panel">
      <div class="panel__header">
        <div>
          <p class="section-kicker">Version 1 note</p>
          <h2>Attachment strategy</h2>
        </div>
      </div>
      <div class="callout">
        <p>This starter app stores document metadata and renewal timing first. The production step after this is to add file storage for PDFs, invoice images, MOT certificates, quotes, photos and later voice notes, with records grouped per vehicle and exportable into a resale pack.</p>
      </div>
    </section>
  `;
}

function statusForRenewal(dateString) {
  if (!dateString) return 'grey';
  const now = new Date();
  const date = new Date(`${dateString}T00:00:00`);
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'red';
  if (diff <= 30) return 'amber';
  return 'green';
}

// ---- src/app.js ----

const app = document.querySelector('#app');
const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'vehicles', label: 'Vehicles' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'tyres', label: 'Tyres' },
  { id: 'checklists', label: 'Checklists' },
  { id: 'garage', label: 'Garage' },
  { id: 'documents', label: 'Documents' },
];

let ui = {
  activeTab: 'dashboard',
  activeVehicleId: getPrimaryVehicleId(),
  selectedComponentKey: null,
  toast: '',
};

function render() {
  const state = getState();
  const activeVehicle = state.vehicles.find((vehicle) => vehicle.id === ui.activeVehicleId) || state.vehicles[0];
  if (!activeVehicle) {
    app.innerHTML = '<main class="empty">No vehicles yet.</main>';
    return;
  }
  ui.activeVehicleId = activeVehicle.id;

  const dashboard = deriveDashboard(activeVehicle, state.checklistTemplates, state.equipmentCatalog);
  const componentDetails = ui.selectedComponentKey ? dashboard.componentMap[ui.selectedComponentKey] : null;

  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="sidebar__brand">
          <p class="eyebrow">Vehicle care system</p>
          <strong>Mobile-first ownership dashboard</strong>
        </div>
        <nav class="sidebar__nav">
          ${tabs.map((tab) => `
            <button class="nav-button ${ui.activeTab === tab.id ? 'nav-button--active' : ''}" type="button" data-action="switch-tab" data-tab="${tab.id}">
              ${escapeHtml(tab.label)}
            </button>
          `).join('')}
        </nav>
        <div class="sidebar__footer">
          <button class="button button--secondary button--full" type="button" data-action="reset-demo">Reset demo data</button>
        </div>
      </aside>

      <main class="main-content">
        <header class="topbar">
          <div>
            <p class="topbar__eyebrow">Active vehicle</p>
            <h1>${escapeHtml(activeVehicle.registration)} · ${escapeHtml(activeVehicle.make)} ${escapeHtml(activeVehicle.model)}</h1>
          </div>
          <div class="topbar__meta">
            <span>${escapeHtml(activeVehicle.powertrain)} · ${escapeHtml(activeVehicle.transmission)}</span>
            <strong>${activeVehicle.currentMileage?.toLocaleString('en-GB') || '—'} mi</strong>
          </div>
        </header>

        <div class="content-stack">
          ${renderActiveTab(ui.activeTab, state, activeVehicle, dashboard)}
        </div>
      </main>

      <aside class="detail-pane ${componentDetails ? 'detail-pane--open' : ''}">
        <div class="panel__header">
          <div>
            <p class="section-kicker">Component details</p>
            <h2>${escapeHtml(labelForComponent(ui.selectedComponentKey))}</h2>
          </div>
          <button class="icon-button" type="button" data-action="close-component">×</button>
        </div>
        ${componentDetails ? `
          <div class="list-stack">
            <article class="list-card">
              <p>${componentDetails.reason || componentDetails.detail || 'No detail available.'}</p>
            </article>
            ${relatedComponentHistory(activeVehicle, ui.selectedComponentKey)}
          </div>
        ` : '<p class="muted">Tap a component card on the dashboard to inspect it.</p>'}
      </aside>
    </div>
    ${ui.toast ? `<div class="toast">${escapeHtml(ui.toast)}</div>` : ''}
  `;
}

function renderActiveTab(tabId, state, activeVehicle, dashboard) {
  switch (tabId) {
    case 'vehicles':
      return renderVehicles(state, activeVehicle.id);
    case 'maintenance':
      return renderMaintenance(activeVehicle, dashboard.maintenance);
    case 'tyres':
      return renderTyres(activeVehicle);
    case 'checklists':
      return renderChecklists(activeVehicle, state.checklistTemplates, state.equipmentCatalog);
    case 'garage':
      return renderGarage(activeVehicle);
    case 'documents':
      return renderDocuments(activeVehicle);
    default:
      return renderDashboard(activeVehicle, dashboard);
  }
}

function labelForComponent(key) {
  const labels = {
    FL: 'Front left tyre',
    FR: 'Front right tyre',
    RL: 'Rear left tyre',
    RR: 'Rear right tyre',
    frontBrakes: 'Front brakes',
    rearBrakes: 'Rear brakes',
    engineDriveUnit: 'Engine / drive unit',
    batteryCharging: 'Battery / charging',
    cooling: 'Cooling',
    fluids: 'Fluids',
    steeringSuspension: 'Steering / suspension',
    lightsVisibility: 'Lights / visibility',
    bodyCorrosion: 'Body / corrosion',
    cabinSafety: 'Cabin safety',
    compliance: 'Legal compliance',
    recalls: 'Recalls',
    checklists: 'Checklists',
    equipment: 'Equipment',
    garage: 'Garage work',
    symptoms: 'Symptoms',
  };
  return labels[key] || 'Component';
}

function relatedComponentHistory(vehicle, key) {
  if (!key) return '';
  if (['FL', 'FR', 'RL', 'RR'].includes(key)) {
    const tyre = (vehicle.tyres || []).find((item) => item.position === key);
    if (!tyre) return '<p class="muted">No tyre record.</p>';
    return `
      <article class="list-card">
        <strong>${escapeHtml(tyre.brand || 'Unknown brand')} ${escapeHtml(tyre.model || '')}</strong>
        <p>Tread ${tyre.treadDepth ?? '—'} mm · Pressure ${tyre.pressure ?? '—'} psi</p>
        <p class="muted">Checked ${escapeHtml(tyre.lastCheckedDate || '—')}</p>
      </article>
    `;
  }

  const matchingRules = (vehicle.maintenanceRules || []).filter((rule) => {
    if (key === 'engineDriveUnit') return rule.component === 'engine';
    if (key === 'frontBrakes' || key === 'rearBrakes') return rule.component === 'brakes';
    if (key === 'batteryCharging') return rule.component === 'battery';
    if (key === 'cooling') return rule.component === 'cooling';
    if (key === 'fluids') return rule.component === 'fluids';
    if (key === 'steeringSuspension') return rule.component === 'suspension';
    if (key === 'lightsVisibility') return rule.component === 'lights';
    return false;
  });

  const ruleCards = matchingRules.length ? matchingRules.map((rule) => `
    <article class="list-card">
      <strong>${escapeHtml(rule.title)}</strong>
      <p class="muted">Last done ${escapeHtml(rule.lastDoneDate || 'not recorded')}</p>
      <p>${escapeHtml(rule.notes || 'No notes')}</p>
    </article>
  `).join('') : '<article class="list-card"><p class="muted">No linked maintenance rules stored yet.</p></article>';

  return ruleCards;
}

function formToObject(form) {
  const data = new FormData(form);
  const object = {};
  for (const [key, value] of data.entries()) {
    object[key] = value;
  }
  form.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    object[input.name] = input.checked;
  });
  return object;
}

function flash(message) {
  ui.toast = message;
  render();
  window.clearTimeout(flash.timer);
  flash.timer = window.setTimeout(() => {
    ui.toast = '';
    render();
  }, 2400);
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action], [data-component-key]');
  if (!button) return;

  if (button.dataset.componentKey) {
    ui.selectedComponentKey = button.dataset.componentKey;
    render();
    return;
  }

  const action = button.dataset.action;
  if (action === 'switch-tab') {
    ui.activeTab = button.dataset.tab;
    render();
  }
  if (action === 'switch-vehicle') {
    ui.activeVehicleId = button.dataset.vehicleId;
    ui.selectedComponentKey = null;
    render();
  }
  if (action === 'close-component') {
    ui.selectedComponentKey = null;
    render();
  }
  if (action === 'reset-demo') {
    resetState();
    ui.activeVehicleId = getPrimaryVehicleId();
    ui.selectedComponentKey = null;
    flash('Demo data reset.');
  }
  if (action === 'run-checklist') {
    addChecklistRun(ui.activeVehicleId, button.dataset.templateId);
    flash('Checklist run created.');
  }
  if (action === 'toggle-equipment') {
    toggleOwnedEquipment(ui.activeVehicleId, button.dataset.equipmentId);
    flash('Equipment list updated.');
  }
  if (action === 'checklist-result') {
    const notes = window.prompt('Optional note for this checklist item:', '') ?? '';
    updateChecklistResult(ui.activeVehicleId, button.dataset.checklistId, Number(button.dataset.itemIndex), button.dataset.result, notes);
    flash('Checklist item updated.');
  }
});

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();

  const payload = formToObject(form);

  switch (form.dataset.form) {
    case 'add-vehicle': {
      const newId = addVehicle(payload);
      ui.activeVehicleId = newId;
      ui.activeTab = 'dashboard';
      flash('Vehicle added.');
      break;
    }
    case 'add-maintenance-rule':
      addMaintenanceRule(ui.activeVehicleId, payload);
      flash('Maintenance rule added.');
      break;
    case 'complete-maintenance':
      completeMaintenance(ui.activeVehicleId, payload);
      flash('Completed work logged.');
      break;
    case 'add-mot':
      addMotRecord(ui.activeVehicleId, payload);
      flash('MOT record saved.');
      break;
    case 'add-recall':
      addRecall(ui.activeVehicleId, payload);
      flash('Recall record saved.');
      break;
    case 'update-tyre':
      updateTyre(ui.activeVehicleId, payload.position, payload);
      flash('Tyre record updated.');
      break;
    case 'add-symptom':
      addSymptom(ui.activeVehicleId, payload);
      flash('Symptom logged.');
      break;
    case 'add-garage-visit':
      addGarageVisit(ui.activeVehicleId, payload);
      flash('Garage visit saved.');
      break;
    case 'add-document':
      addDocument(ui.activeVehicleId, payload);
      flash('Document record saved.');
      break;
    default:
      break;
  }

  form.reset();
  render();
});

subscribe(() => {
  render();
});

render();

})();
