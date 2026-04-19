/* ============================================================
   Savy ToolTrack Pro — app.js  (v2 — full rebuild)
   Real-time sync: Firebase Realtime Database
   Session persistence: localStorage
   ============================================================

   FIRST-TIME SETUP (do this once before deploying):
   ─────────────────────────────────────────────────
   1. Go to https://console.firebase.google.com
   2. Click "Add project" → give it any name → Continue
   3. Disable Google Analytics (not needed) → Create project
   4. In the left menu: Build → Realtime Database → Create database
   5. Choose your region → Start in TEST MODE → Enable
   6. In the left menu: Project Settings (gear icon)
   7. Scroll to "Your apps" → click the </> (web) icon
   8. Register app with any nickname → click Register
   9. Copy the firebaseConfig values into FIREBASE_CONFIG below
   10. Save and deploy — done!

   NOTE: Test mode allows open read/write for 30 days.
   After your presentation, set proper security rules.
   ============================================================ */

/* ──────────────────────────────────────────────────────────
   STEP 1 — PASTE YOUR FIREBASE CONFIG HERE
   ────────────────────────────────────────────────────────── */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD_X-Ps0opkk_fn1Woy39nr_73EezPd2lQ",
  authDomain: "savy-civils-tool-tracker.firebaseapp.com",
  databaseURL: "https://savy-civils-tool-tracker-default-rtdb.firebaseio.com",
  projectId: "savy-civils-tool-tracker",
  storageBucket: "savy-civils-tool-tracker.firebasestorage.app",
  messagingSenderId: "963640249802",
  appId: "1:963640249802:web:90227546d51339b6b75333"
};

/* ──────────────────────────────────────────────────────────
   FIREBASE INIT
   ────────────────────────────────────────────────────────── */
firebase.initializeApp(FIREBASE_CONFIG);
const fdb = firebase.database();

/* ──────────────────────────────────────────────────────────
   STATIC DATA — users & job templates never change at runtime
   ────────────────────────────────────────────────────────── */
const USERS = {
  admin:   { id:'admin',   name:'Admin',          role:'admin',  pass:'admin',   dept:'Office'       },
  james:   { id:'james',   name:'James Khumalo',  role:'worker', pass:'james',   dept:'Construction' },
  thandi:  { id:'thandi',  name:'Thandi Mokoena', role:'worker', pass:'thandi',  dept:'Electrical'   },
  sipho:   { id:'sipho',   name:'Sipho Dlamini',  role:'worker', pass:'sipho',   dept:'Plumbing'     },
  naledi:  { id:'naledi',  name:'Naledi Sithole', role:'worker', pass:'naledi',  dept:'Lifting ops'  },
  bongani: { id:'bongani', name:'Bongani Ndlovu', role:'worker', pass:'bongani', dept:'Workshop'     },
};

const JOB_TEMPLATES = [
  { id:'JT1', name:'Electrical installation', tools:['T003','T005','T010'], duration:'3 days' },
  { id:'JT2', name:'Concrete & formwork',     tools:['T001','T004'],        duration:'5 days' },
  { id:'JT3', name:'Plumbing fit-out',        tools:['T006','T009','T007'], duration:'2 days' },
  { id:'JT4', name:'Steel erection',          tools:['T008','T007','T003'], duration:'4 days' },
];

/* ──────────────────────────────────────────────────────────
   SEED DATA — written to Firebase on very first run only
   owner:'warehouse' = belongs to the warehouse (company tool)
   owner: worker id  = personal tool, belongs to that worker
   ────────────────────────────────────────────────────────── */
