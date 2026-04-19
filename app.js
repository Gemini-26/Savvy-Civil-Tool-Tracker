/* ============================================================
   Savy ToolTrack Pro — app.js
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
  apiKey:            "AIzaSyD_X-Ps0opkk_fn1Woy39nr_73EezPd2lQ",
  authDomain:        "savy-civils-tool-tracker.firebaseapp.com",
  databaseURL:       "https://savy-civils-tool-tracker-default-rtdb.firebaseio.com",
  projectId:         "savy-civils-tool-tracker",
  storageBucket:     "savy-civils-tool-tracker.firebasestorage.app",
  messagingSenderId: "963640249802",
  appId:             "1:963640249802:web:90227546d51339b6b75333"
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
   ────────────────────────────────────────────────────────── */
const SEED = {
  tools: {
    T001:{ id:'T001', name:'Bosch SDS Drill',     cat:'Power tools', owner:'james',  holder:'james',  status:'with_owner',  barcode:'BC-001', serial:'BOS-0912', since:'Mar 1',  value:4800, condition:'Good',    dueBack:'' },
    T002:{ id:'T002', name:'DeWalt Circular Saw',  cat:'Power tools', owner:'james',  holder:'thandi', status:'lent',        barcode:'BC-002', serial:'DEW-4471', since:'Apr 1',  value:6200, condition:'Good',    dueBack:'Apr 22' },
    T003:{ id:'T003', name:'Laser Level',          cat:'Measuring',   owner:'thandi', holder:'thandi', status:'with_owner',  barcode:'BC-003', serial:'LEV-0023', since:'Mar 5',  value:3500, condition:'Good',    dueBack:'' },
    T004:{ id:'T004', name:'Angle Grinder',        cat:'Power tools', owner:'sipho',  holder:'',       status:'warehouse',   barcode:'BC-004', serial:'BOS-3311', since:'',        value:2200, condition:'Fair',    dueBack:'' },
    T005:{ id:'T005', name:'Socket Set 94pc',      cat:'Hand tools',  owner:'thandi', holder:'james',  status:'lent',        barcode:'BC-005', serial:'STA-8821', since:'Mar 20', value:1800, condition:'Good',    dueBack:'Apr 20' },
    T006:{ id:'T006', name:'Torque Wrench',        cat:'Hand tools',  owner:'sipho',  holder:'james',  status:'lent',        barcode:'BC-006', serial:'STA-0042', since:'Apr 14', value:1400, condition:'Good',    dueBack:'Apr 28' },
    T007:{ id:'T007', name:'Safety Harness',       cat:'Safety',      owner:'',       holder:'',       status:'warehouse',   barcode:'BC-007', serial:'3M-9901',  since:'',        value:2800, condition:'Good',    dueBack:'' },
    T008:{ id:'T008', name:'Chain Hoist 2t',       cat:'Lifting',     owner:'',       holder:'naledi', status:'checked_out', barcode:'BC-008', serial:'LHT-0071', since:'Apr 11', value:9500, condition:'Good',    dueBack:'Apr 19' },
    T009:{ id:'T009', name:'Pipe Cutter',          cat:'Hand tools',  owner:'sipho',  holder:'sipho',  status:'with_owner',  barcode:'BC-009', serial:'RID-0055', since:'Mar 1',  value:950,  condition:'Good',    dueBack:'' },
    T010:{ id:'T010', name:'Multimeter',           cat:'Measuring',   owner:'thandi', holder:'',       status:'warehouse',   barcode:'BC-010', serial:'FLK-1120', since:'',        value:2100, condition:'Damaged', dueBack:'' },
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
    james:   { N1:{ id:'N1', msg:'Transfer PIN for Bosch SDS Drill: 7342 — share with Bongani to confirm handover', type:'pin',     unread:true,  date:'Apr 15' }, N2:{ id:'N2', msg:'Socket Set 94pc is overdue — was due back Apr 20', type:'overdue', unread:true, date:'Apr 21' } },
    thandi:  { N3:{ id:'N3', msg:'DeWalt Circular Saw is due back Apr 22', type:'overdue', unread:true, date:'Apr 18' } },
    sipho:   {},
    naledi:  { N4:{ id:'N4', msg:'Chain Hoist 2t is overdue — was due back Apr 19', type:'overdue', unread:true, date:'Apr 20' } },
    bongani: {},
  },
};