const SEED = {
  tools: {
    /* ── James — Construction (10 personal tools) ── */
    T001:{ id:'T001', name:'Bosch SDS Drill',         cat:'Power tools',  owner:'james',     holder:'james',     status:'with_owner',  barcode:'BC-001', serial:'BOS-0912', since:'Mar 1',  value:4800, condition:'Good',    dueBack:'' },
    T002:{ id:'T002', name:'DeWalt Circular Saw',     cat:'Power tools',  owner:'james',     holder:'thandi',    status:'lent',        barcode:'BC-002', serial:'DEW-4471', since:'Apr 1',  value:6200, condition:'Good',    dueBack:'Apr 22' },
    T011:{ id:'T011', name:'Claw Hammer 500g',        cat:'Hand tools',   owner:'james',     holder:'james',     status:'with_owner',  barcode:'BC-011', serial:'STL-1001', since:'Jan 10', value:350,  condition:'Good',    dueBack:'' },
    T012:{ id:'T012', name:'Spirit Level 1.2m',       cat:'Measuring',    owner:'james',     holder:'james',     status:'with_owner',  barcode:'BC-012', serial:'STN-1002', since:'Jan 10', value:780,  condition:'Good',    dueBack:'' },
    T013:{ id:'T013', name:'Tape Measure 10m',        cat:'Measuring',    owner:'james',     holder:'james',     status:'with_owner',  barcode:'BC-013', serial:'STN-1003', since:'Jan 15', value:290,  condition:'Good',    dueBack:'' },
    T014:{ id:'T014', name:'Cold Chisel Set',         cat:'Hand tools',   owner:'james',     holder:'james',     status:'with_owner',  barcode:'BC-014', serial:'STL-1004', since:'Jan 15', value:420,  condition:'Fair',    dueBack:'' },
    T015:{ id:'T015', name:'Mixing Paddle Drill Bit', cat:'Power tools',  owner:'james',     holder:'james',     status:'with_owner',  barcode:'BC-015', serial:'BOS-1005', since:'Feb 1',  value:680,  condition:'Good',    dueBack:'' },
    T016:{ id:'T016', name:'Masonry Drill Set',       cat:'Hand tools',   owner:'james',     holder:'james',     status:'with_owner',  barcode:'BC-016', serial:'BOS-1006', since:'Feb 1',  value:510,  condition:'Good',    dueBack:'' },
    T017:{ id:'T017', name:'Lump Sledgehammer 2kg',   cat:'Hand tools',   owner:'james',     holder:'james',     status:'with_owner',  barcode:'BC-017', serial:'STL-1007', since:'Feb 5',  value:460,  condition:'Good',    dueBack:'' },
    T018:{ id:'T018', name:'Chalk Line Reel',         cat:'Measuring',    owner:'james',     holder:'james',     status:'with_owner',  barcode:'BC-018', serial:'STN-1008', since:'Feb 5',  value:240,  condition:'Good',    dueBack:'' },

    /* ── Thandi — Electrical (10 personal tools) ── */
    T003:{ id:'T003', name:'Laser Level',             cat:'Measuring',    owner:'thandi',    holder:'thandi',    status:'with_owner',  barcode:'BC-003', serial:'LEV-0023', since:'Mar 5',  value:3500, condition:'Good',    dueBack:'' },
    T005:{ id:'T005', name:'Socket Set 94pc',         cat:'Hand tools',   owner:'thandi',    holder:'james',     status:'lent',        barcode:'BC-005', serial:'STA-8821', since:'Mar 20', value:1800, condition:'Good',    dueBack:'Apr 20' },
    T019:{ id:'T019', name:'Multimeter Pro',          cat:'Measuring',    owner:'thandi',    holder:'thandi',    status:'with_owner',  barcode:'BC-019', serial:'FLK-2001', since:'Jan 20', value:2100, condition:'Good',    dueBack:'' },
    T020:{ id:'T020', name:'Wire Stripper',           cat:'Hand tools',   owner:'thandi',    holder:'thandi',    status:'with_owner',  barcode:'BC-020', serial:'KLE-2002', since:'Jan 20', value:480,  condition:'Good',    dueBack:'' },
    T021:{ id:'T021', name:'Crimping Tool',           cat:'Hand tools',   owner:'thandi',    holder:'thandi',    status:'with_owner',  barcode:'BC-021', serial:'KLE-2003', since:'Jan 25', value:520,  condition:'Good',    dueBack:'' },
    T022:{ id:'T022', name:'Cable Tracer Kit',        cat:'Measuring',    owner:'thandi',    holder:'thandi',    status:'with_owner',  barcode:'BC-022', serial:'FLK-2004', since:'Feb 3',  value:1950, condition:'Good',    dueBack:'' },
    T023:{ id:'T023', name:'Insulation Tester',       cat:'Measuring',    owner:'thandi',    holder:'thandi',    status:'with_owner',  barcode:'BC-023', serial:'FLK-2005', since:'Feb 3',  value:3200, condition:'Good',    dueBack:'' },
    T024:{ id:'T024', name:'Conduit Bender',          cat:'Hand tools',   owner:'thandi',    holder:'thandi',    status:'with_owner',  barcode:'BC-024', serial:'KLE-2006', since:'Feb 10', value:870,  condition:'Good',    dueBack:'' },
    T025:{ id:'T025', name:'Fish Tape 30m',           cat:'Hand tools',   owner:'thandi',    holder:'thandi',    status:'with_owner',  barcode:'BC-025', serial:'KLE-2007', since:'Feb 10', value:650,  condition:'Fair',    dueBack:'' },
    T026:{ id:'T026', name:'Phase Rotation Tester',   cat:'Measuring',    owner:'thandi',    holder:'thandi',    status:'with_owner',  barcode:'BC-026', serial:'FLK-2008', since:'Feb 15', value:1400, condition:'Good',    dueBack:'' },

    /* ── Sipho — Plumbing (10 personal tools) ── */
    T006:{ id:'T006', name:'Torque Wrench',           cat:'Hand tools',   owner:'sipho',     holder:'james',     status:'lent',        barcode:'BC-006', serial:'STA-0042', since:'Apr 14', value:1400, condition:'Good',    dueBack:'Apr 28' },
    T009:{ id:'T009', name:'Pipe Cutter',             cat:'Hand tools',   owner:'sipho',     holder:'sipho',     status:'with_owner',  barcode:'BC-009', serial:'RID-0055', since:'Mar 1',  value:950,  condition:'Good',    dueBack:'' },
    T027:{ id:'T027', name:'Basin Wrench',            cat:'Hand tools',   owner:'sipho',     holder:'sipho',     status:'with_owner',  barcode:'BC-027', serial:'RID-3001', since:'Jan 12', value:480,  condition:'Good',    dueBack:'' },
    T028:{ id:'T028', name:'Pipe Vice Stand',         cat:'Hand tools',   owner:'sipho',     holder:'sipho',     status:'with_owner',  barcode:'BC-028', serial:'RID-3002', since:'Jan 12', value:1200, condition:'Good',    dueBack:'' },
    T029:{ id:'T029', name:'Pipe Threader Set',       cat:'Hand tools',   owner:'sipho',     holder:'sipho',     status:'with_owner',  barcode:'BC-029', serial:'RID-3003', since:'Jan 18', value:2200, condition:'Good',    dueBack:'' },
    T030:{ id:'T030', name:'Drain Snake 15m',         cat:'Hand tools',   owner:'sipho',     holder:'sipho',     status:'with_owner',  barcode:'BC-030', serial:'RID-3004', since:'Jan 18', value:1800, condition:'Fair',    dueBack:'' },
    T031:{ id:'T031', name:'Soldering Torch',         cat:'Power tools',  owner:'sipho',     holder:'sipho',     status:'with_owner',  barcode:'BC-031', serial:'MAP-3005', since:'Feb 2',  value:760,  condition:'Good',    dueBack:'' },
    T032:{ id:'T032', name:'Adjustable Pipe Wrench',  cat:'Hand tools',   owner:'sipho',     holder:'sipho',     status:'with_owner',  barcode:'BC-032', serial:'RID-3006', since:'Feb 2',  value:540,  condition:'Good',    dueBack:'' },
    T033:{ id:'T033', name:'Pressure Test Kit',       cat:'Measuring',    owner:'sipho',     holder:'sipho',     status:'with_owner',  barcode:'BC-033', serial:'WKA-3007', since:'Feb 8',  value:1650, condition:'Good',    dueBack:'' },
    T034:{ id:'T034', name:'Pipe Deburring Tool',     cat:'Hand tools',   owner:'sipho',     holder:'sipho',     status:'with_owner',  barcode:'BC-034', serial:'RID-3008', since:'Feb 8',  value:320,  condition:'Good',    dueBack:'' },

    /* ── Naledi — Lifting ops (10 personal tools) ── */
    T035:{ id:'T035', name:'Load Cell Shackle 5t',    cat:'Lifting',      owner:'naledi',    holder:'naledi',    status:'with_owner',  barcode:'BC-035', serial:'CRW-4001', since:'Jan 14', value:3200, condition:'Good',    dueBack:'' },
    T036:{ id:'T036', name:'Wire Rope Sling 3m',      cat:'Lifting',      owner:'naledi',    holder:'naledi',    status:'with_owner',  barcode:'BC-036', serial:'CRW-4002', since:'Jan 14', value:1800, condition:'Good',    dueBack:'' },
    T037:{ id:'T037', name:'Rigging Hook 3.2t',       cat:'Lifting',      owner:'naledi',    holder:'naledi',    status:'with_owner',  barcode:'BC-037', serial:'CRW-4003', since:'Jan 20', value:2400, condition:'Good',    dueBack:'' },
    T038:{ id:'T038', name:'Snatch Block 2t',         cat:'Lifting',      owner:'naledi',    holder:'naledi',    status:'with_owner',  barcode:'BC-038', serial:'CRW-4004', since:'Jan 20', value:1600, condition:'Good',    dueBack:'' },
    T039:{ id:'T039', name:'Lashing Strap 6m',        cat:'Lifting',      owner:'naledi',    holder:'naledi',    status:'with_owner',  barcode:'BC-039', serial:'CRW-4005', since:'Jan 28', value:480,  condition:'Good',    dueBack:'' },
    T040:{ id:'T040', name:'Beam Clamp 1.5t',         cat:'Lifting',      owner:'naledi',    holder:'naledi',    status:'with_owner',  barcode:'BC-040', serial:'CRW-4006', since:'Jan 28', value:2800, condition:'Good',    dueBack:'' },
    T041:{ id:'T041', name:'Magnetic Lifting Eye 1t', cat:'Lifting',      owner:'naledi',    holder:'naledi',    status:'with_owner',  barcode:'BC-041', serial:'CRW-4007', since:'Feb 4',  value:3500, condition:'Good',    dueBack:'' },
    T042:{ id:'T042', name:'Levelwind Hand Winch',    cat:'Lifting',      owner:'naledi',    holder:'naledi',    status:'with_owner',  barcode:'BC-042', serial:'CRW-4008', since:'Feb 4',  value:2200, condition:'Fair',    dueBack:'' },
    T043:{ id:'T043', name:'Sling Tension Scale',     cat:'Measuring',    owner:'naledi',    holder:'naledi',    status:'with_owner',  barcode:'BC-043', serial:'CRW-4009', since:'Feb 10', value:1100, condition:'Good',    dueBack:'' },
    T044:{ id:'T044', name:'Rigger\'s Plumb Bob',     cat:'Measuring',    owner:'naledi',    holder:'naledi',    status:'with_owner',  barcode:'BC-044', serial:'CRW-4010', since:'Feb 10', value:420,  condition:'Good',    dueBack:'' },

    /* ── Bongani — Workshop (10 personal tools) ── */
    T045:{ id:'T045', name:'Bench Vice 6"',           cat:'Hand tools',   owner:'bongani',   holder:'bongani',   status:'with_owner',  barcode:'BC-045', serial:'IRW-5001', since:'Jan 10', value:1400, condition:'Good',    dueBack:'' },
    T046:{ id:'T046', name:'Ball Peen Hammer',        cat:'Hand tools',   owner:'bongani',   holder:'bongani',   status:'with_owner',  barcode:'BC-046', serial:'STL-5002', since:'Jan 10', value:380,  condition:'Good',    dueBack:'' },
    T047:{ id:'T047', name:'Tap & Die Set Metric',    cat:'Hand tools',   owner:'bongani',   holder:'bongani',   status:'with_owner',  barcode:'BC-047', serial:'IRW-5003', since:'Jan 16', value:1900, condition:'Good',    dueBack:'' },
    T048:{ id:'T048', name:'Bench Grinder 200mm',     cat:'Power tools',  owner:'bongani',   holder:'bongani',   status:'with_owner',  barcode:'BC-048', serial:'BOS-5004', since:'Jan 16', value:3200, condition:'Good',    dueBack:'' },
    T049:{ id:'T049', name:'Steel Rule 600mm',        cat:'Measuring',    owner:'bongani',   holder:'bongani',   status:'with_owner',  barcode:'BC-049', serial:'STN-5005', since:'Jan 22', value:280,  condition:'Good',    dueBack:'' },
    T050:{ id:'T050', name:'Vernier Caliper 200mm',   cat:'Measuring',    owner:'bongani',   holder:'bongani',   status:'with_owner',  barcode:'BC-050', serial:'MTO-5006', since:'Jan 22', value:920,  condition:'Good',    dueBack:'' },
    T051:{ id:'T051', name:'Thread Gauge Set',        cat:'Measuring',    owner:'bongani',   holder:'bongani',   status:'with_owner',  barcode:'BC-051', serial:'MTO-5007', since:'Feb 1',  value:540,  condition:'Good',    dueBack:'' },
    T052:{ id:'T052', name:'Hacksaw Frame + Blades',  cat:'Hand tools',   owner:'bongani',   holder:'bongani',   status:'with_owner',  barcode:'BC-052', serial:'STL-5008', since:'Feb 1',  value:310,  condition:'Good',    dueBack:'' },
    T053:{ id:'T053', name:'Allen Key Set',           cat:'Hand tools',   owner:'bongani',   holder:'bongani',   status:'with_owner',  barcode:'BC-053', serial:'IRW-5009', since:'Feb 7',  value:280,  condition:'Good',    dueBack:'' },
    T054:{ id:'T054', name:'Tin Snips Set',           cat:'Hand tools',   owner:'bongani',   holder:'bongani',   status:'with_owner',  barcode:'BC-054', serial:'IRW-5010', since:'Feb 7',  value:490,  condition:'Fair',    dueBack:'' },

    /* ── WAREHOUSE — 50 company tools ── */
    W001:{ id:'W001', name:'Chain Hoist 2t',              cat:'Lifting',      owner:'warehouse', holder:'naledi',    status:'checked_out', barcode:'WH-001', serial:'LHT-0071', since:'Apr 11', value:9500,  condition:'Good',    dueBack:'Apr 30' },
    W002:{ id:'W002', name:'Safety Harness Full Body',    cat:'Safety',       owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-002', serial:'3M-9901',  since:'',        value:2800,  condition:'Good',    dueBack:'' },
    W003:{ id:'W003', name:'Angle Grinder 230mm',         cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-003', serial:'BOS-3311', since:'',        value:2200,  condition:'Fair',    dueBack:'' },
    W004:{ id:'W004', name:'Multimeter Fluke 115',        cat:'Measuring',    owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-004', serial:'FLK-1120', since:'',        value:2100,  condition:'Damaged', dueBack:'' },
    W005:{ id:'W005', name:'Rotary Hammer Drill',         cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-005', serial:'HIL-5500', since:'',        value:7800,  condition:'Good',    dueBack:'' },
    W006:{ id:'W006', name:'Compressor 50L',              cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-006', serial:'CAP-5600', since:'',        value:6500,  condition:'Good',    dueBack:'' },
    W007:{ id:'W007', name:'Concrete Vibrator',           cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-007', serial:'WKA-5700', since:'',        value:4200,  condition:'Good',    dueBack:'' },
    W008:{ id:'W008', name:'Plate Compactor',             cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-008', serial:'WKA-5800', since:'',        value:18500, condition:'Good',    dueBack:'' },
    W009:{ id:'W009', name:'Floor Grinder',               cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-009', serial:'HTC-5900', since:'',        value:32000, condition:'Good',    dueBack:'' },
    W010:{ id:'W010', name:'Jackhammer Electric',         cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-010', serial:'HIL-6000', since:'',        value:9800,  condition:'Good',    dueBack:'' },
    W011:{ id:'W011', name:'Power Washer 200bar',         cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-011', serial:'KAR-6100', since:'',        value:8400,  condition:'Good',    dueBack:'' },
    W012:{ id:'W012', name:'Table Saw',                   cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-012', serial:'DEW-6200', since:'',        value:14500, condition:'Good',    dueBack:'' },
    W013:{ id:'W013', name:'Planer Thicknesser',          cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-013', serial:'DEW-6300', since:'',        value:11200, condition:'Good',    dueBack:'' },
    W014:{ id:'W014', name:'Welding Machine MIG',         cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-014', serial:'LIN-6400', since:'',        value:22000, condition:'Good',    dueBack:'' },
    W015:{ id:'W015', name:'Plasma Cutter',               cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-015', serial:'HYP-6500', since:'',        value:18000, condition:'Good',    dueBack:'' },
    W016:{ id:'W016', name:'Core Drill Rig',              cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-016', serial:'HIL-6600', since:'',        value:25000, condition:'Good',    dueBack:'' },
    W017:{ id:'W017', name:'Scaffold Frame Set (20pc)',   cat:'Safety',       owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-017', serial:'SCF-6700', since:'',        value:38000, condition:'Good',    dueBack:'' },
    W018:{ id:'W018', name:'Safety Harness — Full Set',   cat:'Safety',       owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-018', serial:'3M-6800',  since:'',        value:2600,  condition:'Good',    dueBack:'' },
    W019:{ id:'W019', name:'Hard Hat Class E (5 pack)',   cat:'Safety',       owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-019', serial:'MSA-6900', since:'',        value:1500,  condition:'Good',    dueBack:'' },
    W020:{ id:'W020', name:'Respirator Half-Face',        cat:'Safety',       owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-020', serial:'3M-7000',  since:'',        value:980,   condition:'Good',    dueBack:'' },
    W021:{ id:'W021', name:'Chain Block 3t',              cat:'Lifting',      owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-021', serial:'LHT-7100', since:'',        value:7200,  condition:'Good',    dueBack:'' },
    W022:{ id:'W022', name:'Gantry Crane 1t Portable',   cat:'Lifting',      owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-022', serial:'CRN-7200', since:'',        value:42000, condition:'Good',    dueBack:'' },
    W023:{ id:'W023', name:'Ratchet Strap 5t (x4)',      cat:'Lifting',      owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-023', serial:'CRW-7300', since:'',        value:1800,  condition:'Good',    dueBack:'' },
    W024:{ id:'W024', name:'Wire Rope 20m 12mm',         cat:'Lifting',      owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-024', serial:'CRW-7400', since:'',        value:2400,  condition:'Good',    dueBack:'' },
    W025:{ id:'W025', name:'Hydraulic Floor Jack 3t',    cat:'Lifting',      owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-025', serial:'TON-7500', since:'',        value:3800,  condition:'Good',    dueBack:'' },
    W026:{ id:'W026', name:'Pipe Wrench 36"',            cat:'Hand tools',   owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-026', serial:'RID-7600', since:'',        value:760,   condition:'Good',    dueBack:'' },
    W027:{ id:'W027', name:'Stillson Wrench Set',        cat:'Hand tools',   owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-027', serial:'RID-7700', since:'',        value:1100,  condition:'Good',    dueBack:'' },
    W028:{ id:'W028', name:'Extension Lead 30m',         cat:'Electrical',   owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-028', serial:'EXT-7800', since:'',        value:860,   condition:'Good',    dueBack:'' },
    W029:{ id:'W029', name:'Power Distribution Box',     cat:'Electrical',   owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-029', serial:'EXT-7900', since:'',        value:2200,  condition:'Good',    dueBack:'' },
    W030:{ id:'W030', name:'Flood Light 500W LED',       cat:'Electrical',   owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-030', serial:'LGT-8000', since:'',        value:1400,  condition:'Good',    dueBack:'' },
    W031:{ id:'W031', name:'Laser Distance Meter',       cat:'Measuring',    owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-031', serial:'BOS-8100', since:'',        value:2800,  condition:'Good',    dueBack:'' },
    W032:{ id:'W032', name:'Digital Theodolite',         cat:'Measuring',    owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-032', serial:'LEI-8200', since:'',        value:28000, condition:'Good',    dueBack:'' },
    W033:{ id:'W033', name:'Auto Level Survey',          cat:'Measuring',    owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-033', serial:'LEI-8300', since:'',        value:12000, condition:'Good',    dueBack:'' },
    W034:{ id:'W034', name:'Magnetic Base Drill',        cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-034', serial:'BDS-8400', since:'',        value:16500, condition:'Good',    dueBack:'' },
    W035:{ id:'W035', name:'Concrete Coring Machine',    cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-035', serial:'HIL-8500', since:'',        value:34000, condition:'Good',    dueBack:'' },
    W036:{ id:'W036', name:'Pipe Drain Camera',         cat:'Measuring',    owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-036', serial:'RID-8600', since:'',        value:22000, condition:'Good',    dueBack:'' },
    W037:{ id:'W037', name:'Brick Saw 350mm',            cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-037', serial:'MOK-8700', since:'',        value:8800,  condition:'Good',    dueBack:'' },
    W038:{ id:'W038', name:'Needle Scaler',              cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-038', serial:'ATA-8800', since:'',        value:3200,  condition:'Good',    dueBack:'' },
    W039:{ id:'W039', name:'Sand Blaster Pot',           cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-039', serial:'SGT-8900', since:'',        value:7400,  condition:'Fair',    dueBack:'' },
    W040:{ id:'W040', name:'Hydraulic Press 20t',        cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-040', serial:'HYD-9000', since:'',        value:18000, condition:'Good',    dueBack:'' },
    W041:{ id:'W041', name:'Wire Rope Come-Along 2t',    cat:'Lifting',      owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-041', serial:'CRW-9100', since:'',        value:1600,  condition:'Good',    dueBack:'' },
    W042:{ id:'W042', name:'Fibre Sling 3m x 4t',       cat:'Lifting',      owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-042', serial:'CRW-9200', since:'',        value:1200,  condition:'Good',    dueBack:'' },
    W043:{ id:'W043', name:'Concrete Breaker 30kg',      cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-043', serial:'BOS-9300', since:'',        value:9200,  condition:'Good',    dueBack:'' },
    W044:{ id:'W044', name:'Vacuum Lifter 200kg',        cat:'Lifting',      owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-044', serial:'VCL-9400', since:'',        value:22000, condition:'Good',    dueBack:'' },
    W045:{ id:'W045', name:'Digital Torque Wrench',      cat:'Hand tools',   owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-045', serial:'SNA-9500', since:'',        value:3800,  condition:'Good',    dueBack:'' },
    W046:{ id:'W046', name:'Trolley Jack 4t',            cat:'Lifting',      owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-046', serial:'TON-9600', since:'',        value:4200,  condition:'Good',    dueBack:'' },
    W047:{ id:'W047', name:'Portable Bandsaw',           cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-047', serial:'DEW-9700', since:'',        value:6800,  condition:'Good',    dueBack:'' },
    W048:{ id:'W048', name:'Magnetic Drill Press',       cat:'Power tools',  owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-048', serial:'BDS-9800', since:'',        value:14000, condition:'Good',    dueBack:'' },
    W049:{ id:'W049', name:'Pipe Freezer Kit',           cat:'Plumbing',     owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-049', serial:'RID-9900', since:'',        value:4500,  condition:'Good',    dueBack:'' },
    W050:{ id:'W050', name:'Smoke Generator Test Kit',   cat:'Safety',       owner:'warehouse', holder:'',          status:'warehouse',   barcode:'WH-050', serial:'SGT-9999', since:'',        value:3200,  condition:'Good',    dueBack:'' },
  },
  requests: {},
  jobs: {
    J001:{ id:'J001', templateId:'JT2', worker:'james',  site:'12 Ntemi Piliso St, Newtown, Johannesburg', client:'Growthpoint Properties', status:'active',    startDate:'Apr 14', startedAt:'Apr 14 08:12', endDate:'' },
    J002:{ id:'J002', templateId:'JT1', worker:'thandi', site:'45 Jan Smuts Ave, Rosebank, Johannesburg',  client:'Liberty Group',          status:'assigned',  startDate:'Apr 18', startedAt:'',              endDate:'' },
    J003:{ id:'J003', templateId:'JT3', worker:'sipho',  site:'8 Rivonia Rd, Sandton, Johannesburg',       client:'Investec HQ',            status:'completed', startDate:'Apr 8',  startedAt:'Apr 8 07:45',  endDate:'Apr 10' },
  },
  auditLog: {
    A1:{ id:'A1', toolId:'T002', action:'lent',     from:'james',  to:'thandi', date:'Apr 1 08:00',  conditionOut:'Good', commentOut:'Blade recently replaced', conditionIn:'',     commentIn:'',        pin:'5521', pinConfirmed:true },
    A2:{ id:'A2', toolId:'T005', action:'lent',     from:'thandi', to:'james',  date:'Mar 20 09:30', conditionOut:'Good', commentOut:'',                       conditionIn:'',     commentIn:'',        pin:'8834', pinConfirmed:true },
    A3:{ id:'A3', toolId:'T001', action:'returned', from:'naledi', to:'james',  date:'Apr 10 16:00', conditionOut:'Good', commentOut:'',                       conditionIn:'Good', commentIn:'No damage',pin:'2291', pinConfirmed:true },
  },
  notifications: {
    james:   { N2:{ id:'N2', msg:'Socket Set 94pc is overdue — was due back Apr 20', type:'overdue', unread:true, date:'Apr 21' } },
    thandi:  { N3:{ id:'N3', msg:'DeWalt Circular Saw is due back Apr 22', type:'overdue', unread:true, date:'Apr 18' } },
    sipho:   {},
    naledi:  { N4:{ id:'N4', msg:'Chain Hoist 2t is overdue — was due back Apr 19', type:'overdue', unread:true, date:'Apr 20' } },
    bongani: {},
  },
};

/* ──────────────────────────────────────────────────────────
   RUNTIME STATE
   ────────────────────────────────────────────────────────── */
let STATE = {
  tools:         {},
  requests:      {},
  jobs:          {},
  auditLog:      {},
  notifications: {},
  _loaded:       { tools:false, requests:false, jobs:false, auditLog:false },
};

const toolsArr    = ()    => Object.values(STATE.tools    || {});
const requestsArr = ()    => Object.values(STATE.requests || {});
const jobsArr     = ()    => Object.values(STATE.jobs     || {});
const auditArr    = ()    => Object.values(STATE.auditLog || {}).sort((a,b) => a.id > b.id ? -1 : 1);
const notifsArr   = uid   => Object.values(STATE.notifications[uid] || {}).sort((a,b) => a.id > b.id ? -1 : 1);

/* ──────────────────────────────────────────────────────────
   SESSION PERSISTENCE
   ────────────────────────────────────────────────────────── */
const SESSION_KEY = 'savy_tt_uid';
const saveSession  = uid => localStorage.setItem(SESSION_KEY, uid);
const clearSession = ()  => localStorage.removeItem(SESSION_KEY);
const loadSession  = ()  => localStorage.getItem(SESSION_KEY);

/* ──────────────────────────────────────────────────────────
   APP STATE
   ────────────────────────────────────────────────────────── */
let currentUser   = null;
let currentView   = '';
let borrowSearch  = '';
let loginError    = '';
let handoverState = { step:0, reqId:null, toolId:null, pin:'', condition:'', comment:'', pinErr:'', isWarehouseReturn:false };

/* ──────────────────────────────────────────────────────────
   UTILITIES
   ────────────────────────────────────────────────────────── */
const fmt     = v   => 'R ' + Math.round(v).toLocaleString('en-ZA');
const todayStr= ()  => new Date().toLocaleString('en-ZA',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
const genPin  = ()  => String(Math.floor(1000 + Math.random() * 9000));
const $       = id  => document.getElementById(id);

const uname    = id => { if (id === 'warehouse') return 'Warehouse'; return USERS[id] ? USERS[id].name : id; };
const ufirst   = id => { if (id === 'warehouse') return 'Warehouse'; return uname(id).split(' ')[0]; };
const initials = id => { if (id === 'warehouse') return 'WH'; if (!USERS[id]) return '??'; return uname(id).split(' ').map(w=>w[0]).join('').slice(0,2); };
const tById    = id => toolsArr().find(t => t.id === id);
const jTpl     = id => JOB_TEMPLATES.find(j => j.id === id);
const myJob    = uid => jobsArr().find(j => j.worker === uid && (j.status === 'assigned' || j.status === 'active'));

/* FIX: isOverdue — tool is only overdue if it's actively checked out / lent AND has a past due date */
const isOverdue = t => {
  if (!t.dueBack || t.dueBack === '') return false;
  if (t.status === 'warehouse' || t.status === 'with_owner') return false;
  /* holder must still be a worker (not empty/warehouse) */
  if (!t.holder || t.holder === 'warehouse' || t.holder === '') return false;
  return true;
};

const unreadCount = uid => notifsArr(uid).filter(n => n.unread).length;

/* ──────────────────────────────────────────────────────────
   FIREBASE WRITE HELPERS
   ────────────────────────────────────────────────────────── */
function dbUpdate(path, data)  { return fdb.ref(path).update(data); }
function dbSet(path, data)     { return fdb.ref(path).set(data); }
function dbPush(path, data)    { return fdb.ref(path).push(data); }

async function dbNotify(uid, msg, type) {
  if (!uid || uid === 'warehouse') return; /* warehouse has no notification inbox */
  const id   = 'N' + Date.now();
  const note = { id, msg, type, unread: true, date: todayStr() };
  await dbSet(`notifications/${uid}/${id}`, note);
}

/* ──────────────────────────────────────────────────────────
   FIREBASE LISTENERS
   ────────────────────────────────────────────────────────── */
function setupCoreListeners() {
  fdb.ref('tools').on('value', snap => {
    STATE.tools    = snap.val() || {};
    STATE._loaded.tools = true;
    render();
  });
  fdb.ref('requests').on('value', snap => {
    STATE.requests = snap.val() || {};
    STATE._loaded.requests = true;
    render();
  });
  fdb.ref('jobs').on('value', snap => {
    STATE.jobs     = snap.val() || {};
    STATE._loaded.jobs = true;
    render();
  });
  fdb.ref('auditLog').on('value', snap => {
    STATE.auditLog = snap.val() || {};
    STATE._loaded.auditLog = true;
    render();
  });
  fdb.ref('notifications').on('value', snap => {
    STATE.notifications = snap.val() || {};
    render();
  });
}

/* ──────────────────────────────────────────────────────────
   DATABASE INITIALISATION — seed on very first run
   ────────────────────────────────────────────────────────── */
async function initDatabase() {
  const snap = await fdb.ref('tools/T001').once('value');
  if (snap.val()) return; /* already seeded */
  await dbSet('tools',         SEED.tools);
  await dbSet('requests',      SEED.requests);
  await dbSet('jobs',          SEED.jobs);
  await dbSet('auditLog',      SEED.auditLog);
  await dbSet('notifications', SEED.notifications);
}

/* ──────────────────────────────────────────────────────────
   BADGE HELPERS
   ────────────────────────────────────────────────────────── */
function bdg(s) {
  const m = {
    warehouse:   '<span class="badge badge-gray">Warehouse</span>',
    with_owner:  '<span class="badge badge-green">With me</span>',
    lent:        '<span class="badge badge-amber">Lent out</span>',
    checked_out: '<span class="badge badge-blue">Checked out</span>',
    repair:      '<span class="badge badge-red">In repair</span>',
    pending:     '<span class="badge badge-amber">Pending</span>',
    approved:    '<span class="badge badge-blue">Approved</span>',
    completed:   '<span class="badge badge-green">Completed</span>',
    denied:      '<span class="badge badge-red">Denied</span>',
    active:      '<span class="badge badge-teal">On site</span>',
    assigned:    '<span class="badge badge-blue">Assigned</span>',
  };
  return m[s] || `<span class="badge badge-gray">${s}</span>`;
}

function condBdg(c) {
  if (!c || c === '') return '';
  if (c === 'Good')    return '<span class="badge badge-green"  style="font-size:10px">Good</span>';
  if (c === 'Fair')    return '<span class="badge badge-amber"  style="font-size:10px">Fair</span>';
  if (c === 'Damaged') return '<span class="badge badge-red"    style="font-size:10px">Damaged</span>';
  return '';
}

/* ──────────────────────────────────────────────────────────
   RENDER ROUTER
   ────────────────────────────────────────────────────────── */
function render() {
  const allLoaded = STATE._loaded.tools && STATE._loaded.requests && STATE._loaded.jobs && STATE._loaded.auditLog;
  if (!allLoaded) {
    $('root').innerHTML = renderLoading();
    return;
  }
  $('root').innerHTML = !currentUser                   ? renderLogin()
                      : currentUser.role === 'admin'  ? renderAdmin()
                      : renderWorker();
}

function go(v) {
  currentView = v;
  if (v === 'w-borrow')    borrowSearch  = '';
  if (v !== 'w-handover')  handoverState = { step:0, reqId:null, toolId:null, pin:'', condition:'', comment:'', pinErr:'', isWarehouseReturn:false };
  render();
}

/* ──────────────────────────────────────────────────────────
   AUTH
   ────────────────────────────────────────────────────────── */
function doLogin() {
  const u = ($('li-u')||{}).value.trim().toLowerCase();
  const p = ($('li-p')||{}).value.trim().toLowerCase();
  const user = USERS[u];
  if (user && user.pass === p) {
    currentUser = user;
    loginError  = '';
    currentView = user.role === 'admin' ? 'a-dash' : 'w-mytools';
    saveSession(user.id);
    render();
  } else {
    loginError = 'Invalid credentials. Try admin/admin or james/james';
    render();
  }
}

function doLogout() {
  currentUser  = null;
  currentView  = '';
  borrowSearch = '';
  clearSession();
  render();
}

/* ──────────────────────────────────────────────────────────
   LOADING SCREEN
   ────────────────────────────────────────────────────────── */
function renderLoading() {
  return `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--color-bg-secondary);">
      <div style="text-align:center">
        <div style="font-size:22px;font-weight:600;color:var(--color-text-primary);margin-bottom:10px">Savy ToolTrack Pro</div>
        <div style="font-size:13px;color:var(--color-text-secondary)">Connecting to database…</div>
      </div>
    </div>`;
}

/* ──────────────────────────────────────────────────────────
   LOGIN SCREEN
   ────────────────────────────────────────────────────────── */
function renderLogin() {
  const quick = ['admin','james','thandi','sipho','naledi','bongani']
    .map(u => `<button class="btn" style="font-size:11px;padding:3px 8px" onclick="$('li-u').value='${u}';$('li-p').value='${u}'">${u}</button>`)
    .join('');
  return `
    <div class="login-wrap">
      <div class="login-box">
        <div style="font-size:17px;font-weight:600;margin-bottom:3px;color:var(--color-text-primary)">Savy ToolTrack Pro</div>
        <div class="muted small" style="margin-bottom:16px">Sign in to your account</div>
        ${loginError ? `<div class="strip strip-err">${loginError}</div>` : ''}
        <div class="form-group">
          <label class="form-label">Username</label>
          <input class="fi-full" id="li-u" placeholder="admin, james, thandi…" onkeydown="if(event.key==='Enter')doLogin()"/>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="fi-full" id="li-p" type="password" placeholder="same as username" onkeydown="if(event.key==='Enter')doLogin()"/>
        </div>
        <button class="btn btn-primary" style="width:100%;padding:8px;margin-bottom:12px" onclick="doLogin()">Sign in</button>
        <div class="small muted" style="margin-bottom:5px">Quick login (demo):</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">${quick}</div>
      </div>
    </div>`;
}

/* ──────────────────────────────────────────────────────────
   SHELL BUILDER
   ────────────────────────────────────────────────────────── */
function shell(sb, title, body, alerts = '') {
  return `
    <div class="app">
      <div class="shell">
        ${sb}
        <div class="main">
          <div class="topbar">
            <div class="tbtitle">${title}</div>
            <div>${alerts}</div>
          </div>
          <div class="content">${body}</div>
        </div>
      </div>
    </div>`;
}

function navLi(label, v, icon, badge = '') {
  return `<div class="nav ${currentView===v?'on':''}" onclick="go('${v}')">${icon} ${label}${badge}</div>`;
}

/* ──────────────────────────────────────────────────────────
   ADMIN SIDEBAR
   ────────────────────────────────────────────────────────── */
function adminSb() {
  const p  = requestsArr().filter(r => r.status === 'pending').length;
  const od = toolsArr().filter(t => isOverdue(t)).length;
  return `
    <div class="sb">
      <div class="logo">Savy ToolTrack <span>Pro</span></div>
      <div class="nav-group">Overview</div>
      ${navLi('Dashboard',      'a-dash',        '◼')}
      ${navLi('All tools',      'a-tools',       '⚙')}
      ${navLi('Company tools',  'a-company',     '▣')}
      ${navLi('Financial view', 'a-finance',     'R')}
      ${navLi('Audit log',      'a-audit',       '▤')}
      <div class="nav-group">Workforce</div>
      ${navLi('Jobs',     'a-jobs',     '◈')}
      ${navLi('Team',     'a-team',     '◉')}
      ${navLi('Requests', 'a-requests', '⇄', p  > 0 ? `<span class="nbadge">${p}</span>` : '')}
      <div class="nav-group">System</div>
      ${navLi('Overdue tools', 'a-overdue', '⚠', od > 0 ? `<span class="nbadge">${od}</span>` : '')}
      <div class="userinf">
        <div class="av av-lg av-p">AD</div>
        <div style="flex:1;min-width:0"><div class="bold" style="font-size:12px">Admin</div></div>
        <button class="btn" style="font-size:11px;padding:3px 7px" onclick="doLogout()">Out</button>
      </div>
    </div>`;
}

/* ──────────────────────────────────────────────────────────
   WORKER SIDEBAR
   ────────────────────────────────────────────────────────── */
function workerSb() {
  const u  = currentUser;
  const uc = unreadCount(u.id);
  const mj = myJob(u.id);
  const activeDot = mj && mj.status === 'active'
    ? '<span style="margin-left:auto;width:7px;height:7px;border-radius:50%;background:#1D9E75;display:inline-block"></span>'
    : '';
  return `
    <div class="sb">
      <div class="logo">Savy ToolTrack <span>Pro</span></div>
      <div class="nav-group">My work</div>
      ${navLi('My tools',         'w-mytools',   '⚙')}
      ${navLi('Handover / return','w-handover',  '⇄')}
      ${navLi('My job site',      'w-jobsite',   '◈', activeDot)}
      <div class="nav-group">Borrow</div>
      ${navLi('Borrow from colleague',  'w-borrow',    '◉')}
      ${navLi('Request from warehouse', 'w-warehouse', '▣')}
      ${navLi('My requests',            'w-reqs',      '▤')}
      <div class="nav-group">Account</div>
      ${navLi('Notifications', 'w-notifs', '◉', uc > 0 ? `<span class="nbadge">${uc}</span>` : '')}
      <div class="userinf">
        <div class="av av-lg">${initials(u.id)}</div>
        <div style="flex:1;min-width:0">
          <div class="bold" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.name.split(' ')[0]}</div>
          <div class="muted small">${u.dept}</div>
        </div>
        <button class="btn" style="font-size:11px;padding:3px 7px" onclick="doLogout()">Out</button>
      </div>
    </div>`;
}

/* ──────────────────────────────────────────────────────────
   ADMIN — RENDER SHELL
   ────────────────────────────────────────────────────────── */
function renderAdmin() {
  const views  = { 'a-dash':aDash,'a-tools':aTools,'a-company':aCompany,'a-finance':aFinance,'a-audit':aAudit,'a-jobs':aJobs,'a-team':aTeam,'a-requests':aReqs,'a-overdue':aOverdue };
  const titles = { 'a-dash':'Dashboard','a-tools':'All tools','a-company':'Company tools (Warehouse)','a-finance':'Financial view','a-audit':'Audit log','a-jobs':'Jobs','a-team':'Team','a-requests':'Requests','a-overdue':'Overdue tools' };
  const p      = requestsArr().filter(r => r.status === 'pending').length;
  const od     = toolsArr().filter(t => isOverdue(t)).length;
  const alerts = [
    p  > 0 && currentView !== 'a-requests' ? `<span style="background:var(--color-amber-bg);color:var(--color-amber);font-size:11px;padding:3px 9px;border-radius:99px;cursor:pointer;margin-left:6px" onclick="go('a-requests')">${p} pending</span>` : '',
    od > 0 && currentView !== 'a-overdue'  ? `<span style="background:var(--color-red-bg);color:var(--color-red);font-size:11px;padding:3px 9px;border-radius:99px;cursor:pointer;margin-left:6px" onclick="go('a-overdue')">${od} overdue</span>` : '',
  ].join('');
  return shell(adminSb(), titles[currentView] || 'Dashboard', (views[currentView] || aDash)(), alerts);
}

/* ── Admin: Dashboard ── */
function aDash() {
  const od   = toolsArr().filter(t => isOverdue(t));
  const lent = toolsArr().filter(t => t.status === 'lent');
  const wh   = toolsArr().filter(t => t.owner === 'warehouse' && t.status === 'warehouse');
  return `
    <div class="metrics metrics-4">
      <div class="mc"><div class="mc-label">Total tools</div><div class="mc-val">${toolsArr().length}</div></div>
      <div class="mc"><div class="mc-label">Lent between workers</div><div class="mc-val val-o">${lent.length}</div></div>
      <div class="mc"><div class="mc-label">Overdue returns</div><div class="mc-val" style="color:${od.length?'#A32D2D':'var(--color-green)'}">${od.length}</div></div>
      <div class="mc"><div class="mc-label">Warehouse available</div><div class="mc-val val-b">${wh.length}</div></div>
    </div>
    ${od.length ? `<div class="strip strip-err">⚠ ${od.length} tool(s) overdue — see Overdue tools tab.</div>` : ''}
    <div class="sh"><span class="st">Pending requests</span></div>
    ${requestsArr().filter(r=>r.status==='pending').length ? `
    <div class="tw"><table>
      <thead><tr><th style="width:28%">Tool</th><th style="width:18%">Type</th><th style="width:20%">Worker</th><th style="width:14%">Date</th><th style="width:20%">Action</th></tr></thead>
      <tbody>${requestsArr().filter(r=>r.status==='pending').map(r=>{
        const t=tById(r.toolId)||{name:'?'};
        return `<tr>
          <td class="bold">${t.name}</td>
          <td>${r.type==='borrow_warehouse'?'<span class="badge badge-blue" style="font-size:10px">Warehouse</span>':'<span class="badge badge-amber" style="font-size:10px">Peer borrow</span>'}</td>
          <td><span class="av" style="font-size:9px">${initials(r.to)}</span> ${ufirst(r.to)}</td>
          <td class="muted">${r.date}</td>
          <td style="display:flex;gap:5px">
            <button class="btn btn-green" style="font-size:11px;padding:3px 7px" onclick="adminAct('${r.id}','approved')">Approve</button>
            <button class="btn btn-red"   style="font-size:11px;padding:3px 7px" onclick="adminAct('${r.id}','denied')">Deny</button>
          </td>
        </tr>`;}).join('')}
      </tbody>
    </table></div>` : '<div class="strip strip-ok">No pending requests.</div>'}
    <div class="sh" style="margin-top:4px"><span class="st">Recent audit activity</span></div>
    <div class="tw">${auditArr().slice(0,5).map(a=>{
      const t=tById(a.toolId)||{name:'?'};
      return `<div class="audit-row">
        <span class="av" style="font-size:9px">${initials(a.from)}</span>
        <div style="flex:1;min-width:0">
          <span class="audit-who">${ufirst(a.from)}</span>
          <span class="audit-act"> ${a.action==='lent'?'lent':'returned'} <strong>${t.name}</strong> ${a.action==='lent'?'to':'from'} ${ufirst(a.to||a.from)}</span>
          ${a.conditionOut?' · '+condBdg(a.action==='returned'?a.conditionIn:a.conditionOut):''}
          ${a.commentOut&&a.action==='lent'?`<span class="muted small"> · "${a.commentOut}"</span>`:''}
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          ${a.pinConfirmed?'<span class="badge badge-green" style="font-size:10px">PIN verified</span>':''}
          <span class="audit-time">${a.date}</span>
        </div>
      </div>`;}).join('')}
    </div>`;
}

/* ── Admin: All tools ── */
function aTools() {
  const od = toolsArr().filter(t=>isOverdue(t)).map(t=>t.id);
  return `
    <div class="tw"><table>
      <thead><tr>
        <th style="width:22%">Tool</th><th style="width:10%">Barcode</th>
        <th style="width:13%">Owner</th><th style="width:12%">Holder</th>
        <th style="width:11%">Status</th><th style="width:9%">Cond.</th>
        <th style="width:11%">Value</th><th style="width:12%">Due back</th>
      </tr></thead>
      <tbody>${toolsArr().map(t=>`<tr>
        <td class="bold">${t.name}${od.includes(t.id)?'<span class="overdue-flag">Overdue</span>':''}</td>
        <td class="mono small muted">${t.barcode}</td>
        <td>${t.owner==='warehouse'
          ? '<span class="badge badge-gray" style="font-size:10px">Warehouse</span>'
          : t.owner?`<span class="av" style="font-size:9px">${initials(t.owner)}</span> ${ufirst(t.owner)}`:'<span class="muted">—</span>'}</td>
        <td>${t.holder?`<span class="av" style="font-size:9px">${initials(t.holder)}</span> ${ufirst(t.holder)}`:'—'}</td>
        <td>${bdg(t.status)}</td>
        <td>${condBdg(t.condition)}</td>
        <td class="val-g">${fmt(t.value)}</td>
        <td style="color:${isOverdue(t)?'#A32D2D':'var(--color-text-secondary)'};">${t.dueBack||'—'}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

/* ── Admin: Company tools (Warehouse) — NEW TAB ── */
function aCompany() {
  const whTools = toolsArr().filter(t=>t.owner==='warehouse');
  const totalVal = whTools.reduce((s,t)=>s+t.value,0);
  const available = whTools.filter(t=>t.status==='warehouse');
  const checkedOut = whTools.filter(t=>t.status==='checked_out'||t.status==='lent');
  const byCategory = {};
  whTools.forEach(t=>{ byCategory[t.cat]=(byCategory[t.cat]||0)+t.value; });
  return `
    <div class="metrics metrics-4">
      <div class="mc"><div class="mc-label">Total company tools</div><div class="mc-val">${whTools.length}</div></div>
      <div class="mc"><div class="mc-label">Available in warehouse</div><div class="mc-val val-g">${available.length}</div></div>
      <div class="mc"><div class="mc-label">Currently checked out</div><div class="mc-val val-o">${checkedOut.length}</div></div>
      <div class="mc"><div class="mc-label">Fleet value</div><div class="mc-val" style="font-size:14px;font-weight:600">${fmt(totalVal)}</div></div>
    </div>
    <div class="sh"><span class="st">Category breakdown</span></div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">
      ${Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).map(([cat,val])=>`
        <div style="background:var(--color-bg-secondary);border:0.5px solid var(--color-border-light);border-radius:var(--radius-md);padding:7px 12px;display:flex;flex-direction:column;gap:2px">
          <span class="small muted">${cat}</span>
          <span class="val-g bold">${fmt(val)}</span>
        </div>`).join('')}
    </div>
    <div class="sh"><span class="st">All warehouse tools</span></div>
    <div class="tw"><table>
      <thead><tr>
        <th style="width:24%">Tool</th><th style="width:10%">Barcode</th>
        <th style="width:13%">Category</th><th style="width:13%">Status</th>
        <th style="width:14%">Current holder</th>
        <th style="width:9%">Condition</th><th style="width:11%">Value</th><th style="width:6%">Due back</th>
      </tr></thead>
      <tbody>${whTools.map(t=>`<tr>
        <td class="bold">${t.name}</td>
        <td class="mono small muted">${t.barcode}</td>
        <td class="small muted">${t.cat}</td>
        <td>${bdg(t.status)}</td>
        <td>${t.holder&&t.holder!==''?`<span class="av" style="font-size:9px">${initials(t.holder)}</span> ${ufirst(t.holder)}`:'<span class="muted">In warehouse</span>'}</td>
        <td>${condBdg(t.condition)}</td>
        <td class="val-g">${fmt(t.value)}</td>
        <td style="color:${isOverdue(t)?'#A32D2D':'var(--color-text-secondary)'};">${t.dueBack||'—'}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

/* ── Admin: Financial view ── */
function aFinance() {
  const workers  = Object.values(USERS).filter(u=>u.role==='worker');
  const allTools = toolsArr();
  const total    = allTools.reduce((s,t)=>s+t.value,0);
  const whVal    = allTools.filter(t=>t.owner==='warehouse').reduce((s,t)=>s+t.value,0);
  const lentVal  = allTools.filter(t=>t.status==='lent').reduce((s,t)=>s+t.value,0);
  const dmgVal   = allTools.filter(t=>t.condition==='Damaged').reduce((s,t)=>s+t.value,0);
  return `
    <div class="metrics metrics-4">
      <div class="mc"><div class="mc-label">Total fleet value</div><div class="mc-val">${fmt(total)}</div></div>
      <div class="mc"><div class="mc-label">Warehouse assets</div><div class="mc-val val-b">${fmt(whVal)}</div></div>
      <div class="mc"><div class="mc-label">At risk (lent out)</div><div class="mc-val val-o">${fmt(lentVal)}</div></div>
      <div class="mc"><div class="mc-label">Damaged tools value</div><div class="mc-val" style="color:#A32D2D">${fmt(dmgVal)}</div></div>
    </div>
    <div class="sh"><span class="st">Worker liability breakdown</span></div>
    <div class="tw"><table>
      <thead><tr>
        <th style="width:22%">Worker</th><th style="width:20%">Owns (personal)</th>
        <th style="width:20%">Holding (others')</th><th style="width:20%">Lent out</th>
        <th style="width:18%">Net exposure</th>
      </tr></thead>
      <tbody>${workers.map(u=>{
        const owns    = allTools.filter(t=>t.owner===u.id).reduce((s,t)=>s+t.value,0);
        const holding = allTools.filter(t=>t.holder===u.id&&t.owner!==u.id&&t.owner!=='warehouse').reduce((s,t)=>s+t.value,0);
        const lentOut = allTools.filter(t=>t.owner===u.id&&t.status==='lent').reduce((s,t)=>s+t.value,0);
        return `<tr>
          <td><span class="av" style="font-size:9px">${initials(u.id)}</span> <span class="bold">${u.name.split(' ')[0]}</span></td>
          <td class="val-g">${fmt(owns)}</td>
          <td style="color:${holding?'var(--color-amber)':'var(--color-text-tertiary)'};">${holding?fmt(holding):'—'}</td>
          <td style="color:${lentOut?'var(--color-blue-text)':'var(--color-text-tertiary)'};">${lentOut?fmt(lentOut):'—'}</td>
          <td class="${holding>0?'val-o':'val-g'}">${holding>0?'Liable: '+fmt(holding):'Clear'}</td>
        </tr>`;}).join('')}
      </tbody>
    </table></div>`;
}

/* ── Admin: Audit log ── */
function aAudit() {
  return `
    <div class="strip strip-info">Every handover and return is logged with PIN verification, condition records and comments. This is your legal paper trail.</div>
    <div class="tw"><table>
      <thead><tr>
        <th style="width:20%">Tool</th><th style="width:11%">Action</th>
        <th style="width:13%">From</th><th style="width:13%">To</th>
        <th style="width:10%">Condition</th><th style="width:12%">PIN</th>
        <th style="width:21%">Date & comment</th>
      </tr></thead>
      <tbody>${auditArr().map(a=>{
        const t=tById(a.toolId)||{name:'?'};
        return `<tr>
          <td class="bold">${t.name}</td>
          <td>${a.action==='lent'?'<span class="badge badge-amber" style="font-size:10px">Lent out</span>':'<span class="badge badge-green" style="font-size:10px">Returned</span>'}</td>
          <td><span class="av" style="font-size:9px">${initials(a.from)}</span> ${ufirst(a.from)}</td>
          <td><span class="av" style="font-size:9px">${initials(a.to)}</span> ${ufirst(a.to)}</td>
          <td>${condBdg(a.action==='lent'?a.conditionOut:a.conditionIn)||'—'}</td>
          <td>${a.pinConfirmed?`<span class="badge badge-green" style="font-size:10px">✓ ${a.pin}</span>`:'<span class="badge badge-red" style="font-size:10px">Unverified</span>'}</td>
          <td class="small muted">${a.date}${a.commentOut?' · "'+a.commentOut+'"':''}</td>
        </tr>`;}).join('')}
      </tbody>
    </table></div>`;
}

/* ── Admin: Jobs ── */
function aJobs() {
  const workers = Object.values(USERS).filter(u=>u.role==='worker');
  const onJob   = workers.filter(u=>myJob(u.id));
  const free    = workers.filter(u=>!myJob(u.id));
  return `
    <div class="metrics metrics-3">
      <div class="mc"><div class="mc-label">Workers on site</div><div class="mc-val" style="color:var(--color-teal-text)">${onJob.length}</div></div>
      <div class="mc"><div class="mc-label">Available to assign</div><div class="mc-val val-g">${free.length}</div></div>
      <div class="mc"><div class="mc-label">Total jobs</div><div class="mc-val">${jobsArr().length}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      <div>
        <div style="font-size:11px;font-weight:500;color:var(--color-text-secondary);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em">On a job site</div>
        ${onJob.length ? onJob.map(u=>{
          const j=myJob(u.id); const jt=jTpl(j.templateId);
          return `<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;border:0.5px solid var(--color-border-light);border-radius:var(--radius-md);margin-bottom:5px;background:var(--color-bg-primary)">
            <span class="av" style="font-size:9px">${initials(u.id)}</span>
            <div style="min-width:0"><div class="small bold">${u.name.split(' ')[0]}</div><div style="font-size:10px;color:var(--color-text-secondary)">${jt?jt.name:''}</div></div>
            ${bdg(j.status)}
          </div>`;}).join('')
        : '<div class="small muted">None currently on site.</div>'}
      </div>
      <div>
        <div style="font-size:11px;font-weight:500;color:var(--color-text-secondary);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em">Available to assign</div>
        ${free.length ? free.map(u=>`
          <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;border:0.5px solid var(--color-border-light);border-radius:var(--radius-md);margin-bottom:5px;background:var(--color-bg-primary)">
            <span class="av av-g" style="font-size:9px">${initials(u.id)}</span>
            <div class="small bold" style="flex:1">${u.name.split(' ')[0]}</div>
            <span class="badge badge-green" style="font-size:10px">Free</span>
          </div>`).join('')
        : '<div class="small muted">All workers assigned.</div>'}
      </div>
    </div>
    <div class="sh"><span class="st">Assign new job</span></div>
    <div class="frow">
      <select class="fi" id="jt-s" style="flex:1;min-width:130px">
        <option value="">— Job type —</option>
        ${JOB_TEMPLATES.map(j=>`<option value="${j.id}">${j.name}</option>`).join('')}
      </select>
      <select class="fi" id="jw-s" style="flex:1;min-width:120px">
        <option value="">— Worker —</option>
        ${free.map(u=>`<option value="${u.id}">${u.name}</option>`).join('')}
      </select>
      <input class="fi" id="js-s" placeholder="Site address"  style="flex:2;min-width:160px"/>
      <input class="fi" id="jc-s" placeholder="Client name"   style="flex:1;min-width:120px"/>
      <button class="btn btn-primary" onclick="assignJob()">Assign</button>
    </div>
    <div class="sh" style="margin-top:8px"><span class="st">All jobs</span></div>
    <div class="tw"><table>
      <thead><tr>
        <th style="width:22%">Job</th><th style="width:26%">Site</th>
        <th style="width:14%">Worker</th><th style="width:16%">Client</th>
        <th style="width:10%">Status</th><th style="width:12%">Started</th>
      </tr></thead>
      <tbody>${jobsArr().map(j=>{const jt=jTpl(j.templateId)||{name:'?'};return `<tr>
        <td class="bold">${jt.name}</td>
        <td class="small muted">${j.site.split(',')[0]}</td>
        <td><span class="av" style="font-size:9px">${initials(j.worker)}</span> ${ufirst(j.worker)}</td>
        <td class="small muted">${j.client||'—'}</td>
        <td>${bdg(j.status)}</td>
        <td class="small muted">${j.startedAt||j.startDate||'—'}</td>
      </tr>`;}).join('')}</tbody>
    </table></div>`;
}

async function assignJob() {
  const jtId   = ($('jt-s')||{}).value;
  const wId    = ($('jw-s')||{}).value;
  const site   = ($('js-s')||{}).value.trim();
  const client = ($('jc-s')||{}).value.trim();
  if (!jtId || !wId || !site) { alert('Please select a job type, worker and enter a site address.'); return; }
  const jt = jTpl(jtId);
  const id = 'J' + Date.now();
  await dbSet(`jobs/${id}`, { id, templateId:jtId, worker:wId, site, client, status:'assigned', startDate:todayStr(), startedAt:'', endDate:'' });
  await dbNotify(wId, `You've been assigned to: ${jt.name} at ${site.split(',')[0]}`, 'job');
  alert(`${uname(wId)} assigned to ${jt.name}. They've been notified.`);
}

/* ── Admin: Team ── */
function aTeam() {
  return Object.values(USERS).filter(u=>u.role==='worker').map(u=>{
    const ownVal     = toolsArr().filter(t=>t.owner===u.id).reduce((s,t)=>s+t.value,0);
    const holdingVal = toolsArr().filter(t=>t.holder===u.id&&t.owner!==u.id&&t.owner!=='warehouse').reduce((s,t)=>s+t.value,0);
    const j=myJob(u.id); const jt=j?jTpl(j.templateId):null;
    return `<div class="card" style="display:flex;gap:12px;align-items:flex-start">
      <div class="av av-lg">${initials(u.id)}</div>
      <div style="flex:1">
        <div class="bold" style="font-size:13px">${u.name}</div>
        <div class="muted small" style="margin-bottom:6px">${u.dept}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${j?bdg(j.status)+` <span class="muted small">${jt?jt.name:''}</span>`:'<span class="badge badge-green">Available</span>'}
          ${ownVal?`<span class="chip-g">Owns ${fmt(ownVal)}</span>`:''}
          ${holdingVal?`<span class="chip-o">Holding ${fmt(holdingVal)}</span>`:''}
        </div>
      </div>
    </div>`;}).join('');
}

/* ── Admin: Requests ── */
function aReqs() {
  const pend = requestsArr().filter(r=>r.status==='pending');
  const hist = requestsArr().filter(r=>r.status!=='pending');
  return `
    ${pend.length ? `
    <div class="tw"><table>
      <thead><tr>
        <th style="width:26%">Tool</th><th style="width:18%">Type</th>
        <th style="width:20%">Worker</th><th style="width:14%">Date</th><th style="width:22%">Action</th>
      </tr></thead>
      <tbody>${pend.map(r=>{
        const t=tById(r.toolId)||{name:'?'};
        return `<tr>
          <td class="bold">${t.name}</td>
          <td>${r.type==='borrow_warehouse'?'<span class="badge badge-blue" style="font-size:10px">Warehouse</span>':'<span class="badge badge-amber" style="font-size:10px">Peer</span>'}</td>
          <td><span class="av" style="font-size:9px">${initials(r.to)}</span> ${ufirst(r.to)}</td>
          <td class="muted">${r.date}</td>
          <td style="display:flex;gap:5px">
            <button class="btn btn-green" style="font-size:11px;padding:3px 7px" onclick="adminAct('${r.id}','approved')">Approve</button>
            <button class="btn btn-red"   style="font-size:11px;padding:3px 7px" onclick="adminAct('${r.id}','denied')">Deny</button>
          </td>
        </tr>`;}).join('')}
      </tbody>
    </table></div>` : '<div class="strip strip-ok">No pending requests.</div>'}
    ${hist.length ? `
    <div class="sh" style="margin-top:8px"><span class="st">History</span></div>
    <div class="tw"><table>
      <thead><tr>
        <th style="width:28%">Tool</th><th style="width:20%">Type</th>
        <th style="width:20%">Worker</th><th style="width:16%">Date</th><th style="width:16%">Status</th>
      </tr></thead>
      <tbody>${hist.map(r=>{
        const t=tById(r.toolId)||{name:'?'};
        return `<tr>
          <td class="bold">${t.name}</td>
          <td class="small muted">${r.type}</td>
          <td><span class="av" style="font-size:9px">${initials(r.to)}</span> ${ufirst(r.to)}</td>
          <td class="muted">${r.date}</td>
          <td>${bdg(r.status)}</td>
        </tr>`;}).join('')}
      </tbody>
    </table></div>` : ''}`;
}

/* ─────────────────────────────────────────────────────────
   ADMIN ACT — approves warehouse OR peer borrow requests
   FIX: warehouse requests produce a PIN for worker to enter;
        peer requests notify the TOOL OWNER (from) to approve,
        not admin.  Admin only approves warehouse requests.
   ─────────────────────────────────────────────────────── */
async function adminAct(reqId, status) {
  const r = requestsArr().find(x=>x.id===reqId);
  if (!r) return;
  const t = tById(r.toolId);
  const pin = genPin();
  const updates = { status };
  if (status === 'approved') {
    updates.pin    = pin;
    updates.pinUsed = false;
    if (r.type === 'borrow_warehouse' && t) {
      /* Tool remains 'warehouse' status until PIN handover is completed */
      await dbNotify(r.to,
        `Your request for ${t?t.name:'the tool'} was approved. Collect from warehouse and use PIN <strong>${pin}</strong> on the Handover screen to confirm receipt.`,
        'pin');
    } else {
      await dbNotify(r.to,
        `Your request for ${t?t.name:'the tool'} was approved — complete the PIN handover with the tool owner.`,
        'info');
    }
  } else {
    await dbNotify(r.to, `Your request for ${t?t.name:'the tool'} was denied.`, 'info');
  }
  await dbUpdate(`requests/${reqId}`, updates);
}

/* ── Admin: Overdue ── */
function aOverdue() {
  const od = toolsArr().filter(t=>isOverdue(t));
  if (!od.length) return '<div class="strip strip-ok">No overdue tools. All good!</div>';
  return `
    <div class="strip strip-err">These tools have passed their due-back date. Escalate if not returned within 48 hours.</div>
    <div class="tw"><table>
      <thead><tr>
        <th style="width:26%">Tool</th><th style="width:16%">Value</th>
        <th style="width:20%">Holder</th><th style="width:18%">Owner</th><th style="width:20%">Due back</th>
      </tr></thead>
      <tbody>${od.map(t=>`<tr>
        <td class="bold">${t.name}</td>
        <td class="val-o">${fmt(t.value)}</td>
        <td><span class="av av-a" style="font-size:9px">${initials(t.holder)}</span> ${ufirst(t.holder)}</td>
        <td>${t.owner==='warehouse'?'<span class="badge badge-gray" style="font-size:10px">Warehouse</span>':t.owner?`<span class="av" style="font-size:9px">${initials(t.owner)}</span> ${ufirst(t.owner)}`:'Company'}</td>
        <td style="color:#A32D2D;font-weight:500">${t.dueBack} <span class="overdue-flag">Overdue</span></td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

/* ──────────────────────────────────────────────────────────
   WORKER — RENDER SHELL
   ────────────────────────────────────────────────────────── */
function renderWorker() {
  const views  = { 'w-mytools':wMyTools,'w-handover':wHandover,'w-borrow':wBorrow,'w-warehouse':wWarehouse,'w-reqs':wReqs,'w-notifs':wNotifs,'w-jobsite':wJobSite };
  const titles = { 'w-mytools':'My tools','w-handover':'Handover / return','w-borrow':'Borrow from colleague','w-warehouse':'Request from warehouse','w-reqs':'My requests','w-notifs':'Notifications','w-jobsite':'My job site' };
  const uc = unreadCount(currentUser.id);
  const alerts = uc > 0 && currentView !== 'w-notifs'
    ? `<span style="background:var(--color-red-bg);color:var(--color-red);font-size:11px;padding:3px 9px;border-radius:99px;cursor:pointer" onclick="go('w-notifs')">${uc} new</span>`
    : '';
  return shell(workerSb(), titles[currentView]||'My tools', (views[currentView]||wMyTools)(), alerts);
}

/* ── Worker: My tools ── */
function wMyTools() {
  const u         = currentUser;
  const owned     = toolsArr().filter(t=>t.owner===u.id&&t.holder===u.id);
  const lentOut   = toolsArr().filter(t=>t.owner===u.id&&t.holder!==u.id&&t.status==='lent');
  /* Borrowing from peers */
  const borrowing = toolsArr().filter(t=>t.holder===u.id&&t.owner&&t.owner!==u.id&&t.owner!=='warehouse');
  /* Warehouse tools currently with this worker */
  const warehouseOut = toolsArr().filter(t=>t.holder===u.id&&t.owner==='warehouse');
  const ownVal    = owned.reduce((s,t)=>s+t.value,0);
  const lentVal   = lentOut.reduce((s,t)=>s+t.value,0);
  const borVal    = borrowing.reduce((s,t)=>s+t.value,0);
  const whVal     = warehouseOut.reduce((s,t)=>s+t.value,0);
  const overdueL  = lentOut.filter(t=>isOverdue(t));
  return `
    <div class="metrics metrics-4">
      <div class="mc"><div class="mc-label">My tools (with me)</div><div class="mc-val">${owned.length}</div><div class="chip-g" style="display:inline-block;margin-top:4px">${fmt(ownVal)}</div></div>
      <div class="mc"><div class="mc-label">Lent to others</div><div class="mc-val val-o">${lentOut.length}</div><div class="chip-o" style="display:inline-block;margin-top:4px">${fmt(lentVal)} at risk</div></div>
      <div class="mc"><div class="mc-label">Borrowed from peers</div><div class="mc-val val-b">${borrowing.length}</div><div class="chip-b" style="display:inline-block;margin-top:4px">${fmt(borVal)} liability</div></div>
      <div class="mc"><div class="mc-label">Warehouse tools with me</div><div class="mc-val" style="color:var(--color-teal-text)">${warehouseOut.length}</div><div class="chip-b" style="display:inline-block;margin-top:4px">${fmt(whVal)}</div></div>
    </div>
    ${overdueL.length?`<div class="strip strip-err">You have ${overdueL.length} overdue lent tool(s). Request them back immediately.</div>`:''}
    ${lentVal>0?`<div class="strip strip-warn">You have ${fmt(lentVal)} of your tools with other workers.</div>`:''}
    ${borVal>0?`<div class="strip strip-info">You are holding ${fmt(borVal)} worth of peers' tools. Return on time.</div>`:''}

    ${owned.length?`
      <div class="sdiv">My personal tools — in my possession</div>
      ${owned.map(t=>`<div class="card" style="display:flex;align-items:center;gap:10px">
        <div style="flex:1"><div class="bold" style="font-size:13px">${t.name}</div><div class="small muted">${t.cat} · ${t.barcode} · ${condBdg(t.condition)}</div></div>
        <span class="val-g">${fmt(t.value)}</span>
      </div>`).join('')}`:''}

    ${lentOut.length?`
      <div class="sdiv">My tools — lent to colleagues</div>
      ${lentOut.map(t=>`<div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
          <span class="bold" style="font-size:13px">${t.name}${isOverdue(t)?'<span class="overdue-flag">Overdue</span>':''}</span>
          <span class="val-o">${fmt(t.value)}</span>
        </div>
        <div class="small muted" style="margin-bottom:8px">With ${uname(t.holder)} since ${t.since} · due ${t.dueBack||'not set'}</div>
        <button class="btn btn-amber" style="font-size:11px;padding:4px 10px" onclick="recallTool('${t.id}')">Request back (48hr notice)</button>
      </div>`).join('')}`:''}

    ${borrowing.length?`
      <div class="sdiv">Borrowed from peers — my liability to return</div>
      ${borrowing.map(t=>`<div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span class="bold" style="font-size:13px">${t.name}</span><span class="val-b">${fmt(t.value)}</span>
        </div>
        <div class="small muted" style="margin-bottom:8px">Owned by ${uname(t.owner)} · ${condBdg(t.condition)} at checkout · due ${t.dueBack||'not set'}</div>
        <button class="btn" style="font-size:11px;padding:4px 10px" onclick="startReturn('${t.id}')">Return to ${ufirst(t.owner)}</button>
      </div>`).join('')}`:''}

    ${warehouseOut.length?`
      <div class="sdiv">Warehouse tools — currently with me</div>
      ${warehouseOut.map(t=>`<div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span class="bold" style="font-size:13px">${t.name}</span><span class="val-b">${fmt(t.value)}</span>
        </div>
        <div class="small muted" style="margin-bottom:2px">${t.cat} · ${t.barcode} · ${condBdg(t.condition)}</div>
        <div class="small" style="margin-bottom:8px;color:var(--color-amber)">⚑ Warehouse tool — must be returned when no longer needed${t.dueBack?' · due '+t.dueBack:''}</div>
        <button class="btn btn-amber" style="font-size:11px;padding:4px 10px" onclick="startWarehouseReturn('${t.id}')">Return to warehouse</button>
      </div>`).join('')}`:''}

    ${!owned.length&&!lentOut.length&&!borrowing.length&&!warehouseOut.length?`
      <div style="text-align:center;padding:30px 0;color:var(--color-text-secondary);font-size:13px">
        No tools on your profile yet.
        <br><button class="btn btn-primary" style="margin-top:10px" onclick="go('w-warehouse')">Request from warehouse</button>
      </div>`:''}`;
}

/* ── Worker: Handover / return (PIN flow) ── */
function wHandover() {
  const hs    = handoverState;
  const u     = currentUser;
  const steps = ['Select','Condition','Lender shows PIN','Recipient enters PIN','Complete'];
  const stepBar = steps.map((s,i)=>`
    <div class="step step-${i<hs.step?'done':i===hs.step?'active':'idle'}">
      <div class="step-num">${i<hs.step?'✓':i+1}</div>
      <div class="step-label">${s}</div>
    </div>`).join('');

  /* ── pending peer approvals where this user is the LENDER (from) — they must show PIN ── */
  const lenderHandovers = requestsArr().filter(r=>
    r.status==='approved' && r.pin && !r.pinUsed &&
    r.type==='borrow_peer' && r.from===u.id
  );
  /* ── pending approvals where this user is the BORROWER — they must enter the PIN ── */
  const borrowerHandovers = requestsArr().filter(r=>
    r.status==='approved' && r.pin && !r.pinUsed &&
    r.type==='borrow_peer' && r.to===u.id
  );
  /* ── warehouse requests approved — worker collects from warehouse, enters PIN shown in notifications ── */
  const warehouseHandovers = requestsArr().filter(r=>
    r.status==='approved' && r.pin && !r.pinUsed &&
    r.type==='borrow_warehouse' && r.to===u.id
  );
  /* ── tools this user holds that belong to another worker (peer returns) ── */
  const myPeerBorrows = toolsArr().filter(t=>t.holder===u.id&&t.owner&&t.owner!==u.id&&t.owner!=='warehouse');
  /* ── warehouse tools this worker holds ── */
  const myWhTools = toolsArr().filter(t=>t.holder===u.id&&t.owner==='warehouse');

  let body = '';

  if (hs.step === 0) {
    body = `
      <div class="strip strip-info">For a <strong>lend</strong>: the lender shows their PIN, the borrower types it in. Both parties must be physically present — this is your 2FA accountability check.</div>

      ${lenderHandovers.length?`
        <div class="sdiv">You are LENDING — show your PIN to the borrower</div>
        ${lenderHandovers.map(r=>{
          const t=tById(r.toolId)||{name:'?'};
          return `<div class="card" style="display:flex;align-items:center;gap:10px">
            <div style="flex:1">
              <div class="bold" style="font-size:13px">${t.name}</div>
              <div class="small muted">Lend to ${ufirst(r.to)} · show them PIN: <span class="mono bold" style="color:var(--color-blue-text);font-size:13px">${r.pin}</span></div>
            </div>
            <button class="btn btn-primary" style="font-size:11px" onclick="startLenderHandover('${r.id}')">Show PIN & confirm</button>
          </div>`;}).join('')}`:''}

      ${borrowerHandovers.length?`
        <div class="sdiv">You are BORROWING — enter PIN from the lender</div>
        ${borrowerHandovers.map(r=>{
          const t=tById(r.toolId)||{name:'?'};
          return `<div class="card" style="display:flex;align-items:center;gap:10px">
            <div style="flex:1">
              <div class="bold" style="font-size:13px">${t.name}</div>
              <div class="small muted">Borrowing from ${ufirst(r.from)} — they will show you their PIN</div>
            </div>
            <button class="btn btn-primary" style="font-size:11px" onclick="startBorrowerHandover('${r.id}')">Enter PIN to confirm receipt</button>
          </div>`;}).join('')}`:''}

      ${warehouseHandovers.length?`
        <div class="sdiv">Warehouse tools — confirm collection</div>
        ${warehouseHandovers.map(r=>{
          const t=tById(r.toolId)||{name:'?'};
          return `<div class="card" style="display:flex;align-items:center;gap:10px">
            <div style="flex:1">
              <div class="bold" style="font-size:13px">${t.name}</div>
              <div class="small muted">Your approval PIN was sent via notification. Enter it here to confirm you collected this tool.</div>
            </div>
            <button class="btn btn-primary" style="font-size:11px" onclick="startWarehousePickup('${r.id}')">Enter collection PIN</button>
          </div>`;}).join('')}`:''}

      ${myPeerBorrows.length?`
        <div class="sdiv">Return a borrowed tool to its owner</div>
        ${myPeerBorrows.map(t=>`
          <div class="card" style="display:flex;align-items:center;gap:10px">
            <div style="flex:1"><div class="bold" style="font-size:13px">${t.name}</div><div class="small muted">Return to ${ufirst(t.owner)}</div></div>
            <button class="btn" style="font-size:11px" onclick="startReturn('${t.id}')">Return</button>
          </div>`).join('')}
      `:''}

      ${myWhTools.length?`
        <div class="sdiv">Return a warehouse tool</div>
        ${myWhTools.map(t=>`
          <div class="card" style="display:flex;align-items:center;gap:10px">
            <div style="flex:1"><div class="bold" style="font-size:13px">${t.name}</div><div class="small muted" style="color:var(--color-amber)">⚑ Warehouse tool — return when done</div></div>
            <button class="btn btn-amber" style="font-size:11px" onclick="startWarehouseReturn('${t.id}')">Return to warehouse</button>
          </div>`).join('')}
      `:''}

      ${!lenderHandovers.length&&!borrowerHandovers.length&&!warehouseHandovers.length&&!myPeerBorrows.length&&!myWhTools.length?
        '<div class="muted" style="text-align:center;padding:26px 0;font-size:13px">No pending handovers or returns right now.</div>'
      :''}`;

  } else if (hs.step === 1) {
    /* Condition step */
    const req = requestsArr().find(r=>r.id===hs.reqId);
    const t   = tById(req?req.toolId:hs.toolId)||{name:'?',condition:''};
    const isReturn = hs.isWarehouseReturn || (!req && hs.toolId);
    body = `
      <div class="card" style="margin-bottom:14px">
        <div class="bold" style="font-size:13px;margin-bottom:8px">${t.name}</div>
        <div class="small muted" style="margin-bottom:12px">Current condition on record: ${condBdg(t.condition)||'Not recorded'}</div>
        <div class="bold small" style="margin-bottom:8px">Condition at handover</div>
        <div style="display:flex;gap:8px;margin-bottom:12px">
          ${['Good','Fair','Damaged'].map(c=>`<button class="cond-btn cond-${c.toLowerCase()} ${hs.condition===c?'sel':''}" onclick="setCondition('${c}')">${c}</button>`).join('')}
        </div>
        <div class="bold small" style="margin-bottom:6px">Comment (optional)</div>
        <textarea class="fi-full" id="cmt-inp" rows="2" placeholder="e.g. small scratch on handle, fully functional…" style="resize:none">${hs.comment}</textarea>
        <div style="margin-top:12px">
          ${!hs.condition
            ?'<div class="strip strip-warn" style="margin:0">Please select a condition rating to continue.</div>'
            :`<button class="btn btn-primary" style="width:100%;padding:8px" onclick="generatePin()">Generate handover PIN →</button>`}
        </div>
      </div>`;

  } else if (hs.step === 2) {
    /* Lender / giver shows PIN — this is displayed on THEIR screen */
    const req = requestsArr().find(r=>r.id===hs.reqId);
    const t   = tById(req?req.toolId:hs.toolId)||{name:'?'};
    const recipientName = req ? ufirst(req.to) : (hs.isWarehouseReturn ? 'Warehouse' : ufirst((tById(hs.toolId)||{}).owner));
    body = `
      <div class="pin-box">
        <div class="bold" style="font-size:13px">Lend-out PIN for ${t.name}</div>
        <div class="small muted" style="margin:6px 0">Show this to <strong>${recipientName}</strong>. They must type it in on their screen to confirm receipt.</div>
        <div class="pin-display">${hs.pin}</div>
        <div class="small muted">One-time use · expires on entry · this PIN is your proof of handover</div>
      </div>
      <button class="btn btn-primary" style="width:100%;padding:8px" onclick="handoverState.step=3;render()">Other worker is ready →</button>`;

  } else if (hs.step === 3) {
    /* RECIPIENT enters PIN */
    const req = requestsArr().find(r=>r.id===hs.reqId);
    const t   = tById(req?req.toolId:hs.toolId)||{name:'?'};
    body = `
      <div style="text-align:center;padding:10px 0 16px">
        <div class="bold" style="font-size:13px;margin-bottom:4px">Enter the 4-digit PIN</div>
        <div class="small muted" style="margin-bottom:14px">The person handing over <strong>${t.name}</strong> is showing you their PIN. Type it here to confirm receipt.</div>
        <input class="pin-input" id="pin-entry" maxlength="4" placeholder="----" type="number" oninput="this.value=this.value.slice(0,4)"/>
        ${hs.pinErr?`<div class="strip strip-err" style="margin-top:10px;text-align:left">${hs.pinErr}</div>`:''}
        <button class="btn btn-primary" style="margin-top:14px;padding:8px 28px" onclick="confirmPin()">Confirm handover</button>
      </div>`;

  } else if (hs.step === 4) {
    body = `
      <div style="text-align:center;padding:24px 0">
        <div style="width:52px;height:52px;border-radius:50%;background:var(--color-green-bg);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:24px;color:var(--color-green);">✓</div>
        <div class="bold" style="font-size:15px;margin-bottom:6px">Handover complete</div>
        <div class="muted small" style="margin-bottom:6px">PIN verified. Audit record saved. Condition logged.</div>
        <div class="small" style="color:var(--color-text-tertiary);margin-bottom:20px">Both parties are on record for this transfer.</div>
        <button class="btn btn-primary" onclick="go('w-mytools')">Back to my tools</button>
      </div>`;
  }

  return `<div class="step-bar">${stepBar}</div>${body}`;
}

/* ── Handover flow entry points ── */
function startLenderHandover(reqId) {
  /* Lender starts by logging condition then revealing the pre-approved PIN */
  handoverState = { step:1, reqId, toolId:null, pin:'', condition:'', comment:'', pinErr:'', isWarehouseReturn:false };
  currentView   = 'w-handover';
  render();
}

function startBorrowerHandover(reqId) {
  /* Borrower jumps straight to PIN entry — lender already showed PIN */
  const r = requestsArr().find(x=>x.id===reqId);
  if (!r) return;
  handoverState = { step:3, reqId, toolId:null, pin:r.pin, condition:'', comment:'', pinErr:'', isWarehouseReturn:false };
  currentView   = 'w-handover';
  render();
}

function startWarehousePickup(reqId) {
  /* Worker collects from warehouse — they enter the PIN that was in their notification */
  const r = requestsArr().find(x=>x.id===reqId);
  if (!r) return;
  handoverState = { step:3, reqId, toolId:null, pin:r.pin, condition:'', comment:'', pinErr:'', isWarehouseReturn:false };
  currentView   = 'w-handover';
  render();
}

function startReturn(toolId) {
  /* Return a peer-borrowed tool */
  handoverState = { step:1, reqId:null, toolId, pin:'', condition:'', comment:'', pinErr:'', isWarehouseReturn:false };
  currentView   = 'w-handover';
  render();
}

function startWarehouseReturn(toolId) {
  /* Return a warehouse tool */
  handoverState = { step:1, reqId:null, toolId, pin:'', condition:'', comment:'', pinErr:'', isWarehouseReturn:true };
  currentView   = 'w-handover';
  render();
}

function setCondition(c) {
  const cmt = ($('cmt-inp')||{}).value||'';
  handoverState.condition = c;
  handoverState.comment   = cmt;
  render();
}

function generatePin() {
  const cmt = ($('cmt-inp')||{}).value||'';
  handoverState.comment = cmt;
  handoverState.pin     = genPin();
  handoverState.step    = 2;
  render();
}

async function confirmPin() {
  const entered = ($('pin-entry')||{}).value||'';
  if (entered !== handoverState.pin) {
    handoverState.pinErr = 'Incorrect PIN. Ask the other worker to show their PIN again.';
    render();
    return;
  }
  const req    = requestsArr().find(r=>r.id===handoverState.reqId);
  const toolId = req ? req.toolId : handoverState.toolId;
  const t      = tById(toolId);
  if (!t) return;

  const isReturn          = !req; /* no request = it's a return */
  const isWarehouseReturn = isReturn && handoverState.isWarehouseReturn;
  const aId               = 'A' + Date.now();

  if (!isReturn && req && req.type === 'borrow_peer') {
    /* ── Peer lend handover ── */
    await dbUpdate(`tools/${toolId}`, { holder:req.to, status:'lent', since:todayStr(), dueBack:dueInDays(14), condition:handoverState.condition });
    await dbUpdate(`requests/${req.id}`, { pinUsed:true, status:'completed' });
    await dbSet(`auditLog/${aId}`, { id:aId, toolId, action:'lent', from:currentUser.id, to:req.to, date:todayStr(), conditionOut:handoverState.condition, commentOut:handoverState.comment, conditionIn:'', commentIn:'', pin:handoverState.pin, pinConfirmed:true });
    await dbNotify(req.from, `${uname(req.to)} confirmed receipt of your ${t.name}. Handover PIN verified.`, 'info');

  } else if (!isReturn && req && req.type === 'borrow_warehouse') {
    /* ── Warehouse pickup confirmed ── */
    await dbUpdate(`tools/${toolId}`, { holder:req.to, status:'checked_out', since:todayStr(), dueBack:dueInDays(30), condition:t.condition });
    await dbUpdate(`requests/${req.id}`, { pinUsed:true, status:'completed' });
    await dbSet(`auditLog/${aId}`, { id:aId, toolId, action:'lent', from:'warehouse', to:req.to, date:todayStr(), conditionOut:t.condition, commentOut:'Collected from warehouse', conditionIn:'', commentIn:'', pin:handoverState.pin, pinConfirmed:true });

  } else if (isWarehouseReturn) {
    /* ── Return to warehouse — FIX: clear holder, set status back to warehouse ── */
    const prevHolder = t.holder;
    await dbUpdate(`tools/${toolId}`, { holder:'', status:'warehouse', since:'', dueBack:'', condition:handoverState.condition });
    await dbSet(`auditLog/${aId}`, { id:aId, toolId, action:'returned', from:prevHolder, to:'warehouse', date:todayStr(), conditionOut:t.condition, commentOut:'', conditionIn:handoverState.condition, commentIn:handoverState.comment, pin:handoverState.pin, pinConfirmed:true });

  } else if (isReturn) {
    /* ── Return to peer owner ── */
    const prevHolder = t.holder;
    const owner      = t.owner;
    await dbUpdate(`tools/${toolId}`, { holder:owner, status:'with_owner', since:todayStr(), dueBack:'', condition:handoverState.condition });
    await dbSet(`auditLog/${aId}`, { id:aId, toolId, action:'returned', from:prevHolder, to:owner, date:todayStr(), conditionOut:t.condition, commentOut:'', conditionIn:handoverState.condition, commentIn:handoverState.comment, pin:handoverState.pin, pinConfirmed:true });
    await dbNotify(owner, `${currentUser.name} returned your ${t.name} — condition: ${handoverState.condition}`, 'info');
  }

  handoverState.step = 4;
  render();
}

function dueInDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('en-ZA', { day:'2-digit', month:'short' });
}

/* ── Worker: Borrow from colleague ── */
function wBorrow() {
  const u      = currentUser;
  return `
    <div class="strip strip-info">Find a colleague's tool to borrow. Your request goes to <strong>the tool owner</strong> for approval — not admin. Once they approve, complete the handover with their PIN.</div>
    <div style="margin-bottom:12px">
      <input class="fi" id="bsrch" placeholder="Search tool name or worker…" value="${borrowSearch}" oninput="borrowSearch=this.value;document.getElementById('blist').innerHTML=renderBorrowList()" style="width:100%"/>
    </div>
    <div id="blist">${renderBorrowList()}</div>`;
}

function renderBorrowList() {
  const u     = currentUser;
  const peers = toolsArr().filter(t=>
    t.holder && t.holder !== u.id &&
    t.owner  && t.owner  !== u.id &&
    t.owner  !== 'warehouse' &&         /* warehouse tools go through wWarehouse */
    (t.status==='with_owner'||t.status==='lent') &&
    (borrowSearch ? t.name.toLowerCase().includes(borrowSearch.toLowerCase()) || uname(t.holder).toLowerCase().includes(borrowSearch.toLowerCase()) : false)
  );
  if (!borrowSearch) return '<div class="muted" style="text-align:center;padding:26px 0;font-size:13px">Start typing to find a tool</div>';
  if (!peers.length) return `<div class="muted" style="text-align:center;padding:18px 0;font-size:13px">No results for "${borrowSearch}"</div>`;
  return peers.map(t=>`
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span class="bold" style="font-size:13px">${t.name}</span>${condBdg(t.condition)}
      </div>
      <div class="small muted" style="margin-bottom:6px">Held by ${uname(t.holder)} · Replacement value: <strong class="val-o">${fmt(t.value)}</strong></div>
      <div class="strip strip-warn" style="margin-bottom:8px">By requesting this tool you acknowledge liability for <strong>${fmt(t.value)}</strong> if lost or damaged.</div>
      <button class="btn btn-primary" style="font-size:11px;padding:4px 10px" onclick="sendBorrowReq('${t.id}','${t.owner}')">Request from ${ufirst(t.owner)}</button>
    </div>`).join('');
}

/*
 * FIX: Peer borrow request now goes to the TOOL OWNER for approval (not admin).
 *      The owner sees it in their notifications and approves/denies via their
 *      dedicated "Approve requests" section that appears in their My tools tab
 *      (or notifications).  Once approved, the PIN is generated and the
 *      two-party handover flow begins.
 */
async function sendBorrowReq(toolId, ownerId) {
  const t  = tById(toolId)||{name:'?',value:0};
  const id = 'RQ' + Date.now();
  const pin = genPin();
  await dbSet(`requests/${id}`, {
    id, type:'borrow_peer', toolId,
    from:ownerId, to:currentUser.id,
    status:'pending', pin, pinUsed:false,
    note:'', date:todayStr(), conditionOut:'', commentOut:''
  });
  /* Notify the OWNER to approve or deny */
  await dbNotify(ownerId,
    `${currentUser.name} is requesting your ${t.name} (${fmt(t.value)}) — go to My requests to approve or deny.`,
    'req'
  );
  alert(`Request sent to ${ufirst(ownerId)} (the tool owner). Once they approve, the handover PIN will be activated.`);
  go('w-reqs');
}

/* ── Worker: Request from warehouse ── */
function wWarehouse() {
  const avail = toolsArr().filter(t=>t.status==='warehouse'&&t.owner==='warehouse');
  return `
    <div class="strip strip-info">These are <strong>company (warehouse) tools</strong>. All requests go to admin for approval. Once approved, collect the tool and enter your approval PIN in the Handover screen to confirm receipt.</div>
    ${avail.length ? avail.map(t=>`
      <div class="card">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span class="bold" style="font-size:13px">${t.name}</span>${condBdg(t.condition)}
        </div>
        <div class="small muted" style="margin-bottom:4px">${t.cat} · ${t.barcode}</div>
        <div class="small" style="margin-bottom:8px">
          <span class="badge badge-gray" style="font-size:10px;margin-right:4px">Warehouse</span>
          Value: <strong class="val-g">${fmt(t.value)}</strong>
        </div>
        <button class="btn btn-primary" style="font-size:11px;padding:4px 10px" onclick="reqWarehouse('${t.id}')">Request this tool</button>
      </div>`).join('')
    : '<div class="muted" style="text-align:center;padding:20px 0;font-size:13px">No warehouse tools available right now.</div>'}`;
}

async function reqWarehouse(toolId) {
  const t  = tById(toolId)||{name:'?'};
  const id = 'RQ' + Date.now();
  await dbSet(`requests/${id}`, {
    id, type:'borrow_warehouse', toolId,
    from:'warehouse', to:currentUser.id,
    status:'pending', pin:'', pinUsed:false,
    note:'', date:todayStr(), conditionOut:'', commentOut:''
  });
  alert(`Request submitted for ${t.name}. You'll be notified when approved — collect once approved and confirm with your PIN.`);
  go('w-reqs');
}

/* ── Worker: My requests (& approve/deny peer requests for tools I OWN) ── */
function wReqs() {
  const uid  = currentUser.id;
  /* Requests this worker made */
  const mine = requestsArr().filter(r=>r.to===uid);
  /* Requests for tools this worker OWNS (needs their approval) */
  const pendingForMe = requestsArr().filter(r=>r.from===uid&&r.type==='borrow_peer'&&r.status==='pending');

  return `
    ${pendingForMe.length?`
    <div class="strip strip-warn">You have ${pendingForMe.length} pending request(s) for your tools. Approve or deny below.</div>
    <div class="sdiv">Requests for my tools — need my approval</div>
    <div class="tw"><table>
      <thead><tr>
        <th style="width:30%">Tool</th><th style="width:22%">Requested by</th>
        <th style="width:16%">Date</th><th style="width:32%">Action</th>
      </tr></thead>
      <tbody>${pendingForMe.map(r=>{
        const t=tById(r.toolId)||{name:'?'};
        return `<tr>
          <td class="bold">${t.name}</td>
          <td><span class="av" style="font-size:9px">${initials(r.to)}</span> ${ufirst(r.to)}</td>
          <td class="muted">${r.date}</td>
          <td style="display:flex;gap:5px">
            <button class="btn btn-green" style="font-size:11px;padding:3px 7px" onclick="workerApprovePeer('${r.id}','approved')">✓ Approve</button>
            <button class="btn btn-red"   style="font-size:11px;padding:3px 7px" onclick="workerApprovePeer('${r.id}','denied')">✗ Deny</button>
          </td>
        </tr>`;}).join('')}
      </tbody>
    </table></div>`:''}

    <div class="sdiv">My requests</div>
    ${mine.length ? `
    <div class="tw"><table>
      <thead><tr>
        <th style="width:28%">Tool</th><th style="width:16%">Value</th>
        <th style="width:16%">Type</th><th style="width:14%">Date</th>
        <th style="width:14%">Status</th><th style="width:12%">PIN</th>
      </tr></thead>
      <tbody>${mine.map(r=>{
        const t=tById(r.toolId)||{name:'?',value:0};
        return `<tr>
          <td class="bold">${t.name}</td>
          <td class="val-g">${fmt(t.value)}</td>
          <td class="small muted">${r.type==='borrow_warehouse'?'Warehouse':'Peer'}</td>
          <td class="muted">${r.date}</td>
          <td>${bdg(r.status)}</td>
          <td class="mono bold" style="color:var(--color-blue-text);">${r.status==='approved'&&r.pin&&!r.pinUsed?r.pin:'—'}</td>
        </tr>`;}).join('')}
      </tbody>
    </table></div>`
    : '<div class="muted small" style="text-align:center;padding:16px 0">No requests yet.</div>'}`;
}

/* Worker approves/denies a peer borrow request for a tool they own */
async function workerApprovePeer(reqId, status) {
  const r = requestsArr().find(x=>x.id===reqId);
  if (!r) return;
  const t = tById(r.toolId);
  if (status === 'approved') {
    /* PIN was already generated when request was created — activate it */
    await dbUpdate(`requests/${reqId}`, { status:'approved' });
    /* Notify lender (themselves) — pin shows in lender handover section */
    await dbNotify(r.from,
      `You approved ${ufirst(r.to)}'s request for your ${t?t.name:'tool'}. Go to Handover to show the lend-out PIN: ${r.pin}`,
      'pin'
    );
    /* Notify borrower */
    await dbNotify(r.to,
      `${ufirst(r.from)} approved your request for ${t?t.name:'the tool'}. Go to Handover / return → Enter PIN to complete the transfer.`,
      'pin'
    );
    alert(`Approved! The PIN handover is now activated. Both you and ${ufirst(r.to)} can proceed on the Handover screen.`);
  } else {
    await dbUpdate(`requests/${reqId}`, { status:'denied' });
    await dbNotify(r.to, `${ufirst(r.from)} denied your request for ${t?t.name:'the tool'}.`, 'info');
    alert(`Request denied.`);
  }
}

/* ── Worker: Job site ── */
function wJobSite() {
  const j = myJob(currentUser.id);
  if (!j) return `
    <div style="text-align:center;padding:40px 0;color:var(--color-text-secondary);font-size:13px">
      You have not been assigned to a job site yet.<br>
      <span class="small">Contact your admin to be assigned.</span>
    </div>`;
  const jt          = jTpl(j.templateId)||{name:'?',tools:[],duration:''};
  const isActive    = j.status === 'active';
  const toolsNeeded = jt.tools.map(tid=>tById(tid)).filter(Boolean);
  const missing     = toolsNeeded.filter(t=>t.holder!==currentUser.id);
  return `
    <div class="job-site-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">
        <div>
          <div class="bold" style="font-size:15px">${jt.name}</div>
          <div class="small muted" style="margin-top:2px">${j.client||'Client not set'}</div>
        </div>
        ${bdg(j.status)}
      </div>
      <div class="small muted" style="margin-bottom:4px">Site address</div>
      <div class="bold" style="font-size:13px;margin-bottom:10px;padding:8px 12px;background:var(--color-bg-secondary);border-radius:var(--radius-md)">${j.site}</div>
      <div class="small muted" style="margin-bottom:14px">Scheduled: ${j.startDate}${isActive?' · Started: '+j.startedAt:''} · Est. duration: ${jt.duration}</div>
      ${isActive
        ?`<button class="btn btn-finish" onclick="finishJob('${j.id}')">Mark job complete</button>`
        :`<button class="btn btn-start"  onclick="startJob('${j.id}')">Start job — I'm on site</button>`}
    </div>
    ${missing.length?`<div class="strip strip-warn">You are missing ${missing.length} required tool(s). Request them before starting.</div>`:''}
    <div class="sdiv">Required tools for this job</div>
    ${toolsNeeded.map(t=>{
      const have=t.holder===currentUser.id;
      return `<div class="card" style="display:flex;align-items:center;gap:10px">
        <span class="dot ${have?'dot-g':'dot-r'}"></span>
        <div style="flex:1"><div class="bold" style="font-size:13px">${t.name}</div><div class="small muted">${t.cat}</div></div>
        ${have
          ?'<span class="badge badge-green" style="font-size:10px">I have it</span>'
          :'<span class="badge badge-red" style="font-size:10px">Not with me</span> <button class="btn btn-primary" style="font-size:10px;padding:3px 8px;margin-left:4px" onclick="go(\'w-warehouse\')">Request</button>'}
      </div>`;}).join('')}`;
}

async function startJob(jId) {
  await dbUpdate(`jobs/${jId}`, { status:'active', startedAt:todayStr() });
}
async function finishJob(jId) {
  const j  = jobsArr().find(x=>x.id===jId);
  const jt = j ? jTpl(j.templateId) : null;
  await dbUpdate(`jobs/${jId}`, { status:'completed', endDate:todayStr() });
  await dbNotify(currentUser.id, `Job complete: ${jt?jt.name:'Job'}. Please return all job kit tools to the warehouse.`, 'info');
  alert('Job marked complete. Remember to return all tools from this job kit.');
}

/* ── Worker: Notifications ── */
async function wNotifs_markRead(uid) {
  const notifs = STATE.notifications[uid] || {};
  const updates = {};
  Object.keys(notifs).forEach(k => { if (notifs[k].unread) updates[`${k}/unread`] = false; });
  if (Object.keys(updates).length) await fdb.ref(`notifications/${uid}`).update(updates);
}

function wNotifs() {
  const uid    = currentUser.id;
  const notifs = notifsArr(uid);
  wNotifs_markRead(uid);
  if (!notifs.length) return '<div class="muted" style="text-align:center;padding:26px 0;font-size:13px">No notifications.</div>';
  const typeClass = { req:'notif-req', recall:'notif-recall', job:'notif-job', overdue:'notif-recall', pin:'notif-req', info:'notif-job' };
  return notifs.map(n=>`
    <div class="notif-card ${typeClass[n.type]||''}">
      <div class="bold" style="font-size:12px;margin-bottom:2px">${n.msg}</div>
      <div class="small muted">${n.date}</div>
    </div>`).join('');
}

async function recallTool(toolId) {
  const t = tById(toolId)||{name:'?',value:0};
  await dbNotify(t.holder, `${currentUser.name} is recalling their ${t.name} (${fmt(t.value)}) — please return within 48 hours`, 'recall');
  alert(`48-hour recall notice sent to ${ufirst(t.holder)}.`);
}

/* ──────────────────────────────────────────────────────────
   BOOTSTRAP
   ────────────────────────────────────────────────────────── */
async function boot() {
  if (FIREBASE_CONFIG.apiKey === 'PASTE_YOUR_apiKey_HERE') {
    $('root').innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--color-bg-secondary);">
        <div style="background:#fff;border-radius:12px;padding:28px;max-width:420px;border:0.5px solid #e5e7eb">
          <div style="font-size:18px;font-weight:600;margin-bottom:12px;color:#1a1a1a">Firebase setup required</div>
          <div style="font-size:13px;color:#6b7280;line-height:1.6;margin-bottom:14px">
            Follow the 5-minute setup in the comments at the top of <strong>app.js</strong>, then paste your Firebase config into the <code>FIREBASE_CONFIG</code> object.
          </div>
          <div style="font-size:12px;background:#f5f5f4;padding:10px 12px;border-radius:8px;font-family:monospace;color:#374151">
            1. console.firebase.google.com<br>
            2. New project → Realtime Database → Test mode<br>
            3. Project Settings → Web app → copy config<br>
            4. Paste into FIREBASE_CONFIG in app.js<br>
            5. Deploy to Vercel again
          </div>
        </div>
      </div>`;
    return;
  }

  await initDatabase();
  setupCoreListeners();

  const savedId = loadSession();
  if (savedId && USERS[savedId]) {
    currentUser = USERS[savedId];
    currentView = currentUser.role === 'admin' ? 'a-dash' : 'w-mytools';
  }
}

boot();