/* ──────────────────────────────────────────────────────────
   RUNTIME STATE — mirrors Firebase, updated by listeners
   ────────────────────────────────────────────────────────── */
let STATE = {
  tools:         {},
  requests:      {},
  jobs:          {},
  auditLog:      {},
  notifications: {},
  _loaded:       { tools:false, requests:false, jobs:false, auditLog:false },
};

/* Convert Firebase objects (keyed by ID) to sorted arrays */
const toolsArr    = ()    => Object.values(STATE.tools    || {});
const requestsArr = ()    => Object.values(STATE.requests || {});
const jobsArr     = ()    => Object.values(STATE.jobs     || {});
const auditArr    = ()    => Object.values(STATE.auditLog || {}).sort((a,b) => a.id > b.id ? -1 : 1);
const notifsArr   = uid   => Object.values(STATE.notifications[uid] || {}).sort((a,b) => a.id > b.id ? -1 : 1);

/* ──────────────────────────────────────────────────────────
   SESSION PERSISTENCE (survives refresh)
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
let handoverState = { step:0, reqId:null, toolId:null, pin:'', condition:'', comment:'', pinErr:'' };
let notifUnsub    = null; // holds current notification listener so we can detach on logout

/* ──────────────────────────────────────────────────────────
   UTILITIES
   ────────────────────────────────────────────────────────── */
const fmt     = v   => 'R ' + Math.round(v).toLocaleString('en-ZA');
const todayStr= ()  => new Date().toLocaleString('en-ZA',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
const genPin  = ()  => String(Math.floor(1000 + Math.random() * 9000));
const $       = id  => document.getElementById(id);

const uname    = id => USERS[id] ? USERS[id].name : id;
const ufirst   = id => uname(id).split(' ')[0];
const initials = id => { if (!USERS[id]) return '??'; return uname(id).split(' ').map(w=>w[0]).join('').slice(0,2); };
const tById    = id => toolsArr().find(t => t.id === id);
const jTpl     = id => JOB_TEMPLATES.find(j => j.id === id);
const myJob    = uid => jobsArr().find(j => j.worker === uid && (j.status === 'assigned' || j.status === 'active'));
const isOverdue= t  => t.dueBack && t.dueBack !== '' && t.status !== 'warehouse' && t.status !== 'with_owner';
const unreadCount = uid => notifsArr(uid).filter(n => n.unread).length;

/* ──────────────────────────────────────────────────────────
   FIREBASE WRITE HELPERS
   ────────────────────────────────────────────────────────── */
function dbUpdate(path, data)  { return fdb.ref(path).update(data); }
function dbSet(path, data)     { return fdb.ref(path).set(data); }
function dbPush(path, data)    { return fdb.ref(path).push(data); }

async function dbNotify(uid, msg, type) {
  const id   = 'N' + Date.now();
  const note = { id, msg, type, unread: true, date: todayStr() };
  await dbSet(`notifications/${uid}/${id}`, note);
}

/* ──────────────────────────────────────────────────────────
   FIREBASE LISTENERS — update STATE then re-render
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
  /* Notifications for ALL users so admin unread badge works too */
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
  $('root').innerHTML = !currentUser         ? renderLogin()
                      : currentUser.role === 'admin' ? renderAdmin()
                      : renderWorker();
}

function go(v) {
  currentView = v;
  if (v === 'w-borrow')    borrowSearch  = '';
  if (v !== 'w-handover')  handoverState = { step:0, reqId:null, toolId:null, pin:'', condition:'', comment:'', pinErr:'' };
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
      ${navLi('Dashboard',      'a-dash',     '◼')}
      ${navLi('All tools',      'a-tools',    '⚙')}
      ${navLi('Financial view', 'a-finance',  'R')}
      ${navLi('Audit log',      'a-audit',    '▤')}
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
  const views  = { 'a-dash':aDash,'a-tools':aTools,'a-finance':aFinance,'a-audit':aAudit,'a-jobs':aJobs,'a-team':aTeam,'a-requests':aReqs,'a-overdue':aOverdue };
  const titles = { 'a-dash':'Dashboard','a-tools':'All tools','a-finance':'Financial view','a-audit':'Audit log','a-jobs':'Jobs','a-team':'Team','a-requests':'Requests','a-overdue':'Overdue tools' };
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
  return `
    <div class="metrics metrics-4">
      <div class="mc"><div class="mc-label">Total tools</div><div class="mc-val">${toolsArr().length}</div></div>
      <div class="mc"><div class="mc-label">Lent between workers</div><div class="mc-val val-o">${lent.length}</div></div>
      <div class="mc"><div class="mc-label">Overdue returns</div><div class="mc-val" style="color:${od.length?'#A32D2D':'var(--color-green)'}">${od.length}</div></div>
      <div class="mc"><div class="mc-label">Audit events logged</div><div class="mc-val val-b">${auditArr().length}</div></div>
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
        <th style="width:12%">Owner</th><th style="width:12%">Holder</th>
        <th style="width:11%">Status</th><th style="width:9%">Cond.</th>
        <th style="width:11%">Value</th><th style="width:13%">Due back</th>
      </tr></thead>
      <tbody>${toolsArr().map(t=>`<tr>
        <td class="bold">${t.name}${od.includes(t.id)?'<span class="overdue-flag">Overdue</span>':''}</td>
        <td class="mono small muted">${t.barcode}</td>
        <td>${t.owner?`<span class="av" style="font-size:9px">${initials(t.owner)}</span> ${ufirst(t.owner)}`:'<span class="muted">Co.</span>'}</td>
        <td>${t.holder?`<span class="av" style="font-size:9px">${initials(t.holder)}</span> ${ufirst(t.holder)}`:'—'}</td>
        <td>${bdg(t.status)}</td>
        <td>${condBdg(t.condition)}</td>
        <td class="val-g">${fmt(t.value)}</td>
        <td style="color:${isOverdue(t)?'#A32D2D':'var(--color-text-secondary)'};">${t.dueBack||'—'}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

/* ── Admin: Financial view ── */
function aFinance() {
  const workers = Object.values(USERS).filter(u=>u.role==='worker');
  const total   = toolsArr().reduce((s,t)=>s+t.value,0);
  const lentVal = toolsArr().filter(t=>t.status==='lent').reduce((s,t)=>s+t.value,0);
  const dmgVal  = toolsArr().filter(t=>t.condition==='Damaged').reduce((s,t)=>s+t.value,0);
  return `
    <div class="metrics metrics-3">
      <div class="mc"><div class="mc-label">Total fleet value</div><div class="mc-val">${fmt(total)}</div></div>
      <div class="mc"><div class="mc-label">At risk (lent out)</div><div class="mc-val val-o">${fmt(lentVal)}</div></div>
      <div class="mc"><div class="mc-label">Damaged tools value</div><div class="mc-val" style="color:#A32D2D">${fmt(dmgVal)}</div></div>
    </div>
    <div class="sh"><span class="st">Worker liability breakdown</span></div>
    <div class="tw"><table>
      <thead><tr>
        <th style="width:22%">Worker</th><th style="width:20%">Owns</th>
        <th style="width:20%">Holding (others')</th><th style="width:20%">Lent out</th>
        <th style="width:18%">Net exposure</th>
      </tr></thead>
      <tbody>${workers.map(u=>{
        const owns    = toolsArr().filter(t=>t.owner===u.id).reduce((s,t)=>s+t.value,0);
        const holding = toolsArr().filter(t=>t.holder===u.id&&t.owner!==u.id).reduce((s,t)=>s+t.value,0);
        const lentOut = toolsArr().filter(t=>t.owner===u.id&&t.status==='lent').reduce((s,t)=>s+t.value,0);
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
    const holdingVal = toolsArr().filter(t=>t.holder===u.id&&t.owner!==u.id).reduce((s,t)=>s+t.value,0);
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

async function adminAct(reqId, status) {
  const r = requestsArr().find(x=>x.id===reqId);
  if (!r) return;
  const t = tById(r.toolId);
  const updates = { status };
  if (status === 'approved') {
    updates.pin = genPin();
    if (r.type === 'borrow_warehouse' && t) {
      await dbUpdate(`tools/${t.id}`, { holder:r.to, status:'checked_out', since:todayStr() });
    }
    await dbNotify(r.to, `Your request for ${t?t.name:'the tool'} was approved${r.type==='borrow_peer'?' — complete the PIN handover':'  — collect from warehouse'}.`, 'info');
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
        <td>${t.owner?`<span class="av" style="font-size:9px">${initials(t.owner)}</span> ${ufirst(t.owner)}`:'Company'}</td>
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
  const borrowing = toolsArr().filter(t=>t.holder===u.id&&t.owner&&t.owner!==u.id);
  const ownVal    = owned.reduce((s,t)=>s+t.value,0);
  const lentVal   = lentOut.reduce((s,t)=>s+t.value,0);
  const borVal    = borrowing.reduce((s,t)=>s+t.value,0);
  const overdueL  = lentOut.filter(t=>isOverdue(t));
  return `
    <div class="metrics metrics-3">
      <div class="mc"><div class="mc-label">My tools (with me)</div><div class="mc-val">${owned.length}</div><div class="chip-g" style="display:inline-block;margin-top:4px">${fmt(ownVal)}</div></div>
      <div class="mc"><div class="mc-label">Lent to others</div><div class="mc-val val-o">${lentOut.length}</div><div class="chip-o" style="display:inline-block;margin-top:4px">${fmt(lentVal)} at risk</div></div>
      <div class="mc"><div class="mc-label">I'm borrowing</div><div class="mc-val val-b">${borrowing.length}</div><div class="chip-b" style="display:inline-block;margin-top:4px">${fmt(borVal)} liability</div></div>
    </div>
    ${overdueL.length?`<div class="strip strip-err">You have ${overdueL.length} overdue lent tool(s). Request them back immediately.</div>`:''}
    ${lentVal>0?`<div class="strip strip-warn">You have ${fmt(lentVal)} of your tools with other workers.</div>`:''}
    ${borVal>0?`<div class="strip strip-info">You are holding ${fmt(borVal)} worth of others' tools. Return on time.</div>`:''}

    ${owned.length?`
      <div class="sdiv">My tools — in my possession</div>
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
      <div class="sdiv">Borrowed — my liability to return</div>
      ${borrowing.map(t=>`<div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span class="bold" style="font-size:13px">${t.name}</span><span class="val-b">${fmt(t.value)}</span>
        </div>
        <div class="small muted" style="margin-bottom:8px">Owned by ${uname(t.owner)} · ${condBdg(t.condition)} at checkout · due ${t.dueBack||'not set'}</div>
        <button class="btn" style="font-size:11px;padding:4px 10px" onclick="startReturn('${t.id}')">Return this tool</button>
      </div>`).join('')}`:''}

    ${!owned.length&&!lentOut.length&&!borrowing.length?`
      <div style="text-align:center;padding:30px 0;color:var(--color-text-secondary);font-size:13px">
        No tools on your profile yet.
        <br><button class="btn btn-primary" style="margin-top:10px" onclick="go('w-warehouse')">Request from warehouse</button>
      </div>`:''}`;
}

/* ── Worker: Handover / return (PIN flow) ── */
function wHandover() {
  const hs    = handoverState;
  const u     = currentUser;
  const steps = ['Select tool','Condition & note','Generate PIN','Recipient enters PIN','Complete'];
  const stepBar = steps.map((s,i)=>`
    <div class="step step-${i<hs.step?'done':i===hs.step?'active':'idle'}">
      <div class="step-num">${i<hs.step?'✓':i+1}</div>
      <div class="step-label">${s}</div>
    </div>`).join('');

  const approvedHandovers = requestsArr().filter(r=>r.status==='approved'&&r.pin&&!r.pinUsed&&(r.from===u.id||r.to===u.id));
  const myLentOut         = toolsArr().filter(t=>t.owner===u.id&&t.holder!==u.id&&t.status==='lent');

  let body = '';

  if (hs.step === 0) {
    body = `
      <div class="strip strip-info">Both parties must be physically present. The PIN proves the recipient accepted the tool in person — one-time use only.</div>
      ${approvedHandovers.length?`
        <div class="sdiv">Pending approved handovers — PIN ready</div>
        ${approvedHandovers.map(r=>{
          const t=tById(r.toolId)||{name:'?'};
          return `<div class="card" style="display:flex;align-items:center;gap:10px">
            <div style="flex:1">
              <div class="bold" style="font-size:13px">${t.name}</div>
              <div class="small muted">${r.type==='borrow_peer'?`Lend to ${ufirst(r.to)}`:`Return to ${ufirst(r.from||t.owner)}`}</div>
            </div>
            <button class="btn btn-primary" style="font-size:11px" onclick="startHandover('${r.id}')">Start handover</button>
          </div>`;}).join('')}`:''}
      <div class="sdiv">Return a borrowed tool</div>
      ${myLentOut.length?myLentOut.map(t=>`
        <div class="card" style="display:flex;align-items:center;gap:10px">
          <div style="flex:1"><div class="bold" style="font-size:13px">${t.name}</div><div class="small muted">Return to ${ufirst(t.owner)}</div></div>
          <button class="btn" style="font-size:11px" onclick="startReturnHandover('${t.id}')">Return</button>
        </div>`).join('')
      :'<div class="small muted">No tools to return right now.</div>'}`;

  } else if (hs.step === 1) {
    const req = requestsArr().find(r=>r.id===hs.reqId);
    const t   = tById(req?req.toolId:hs.toolId)||{name:'?',condition:''};
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
            :'<button class="btn btn-primary" style="width:100%;padding:8px" onclick="generatePin()">Generate transfer PIN →</button>'}
        </div>
      </div>`;

  } else if (hs.step === 2) {
    const req = requestsArr().find(r=>r.id===hs.reqId);
    const t   = tById(req?req.toolId:hs.toolId)||{name:'?'};
    body = `
      <div class="pin-box">
        <div class="bold" style="font-size:13px">Transfer PIN for ${t.name}</div>
        <div class="small muted" style="margin:6px 0">Show this to the other worker. They must type it in to confirm receipt.</div>
        <div class="pin-display">${hs.pin}</div>
        <div class="small muted">One-time use · expires on entry</div>
      </div>
      <button class="btn btn-primary" style="width:100%;padding:8px" onclick="handoverState.step=3;render()">Other worker is ready →</button>`;

  } else if (hs.step === 3) {
    const req = requestsArr().find(r=>r.id===hs.reqId);
    const t   = tById(req?req.toolId:hs.toolId)||{name:'?'};
    body = `
      <div style="text-align:center;padding:10px 0 16px">
        <div class="bold" style="font-size:13px;margin-bottom:4px">Enter the 4-digit PIN</div>
        <div class="small muted" style="margin-bottom:14px">The worker handing over ${t.name} shows you their PIN. Enter it here to confirm receipt.</div>
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

function startHandover(reqId) {
  handoverState = { step:1, reqId, toolId:null, pin:'', condition:'', comment:'', pinErr:'' };
  render();
}
function startReturnHandover(toolId) {
  handoverState = { step:1, reqId:null, toolId, pin:'', condition:'', comment:'', pinErr:'' };
  render();
}
function startReturn(toolId) {
  handoverState = { step:1, reqId:null, toolId, pin:'', condition:'', comment:'', pinErr:'' };
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
  const isReturn = !req;
  const aId = 'A' + Date.now();

  if (!isReturn && req) {
    await dbUpdate(`tools/${toolId}`, { holder:req.to, status:'lent', since:todayStr(), dueBack:'May 5', condition:handoverState.condition });
    await dbUpdate(`requests/${req.id}`, { pinUsed:true, status:'completed' });
    await dbSet(`auditLog/${aId}`, { id:aId, toolId, action:'lent', from:currentUser.id, to:req.to, date:todayStr(), conditionOut:handoverState.condition, commentOut:handoverState.comment, conditionIn:'', commentIn:'', pin:handoverState.pin, pinConfirmed:true });
  } else {
    const prevHolder = t.holder;
    const owner      = t.owner;
    await dbUpdate(`tools/${toolId}`, { holder:owner, status:'with_owner', since:todayStr(), dueBack:'', condition:handoverState.condition });
    await dbSet(`auditLog/${aId}`, { id:aId, toolId, action:'returned', from:prevHolder, to:owner, date:todayStr(), conditionOut:t.condition, commentOut:'', conditionIn:handoverState.condition, commentIn:handoverState.comment, pin:handoverState.pin, pinConfirmed:true });
    await dbNotify(owner, `${currentUser.name} returned your ${t.name} — condition: ${handoverState.condition}`, 'info');
  }
  handoverState.step = 4;
  render();
}

/* ── Worker: Borrow from colleague ── */
function wBorrow() {
  const u      = currentUser;
  const peers  = toolsArr().filter(t=>t.holder&&t.holder!==u.id);
  const filtered = borrowSearch ? peers.filter(t=>t.name.toLowerCase().includes(borrowSearch.toLowerCase())||uname(t.holder).toLowerCase().includes(borrowSearch.toLowerCase())) : [];
  return `
    <div class="strip strip-info">Find a colleague's tool. Once approved, complete the transfer via Handover / return with a PIN.</div>
    <div style="margin-bottom:12px">
      <input class="fi" id="bsrch" placeholder="Search tool name or worker…" value="${borrowSearch}" oninput="borrowSearch=this.value;document.getElementById('blist').innerHTML=renderBorrowList()" style="width:100%"/>
    </div>
    <div id="blist">${renderBorrowList(filtered)}</div>`;
}

function renderBorrowList(list) {
  const u     = currentUser;
  const peers = list || toolsArr().filter(t=>t.holder&&t.holder!==u.id).filter(t=>borrowSearch?t.name.toLowerCase().includes(borrowSearch.toLowerCase())||uname(t.holder).toLowerCase().includes(borrowSearch.toLowerCase()):false);
  if (!borrowSearch) return '<div class="muted" style="text-align:center;padding:26px 0;font-size:13px">Start typing to find a tool</div>';
  if (!peers.length) return `<div class="muted" style="text-align:center;padding:18px 0;font-size:13px">No results for "${borrowSearch}"</div>`;
  return peers.map(t=>`
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span class="bold" style="font-size:13px">${t.name}</span>${condBdg(t.condition)}
      </div>
      <div class="small muted" style="margin-bottom:6px">Held by ${uname(t.holder)} · Replacement value: <strong class="val-o">${fmt(t.value)}</strong></div>
      <div class="strip strip-warn" style="margin-bottom:8px">By requesting this tool you acknowledge liability for <strong>${fmt(t.value)}</strong> if lost or damaged.</div>
      <button class="btn btn-primary" style="font-size:11px;padding:4px 10px" onclick="sendBorrowReq('${t.id}','${t.holder}')">Request from ${ufirst(t.holder)}</button>
    </div>`).join('');
}

async function sendBorrowReq(toolId, holderId) {
  const t  = tById(toolId)||{name:'?',value:0};
  const id = 'RQ' + Date.now();
  await dbSet(`requests/${id}`, { id, type:'borrow_peer', toolId, from:holderId, to:currentUser.id, status:'pending', pin:genPin(), pinUsed:false, note:'', date:todayStr(), conditionOut:'', commentOut:'' });
  await dbNotify(holderId, `${currentUser.name} requested your ${t.name} (${fmt(t.value)}) — approve to generate transfer PIN`, 'req');
  alert(`Request sent to ${ufirst(holderId)}. Once approved, complete via Handover / return.`);
  go('w-reqs');
}

/* ── Worker: Request from warehouse ── */
function wWarehouse() {
  const avail = toolsArr().filter(t=>t.status==='warehouse');
  return `
    <div class="strip strip-info">Warehouse tools. Requests go to admin for approval. Once approved, collect and complete with a PIN handover.</div>
    ${avail.length ? avail.map(t=>`
      <div class="card">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span class="bold" style="font-size:13px">${t.name}</span>${condBdg(t.condition)}
        </div>
        <div class="small muted" style="margin-bottom:8px">${t.cat} · ${t.barcode} · Value: <strong class="val-g">${fmt(t.value)}</strong>${t.owner?' · owned by '+uname(t.owner):' · Company tool'}</div>
        <button class="btn btn-primary" style="font-size:11px;padding:4px 10px" onclick="reqWarehouse('${t.id}')">Request this tool</button>
      </div>`).join('')
    : '<div class="muted" style="text-align:center;padding:20px 0;font-size:13px">No tools available in warehouse right now.</div>'}`;
}

async function reqWarehouse(toolId) {
  const t  = tById(toolId)||{name:'?'};
  const id = 'RQ' + Date.now();
  await dbSet(`requests/${id}`, { id, type:'borrow_warehouse', toolId, from:'', to:currentUser.id, status:'pending', pin:'', pinUsed:false, note:'', date:todayStr(), conditionOut:'', commentOut:'' });
  alert(`Request submitted for ${t.name}. You'll be notified when approved.`);
  go('w-reqs');
}

/* ── Worker: My requests ── */
function wReqs() {
  const reqs = requestsArr().filter(r=>r.to===currentUser.id);
  if (!reqs.length) return '<div class="muted" style="text-align:center;padding:26px 0;font-size:13px">No requests yet.</div>';
  return `
    <div class="tw"><table>
      <thead><tr>
        <th style="width:28%">Tool</th><th style="width:16%">Value</th>
        <th style="width:16%">Type</th><th style="width:14%">Date</th>
        <th style="width:14%">Status</th><th style="width:12%">PIN</th>
      </tr></thead>
      <tbody>${reqs.map(r=>{
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
    </table></div>`;
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
  wNotifs_markRead(uid); /* mark read in Firebase — listeners will update badge */
  if (!notifs.length) return '<div class="muted" style="text-align:center;padding:26px 0;font-size:13px">No notifications.</div>';
  const typeClass = { req:'notif-req', recall:'notif-recall', job:'notif-job', overdue:'notif-recall', pin:'notif-req' };
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
   BOOTSTRAP — runs once when the page loads
   ────────────────────────────────────────────────────────── */
async function boot() {
  /* Check if Firebase config has been filled in */
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

  /* Seed database if first run, then start listeners */
  await initDatabase();
  setupCoreListeners();

  /* Restore session from localStorage */
  const savedId = loadSession();
  if (savedId && USERS[savedId]) {
    currentUser = USERS[savedId];
    currentView = currentUser.role === 'admin' ? 'a-dash' : 'w-mytools';
  }
  /* render() will be called automatically by the first Firebase listener response */
}

boot();
