import { useState, useMemo } from "react";

/* ─── THEME ──────────────────────────────────────────────── */
const T = {
  bg:'#07090F', surf:'#0C1120', card:'#111827', border:'#1C2A3E',
  text:'#DDE3EE', muted:'#8494A8', faint:'#3E4E63',
  amber:'#F59E0B', red:'#EF4444', green:'#10B981',
  blue:'#3B82F6', orange:'#F97316', purple:'#A855F7',
};

/* ─── ROOM BOARD STATUSES ────────────────────────────────── */
const RS = {
  available:   { label:'Available',   bg:'#052E16', color:'#86EFAC', bd:'#14532D' },
  occupied:    { label:'Occupied',    bg:'#0C1A3D', color:'#93C5FD', bd:'#1E3A8A' },
  dirty:       { label:'Dirty',       bg:'#1C1000', color:'#FDE68A', bd:'#78350F' },
  maintenance: { label:'Maintenance', bg:'#2D0A0A', color:'#FCA5A5', bd:'#7F1D1D' },
  blocked:     { label:'Blocked',     bg:'#111827', color:'#9CA3AF', bd:'#374151' },
};

/* ─── CONSTANTS ──────────────────────────────────────────── */
const FLOORS     = [1,2,3,4,5];
const ROOM_TYPES = ['Standard','Deluxe','Suite'];
const ROLES      = ['housekeeper','supervisor','technician'];
const MAINT_CATS = ['AC','Plumbing','Electrical','Furniture','Internet','Appliance','Other'];
const MAINT_SEVS = ['low','medium','high','critical'];
const MAINT_STATS= ['open','in_progress','resolved'];
const SEV_C = { low:'#6b7280', medium:'#F59E0B', high:'#F97316', critical:'#EF4444' };
const MS_CFG = {
  open:       { l:'Open',        c:'#EF4444' },
  in_progress:{ l:'In Progress', c:'#F59E0B' },
  resolved:   { l:'Resolved',    c:'#10B981' },
};
const ROLE_C = { housekeeper:'#3B82F6', supervisor:'#F59E0B', technician:'#A855F7' };

/* ─── MASTER ROOM DATA (structural) ─────────────────────── */
const MASTER_INIT = [
  { id:'M101', num:'101', fl:1, type:'Standard' },
  { id:'M102', num:'102', fl:1, type:'Standard' },
  { id:'M103', num:'103', fl:1, type:'Standard' },
  { id:'M104', num:'104', fl:1, type:'Deluxe'   },
  { id:'M105', num:'105', fl:1, type:'Deluxe'   },
  { id:'M106', num:'106', fl:1, type:'Deluxe'   },
  { id:'M201', num:'201', fl:2, type:'Suite'    },
  { id:'M202', num:'202', fl:2, type:'Standard' },
  { id:'M203', num:'203', fl:2, type:'Standard' },
  { id:'M204', num:'204', fl:2, type:'Standard' },
  { id:'M205', num:'205', fl:2, type:'Suite'    },
  { id:'M206', num:'206', fl:2, type:'Suite'    },
  { id:'M301', num:'301', fl:3, type:'Suite'    },
  { id:'M302', num:'302', fl:3, type:'Suite'    },
  { id:'M303', num:'303', fl:3, type:'Standard' },
  { id:'M304', num:'304', fl:3, type:'Deluxe'   },
  { id:'M305', num:'305', fl:3, type:'Deluxe'   },
  { id:'M306', num:'306', fl:3, type:'Standard' },
];

/* ─── ROOM BOARD DATA (operational, references master id) ── */
const BOARD_INIT = [
  { mid:'M101', status:'available',   asgn:null, notes:'' },
  { mid:'M102', status:'occupied',    asgn:null, notes:'DND until 12:00' },
  { mid:'M103', status:'dirty',       asgn:'H1', notes:'Rush CO 10:00' },
  { mid:'M104', status:'available',   asgn:null, notes:'' },
  { mid:'M105', status:'occupied',    asgn:'H1', notes:'' },
  { mid:'M106', status:'maintenance', asgn:null, notes:'Plumbing repair' },
  { mid:'M201', status:'occupied',    asgn:null, notes:'VIP guest' },
  { mid:'M202', status:'available',   asgn:null, notes:'' },
  { mid:'M203', status:'dirty',       asgn:'H2', notes:'' },
  { mid:'M204', status:'available',   asgn:null, notes:'' },
  { mid:'M205', status:'occupied',    asgn:null, notes:'Early CI 14:00' },
  { mid:'M206', status:'blocked',     asgn:null, notes:'Out of service' },
  { mid:'M301', status:'available',   asgn:null, notes:'' },
  { mid:'M302', status:'maintenance', asgn:null, notes:'Electrical fault' },
  { mid:'M303', status:'dirty',       asgn:null, notes:'' },
  { mid:'M304', status:'available',   asgn:null, notes:'' },
  { mid:'M305', status:'dirty',       asgn:'H3', notes:'' },
  { mid:'M306', status:'occupied',    asgn:null, notes:'WiFi issue' },
];

const STAFF_INIT = [
  { id:'H1', name:'Siti Rahma',     role:'housekeeper', skill:'Senior', onShift:true  },
  { id:'H2', name:'Dewi Lestari',   role:'housekeeper', skill:'Mid',    onShift:true  },
  { id:'H3', name:'Rina Susanti',   role:'housekeeper', skill:'Senior', onShift:true  },
  { id:'H4', name:'Yuni Pratiwi',   role:'housekeeper', skill:'Mid',    onShift:false },
  { id:'H5', name:'Mega Wulandari', role:'housekeeper', skill:'Junior', onShift:true  },
  { id:'S1', name:'Budi Santoso',   role:'supervisor',  skill:'Senior', onShift:true  },
  { id:'T1', name:'Ahmad Fauzi',    role:'technician',  skill:'Senior', onShift:true  },
  { id:'T2', name:'Hendra Wijaya',  role:'technician',  skill:'Mid',    onShift:true  },
];

const MAINT_INIT = [
  { id:'MR001', mid:'M105', cat:'AC',         sev:'high',     desc:'Not cooling, stuck at 28°C',             tech:'T1', status:'in_progress', notes:'', at:'08:15' },
  { id:'MR002', mid:'M106', cat:'Plumbing',   sev:'critical', desc:'Tap leaking — water damage risk',        tech:'T1', status:'in_progress', notes:'Parts ordered', at:'14:00' },
  { id:'MR003', mid:'M302', cat:'Electrical', sev:'critical', desc:'Full electrical failure, circuit blown',  tech:'T2', status:'in_progress', notes:'Rewiring required', at:'09:00' },
  { id:'MR004', mid:'M306', cat:'Internet',   sev:'low',      desc:'WiFi signal weak',                       tech:null,  status:'open',       notes:'', at:'09:30' },
  { id:'MR005', mid:'M203', cat:'Furniture',  sev:'low',      desc:'Chair leg broken',                       tech:'T2', status:'resolved',    notes:'Chair repaired', at:'10:00' },
];

const AUDIT_INIT = [
  { date:'20 Apr 2026', time:'10:30', user:'System',       action:'MR002 resolved → Room 106 set to Available' },
  { date:'20 Apr 2026', time:'10:00', user:'System',       action:'Auto-assign: 4 dirty rooms → 3 housekeepers' },
  { date:'20 Apr 2026', time:'09:30', user:'Budi Santoso', action:'MR001 raised — AC Room 105 (High) → Room set to Maintenance' },
  { date:'20 Apr 2026', time:'08:00', user:'Budi Santoso', action:'Morning shift started — 5 staff on shift' },
];

/* ─── HELPERS ────────────────────────────────────────────── */
let _seq = 500;
const uid = p => `${p}${++_seq}`;
const nowTime = () => { const t=new Date(); return `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`; };
const nowDate = () => { const t=new Date(); return t.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); };
const now = nowTime;

/* ─── CSS ────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body,html{height:100%;overflow:hidden;}
body{font-family:'Outfit',sans-serif;background:#07090F;color:#DDE3EE;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:#0C1120;}
::-webkit-scrollbar-thumb{background:#1C2A3E;border-radius:2px;}
.mono{font-family:'JetBrains Mono',monospace;}
.btn{cursor:pointer;border:none;border-radius:6px;font-family:'Outfit',sans-serif;font-weight:600;transition:all 0.15s;display:inline-flex;align-items:center;justify-content:center;gap:6px;line-height:1;}
.btn:hover{filter:brightness(1.18);}.btn:active{transform:scale(0.97);}.btn:disabled{opacity:0.35;cursor:not-allowed;}
.card{background:#111827;border:1px solid #1C2A3E;border-radius:10px;}
.rc{cursor:pointer;transition:transform 0.15s,border-color 0.15s,box-shadow 0.15s;}
.rc:hover{transform:translateY(-2px);border-color:#2A3E58;box-shadow:0 8px 22px rgba(0,0,0,0.45);}
.navitem{display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:7px;cursor:pointer;transition:all 0.15s;color:#8494A8;font-weight:500;font-size:13px;}
.navitem:hover{background:rgba(255,255,255,0.05);color:#DDE3EE;}.navitem.act{background:rgba(245,158,11,0.12);color:#F59E0B;}
input,select,textarea{background:#0C1120;border:1px solid #1C2A3E;border-radius:6px;color:#DDE3EE;font-family:'Outfit',sans-serif;padding:8px 10px;font-size:13px;outline:none;transition:border-color 0.15s;width:100%;}
input:focus,select:focus,textarea:focus{border-color:#F59E0B;}
select option{background:#0C1120;}textarea{resize:vertical;min-height:62px;}
.toggle{width:42px;height:22px;border-radius:11px;cursor:pointer;position:relative;transition:background 0.2s;flex-shrink:0;border:none;}
.toggle-knob{position:absolute;top:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left 0.2s;}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.72);display:flex;align-items:center;justify-content:center;z-index:200;}
.modal{background:#111827;border:1px solid #1C2A3E;border-radius:14px;padding:24px;width:440px;max-width:calc(100vw - 32px);max-height:90vh;overflow-y:auto;}
.field{display:flex;flex-direction:column;gap:5px;margin-bottom:14px;}
.field label{font-size:10px;color:#8494A8;font-weight:700;letter-spacing:0.6px;}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.dz{background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);border-radius:7px;padding:12px 14px;margin-bottom:18px;}
.tbl{width:100%;border-collapse:collapse;}
.tbl th{padding:9px 14px;text-align:left;font-size:10px;color:#3E4E63;font-weight:700;border-bottom:1px solid #1C2A3E;letter-spacing:0.5px;background:#0C1120;}
.tbl td{padding:10px 14px;font-size:13px;border-bottom:1px solid #1C2A3E;}
.tbl tr:last-child td{border-bottom:none;}
.tbl tr:hover td{background:rgba(255,255,255,0.025);}
`;

/* ─── SHARED UI ──────────────────────────────────────────── */
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <h2 style={{fontSize:16,fontWeight:700}}>{title}</h2>
          <button className="btn" onClick={onClose} style={{padding:'5px 10px',background:'transparent',color:T.muted,border:`1px solid ${T.border}`,fontSize:13}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function FormActions({ onCancel, onSave, saveLabel='Save', danger, onDanger, dangerLabel='Delete' }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:14,borderTop:`1px solid ${T.border}`,marginTop:4}}>
      <div>{danger&&<button className="btn" onClick={onDanger} style={{padding:'7px 14px',fontSize:12,background:'rgba(239,68,68,0.1)',color:T.red,border:'1px solid rgba(239,68,68,0.3)'}}>{dangerLabel}</button>}</div>
      <div style={{display:'flex',gap:8}}>
        <button className="btn" onClick={onCancel} style={{padding:'7px 16px',fontSize:12,background:'transparent',color:T.muted,border:`1px solid ${T.border}`}}>Cancel</button>
        <button className="btn" onClick={onSave} style={{padding:'7px 20px',fontSize:12,background:T.amber,color:'#000'}}>{saveLabel}</button>
      </div>
    </div>
  );
}
function Tag({ label, color }) {
  return <span style={{fontSize:10,padding:'2px 8px',borderRadius:4,background:`${color}18`,color,fontWeight:700,letterSpacing:'0.3px'}}>{label}</span>;
}
function IBtn({ onClick, icon, danger }) {
  return (
    <button className="btn" onClick={onClick} style={{padding:'4px 8px',fontSize:11,
      background: danger?'rgba(239,68,68,0.08)':'rgba(255,255,255,0.06)',
      color: danger?T.red:T.muted,
      border:`1px solid ${danger?'rgba(239,68,68,0.2)':T.border}`}}>{icon}</button>
  );
}

/* ══════════════════════════════════════════════════════════
   APP
══════════════════════════════════════════════════════════ */
export default function App() {
  const [master, setMaster] = useState(MASTER_INIT);  // structural room data
  const [board,  setBoard]  = useState(BOARD_INIT);   // operational status per room
  const [staff,  setStaff]  = useState(STAFF_INIT);
  const [maint,  setMaint]  = useState(MAINT_INIT);
  const [audit,  setAudit]  = useState(AUDIT_INIT);

  const [view,   setView]   = useState('master');
  const [filter, setFilter] = useState('all');
  const [drawer, setDrawer] = useState(null); // mid

  // modals: { type, mode, data }
  const [modal, setModal] = useState(null);

  /* ── audit helper ── */
  const log = (user, action) => setAudit(p=>[{date:nowDate(),time:nowTime(),user,action},...p].slice(0,80));

  /* ── cross-data helpers ── */
  const roomOf   = mid => master.find(m=>m.id===mid);
  const boardOf  = mid => board.find(b=>b.mid===mid);
  const sName    = id  => staff.find(s=>s.id===id)?.name||'—';
  const numOf    = mid => master.find(m=>m.id===mid)?.num||mid;

  /* ── set board status ── */
  const setBoardStatus = (mid, status, user='System') => {
    setBoard(p=>p.map(b=>b.mid===mid?{...b,status}:b));
    log(user,`Room ${numOf(mid)} → ${RS[status].label}`);
  };

  /* ════════════════════════════════════════
     MASTER ROOM CRUD
  ════════════════════════════════════════ */
  const saveMaster = data => {
    if (modal.mode==='add') {
      const id = uid('M');
      setMaster(p=>[...p,{id,...data}]);
      setBoard(p=>[...p,{mid:id,status:'available',asgn:null,notes:''}]);
      log('Supervisor',`Room ${data.num} added to master data (${data.type}, Floor ${data.fl})`);
    } else {
      setMaster(p=>p.map(m=>m.id===data.id?data:m));
      log('Supervisor',`Room ${data.num} master data updated`);
    }
    setModal(null);
  };
  const deleteMaster = data => {
    setMaster(p=>p.filter(m=>m.id!==data.id));
    setBoard(p=>p.filter(b=>b.mid!==data.id));
    setMaint(p=>p.filter(mr=>mr.mid!==data.id));
    if(drawer===data.id) setDrawer(null);
    log('Supervisor',`Room ${data.num} deleted from master data`);
    setModal(null);
  };

  /* ════════════════════════════════════════
     STAFF CRUD
  ════════════════════════════════════════ */
  const saveStaff = data => {
    if(modal.mode==='add'){ setStaff(p=>[...p,{...data,id:uid('H')}]); log('Supervisor',`${data.name} added as ${data.role}`); }
    else { setStaff(p=>p.map(s=>s.id===data.id?data:s)); log('Supervisor',`${data.name} record updated`); }
    setModal(null);
  };
  const deleteStaff = data => {
    setStaff(p=>p.filter(s=>s.id!==data.id));
    setBoard(p=>p.map(b=>b.asgn===data.id?{...b,asgn:null}:b));
    log('Supervisor',`${data.name} removed`);
    setModal(null);
  };
  const toggleShift = id => setStaff(p=>p.map(s=>{
    if(s.id!==id)return s;
    log('Supervisor',`${s.name} ${s.onShift?'removed from':'added to'} shift`);
    return{...s,onShift:!s.onShift};
  }));

  /* ════════════════════════════════════════
     MAINTENANCE CRUD
     Creating: sets room → maintenance (if sev=critical or any)
     Resolving: sets room → available
  ════════════════════════════════════════ */
  const saveMaint = data => {
    if (modal.mode==='add') {
      const mr = {...data, id:uid('MR'), at:now()};
      setMaint(p=>[mr,...p]);
      // any new maintenance request → set room to maintenance
      setBoardStatus(data.mid,'maintenance','System');
      log('Supervisor',`${mr.id} raised — ${data.cat} Rm ${numOf(data.mid)} (${data.sev})`);
    } else {
      const prev = maint.find(m=>m.id===data.id);
      setMaint(p=>p.map(m=>m.id===data.id?data:m));
      log('Supervisor',`${data.id} updated → ${data.status}`);
      // resolved → set room available (only if no other open requests on same room)
      if (data.status==='resolved' && prev?.status!=='resolved') {
        const otherOpen = maint.some(m=>m.id!==data.id&&m.mid===data.mid&&m.status!=='resolved');
        if (!otherOpen) {
          setBoardStatus(data.mid,'available','System');
          log('System',`${data.id} resolved → Room ${numOf(data.mid)} set to Available`);
        }
      }
    }
    setModal(null);
  };
  const deleteMaint = data => {
    setMaint(p=>p.filter(m=>m.id!==data.id));
    log('Supervisor',`${data.id} deleted`);
    setModal(null);
  };

  /* ════════════════════════════════════════
     AUTO-ASSIGN (dirty rooms only)
  ════════════════════════════════════════ */
  const autoAssign = () => {
    const dirty = board.filter(b=>b.status==='dirty'&&!b.asgn);
    const hks   = staff.filter(s=>s.role==='housekeeper'&&s.onShift);
    if (!hks.length)  { log('System','Auto-assign failed — no housekeepers on shift'); return; }
    if (!dirty.length){ log('System','Auto-assign — no unassigned dirty rooms'); return; }
    const counts = Object.fromEntries(hks.map(h=>[h.id, board.filter(b=>b.asgn===h.id).length]));
    const map = {};
    for (const b of dirty) {
      const h = hks.slice().sort((a,z)=>counts[a.id]-counts[z.id])[0];
      map[b.mid]=h.id; counts[h.id]++;
    }
    setBoard(p=>p.map(b=>map[b.mid]?{...b,asgn:map[b.mid]}:b));
    const n=Object.keys(map).length, u=new Set(Object.values(map)).size;
    log('System',`Auto-assign: ${n} dirty rooms → ${u} housekeeper${u!==1?'s':''} (round-robin)`);
  };
  const clearAssign = () => {
    setBoard(p=>p.map(b=>b.status==='dirty'?{...b,asgn:null}:b));
    log('Supervisor','Dirty room assignments cleared');
  };

  /* ── combined view (master + board) ── */
  const rooms = useMemo(()=>
    master.map(m=>({...m,...(boardOf(m.id)||{mid:m.id,status:'available',asgn:null,notes:''})}))
  ,[master,board]);

  const filteredRooms = useMemo(()=>{
    const fn={all:()=>true,available:r=>r.status==='available',occupied:r=>r.status==='occupied',
      dirty:r=>r.status==='dirty',maintenance:r=>r.status==='maintenance',blocked:r=>r.status==='blocked',
      unassigned:r=>r.status==='dirty'&&!r.asgn};
    return rooms.filter(fn[filter]||fn.all);
  },[rooms,filter]);

  const floors = [...new Set(master.map(r=>r.fl))].sort();
  const maintOpen = maint.filter(m=>m.status!=='resolved').length;

  const nav = [
    {id:'master',  icon:'◫',  label:'Master Rooms',  badge:null},
    {id:'board',   icon:'⊞',  label:'Room Board',    badge:null},
    {id:'assign',  icon:'⟳',  label:'Assignments',   badge:board.filter(b=>b.status==='dirty'&&!b.asgn).length||null, bc:T.amber},
    {id:'maint',   icon:'⚠',  label:'Maintenance',   badge:maintOpen||null, bc:T.red},
    {id:'shift',   icon:'◎',  label:'Shift Roster',  badge:null},
    {id:'analytics',icon:'▤', label:'Analytics',     badge:null},
    {id:'audit',   icon:'≡',  label:'Audit Log',     badge:null},
  ];

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div style={{display:'flex',height:'100vh',background:T.bg,color:T.text,fontFamily:"'Outfit',sans-serif",overflow:'hidden'}}>
      <style>{CSS}</style>

      {/* ═══ SIDEBAR ═══ */}
      <aside style={{width:218,background:T.surf,borderRight:`1px solid ${T.border}`,flexShrink:0,display:'flex',flexDirection:'column'}}>
        <div style={{padding:'18px 16px 14px',borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:32,height:32,borderRadius:8,background:T.amber,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>⌂</div>
            <div>
              <div style={{fontWeight:700,fontSize:13,letterSpacing:'0.5px'}}>PRIMUS PMS</div>
              <div style={{fontSize:10,color:T.faint,marginTop:1}}>Housekeeping Suite</div>
            </div>
          </div>
        </div>
        <div style={{padding:'10px 14px',borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:T.green,flexShrink:0}}/>
            <span style={{color:T.muted}}>Morning Shift · Active</span>
          </div>
          <div className="mono" style={{fontSize:10,color:T.faint,marginTop:3}}>{now()} · 20 Apr 2026</div>
        </div>
        <nav style={{padding:'6px 8px',flex:1,overflowY:'auto'}}>
          {nav.map(n=>(
            <div key={n.id} className={`navitem${view===n.id?' act':''}`} onClick={()=>setView(n.id)}>
              <span style={{fontSize:14,width:18,textAlign:'center',flexShrink:0}}>{n.icon}</span>
              <span style={{flex:1}}>{n.label}</span>
              {n.badge!=null&&<span style={{background:n.bc,color:n.bc===T.red?'#fff':'#000',borderRadius:99,fontSize:9,fontWeight:700,padding:'1px 6px'}}>{n.badge}</span>}
            </div>
          ))}
        </nav>
        <div style={{padding:'12px 14px',borderTop:`1px solid ${T.border}`,display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {Object.entries(RS).map(([k,v])=>(
            <div key={k} style={{textAlign:'center'}}>
              <div className="mono" style={{fontSize:18,fontWeight:600,color:v.color,lineHeight:1}}>{board.filter(b=>b.status===k).length}</div>
              <div style={{fontSize:9,color:T.faint,marginTop:2,letterSpacing:'0.4px'}}>{v.label}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <main style={{flex:1,overflowY:'auto'}}>

        {/* ──────────────────────────────────────────
            MODULE 1 — MASTER ROOM DATA
        ────────────────────────────────────────── */}
        {view==='master'&&(
          <div style={{padding:22}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:10}}>
              <div>
                <h1 style={{fontSize:20,fontWeight:700}}>Master Room Data</h1>
                <div style={{fontSize:12,color:T.muted,marginTop:2}}>Source of truth · {master.length} rooms registered · Changes propagate to Room Board and Maintenance</div>
              </div>
              <button className="btn" onClick={()=>setModal({type:'master',mode:'add',data:{num:'',fl:1,type:'Standard'}})}
                style={{padding:'8px 18px',fontSize:12,background:T.amber,color:'#000'}}>+ Add Room</button>
            </div>

            {/* Per-floor tables */}
            {floors.map(fl=>{
              const grp=master.filter(m=>m.fl===fl);
              if(!grp.length) return null;
              return(
                <div key={fl} style={{marginBottom:22}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                    <span className="mono" style={{fontWeight:600,color:T.amber,fontSize:11,letterSpacing:'1px'}}>FLOOR {fl}</span>
                    <div style={{flex:1,height:1,background:T.border}}/>
                    <span style={{fontSize:11,color:T.faint}}>{grp.length} rooms</span>
                  </div>
                  <div className="card" style={{overflow:'hidden'}}>
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>ROOM NO.</th><th>FLOOR</th><th>ROOM TYPE</th><th>BOARD STATUS</th><th>MAINTENANCE</th><th style={{width:96}}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grp.map(m=>{
                          const b=boardOf(m.id)||{status:'available'};
                          const rs=RS[b.status];
                          const mReq=maint.filter(mr=>mr.mid===m.id&&mr.status!=='resolved');
                          return(
                            <tr key={m.id}>
                              <td><span className="mono" style={{fontWeight:700,fontSize:15}}>{m.num}</span></td>
                              <td style={{color:T.muted}}>{m.fl}</td>
                              <td><Tag label={m.type} color={m.type==='Suite'?T.purple:m.type==='Deluxe'?T.blue:T.muted}/></td>
                              <td>
                                <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11,padding:'3px 8px',borderRadius:5,background:rs.bg,border:`1px solid ${rs.bd}`}}>
                                  <span style={{width:6,height:6,borderRadius:'50%',background:rs.color,flexShrink:0}}/>
                                  <span style={{color:rs.color,fontWeight:600}}>{rs.label}</span>
                                </span>
                              </td>
                              <td>
                                {mReq.length
                                  ?<span style={{fontSize:11,color:T.orange}}>⚠ {mReq.length} open</span>
                                  :<span style={{fontSize:11,color:T.faint}}>None</span>}
                              </td>
                              <td>
                                <div style={{display:'flex',gap:5}}>
                                  <IBtn icon="✎" onClick={()=>setModal({type:'master',mode:'edit',data:{...m}})}/>
                                  <IBtn icon="✕" danger onClick={()=>setModal({type:'master',mode:'delete',data:{...m}})}/>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ──────────────────────────────────────────
            MODULE 2 — ROOM BOARD
        ────────────────────────────────────────── */}
        {view==='board'&&(
          <div style={{padding:22}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,flexWrap:'wrap',gap:10}}>
              <div>
                <h1 style={{fontSize:20,fontWeight:700}}>Room Board</h1>
                <div style={{fontSize:12,color:T.muted,marginTop:2}}>Operational status view · Click a room to change status</div>
              </div>
            </div>
            {/* Filters */}
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
              {[{id:'all',l:'All'},{id:'available',l:'Available'},{id:'occupied',l:'Occupied'},{id:'dirty',l:'Dirty'},{id:'maintenance',l:'Maintenance'},{id:'blocked',l:'Blocked'},{id:'unassigned',l:'Dirty Unassigned'}].map(f=>(
                <button key={f.id} className="btn" onClick={()=>setFilter(f.id)}
                  style={{padding:'5px 12px',fontSize:11,background:filter===f.id?T.amber:'transparent',color:filter===f.id?'#000':T.muted,border:`1px solid ${filter===f.id?T.amber:T.border}`}}>
                  {f.l}
                </button>
              ))}
            </div>
            {/* Legend */}
            <div style={{display:'flex',gap:14,marginBottom:18,flexWrap:'wrap'}}>
              {Object.entries(RS).map(([k,v])=>(
                <div key={k} style={{display:'flex',alignItems:'center',gap:5,fontSize:11}}>
                  <div style={{width:8,height:8,borderRadius:2,background:v.color}}/>
                  <span style={{color:T.muted}}>{v.label}</span>
                </div>
              ))}
            </div>
            {floors.map(fl=>{
              const fr=filteredRooms.filter(r=>r.fl===fl);
              if(!fr.length) return null;
              return(
                <div key={fl} style={{marginBottom:24}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                    <span className="mono" style={{fontWeight:600,color:T.amber,fontSize:11,letterSpacing:'1px'}}>FLOOR {fl}</span>
                    <div style={{flex:1,height:1,background:T.border}}/>
                    <span style={{fontSize:11,color:T.faint}}>{fr.length} rooms</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(138px,1fr))',gap:9}}>
                    {fr.map(r=>{
                      const s=RS[r.status];
                      const hasMaint=maint.some(m=>m.mid===r.id&&m.status!=='resolved');
                      return(
                        <div key={r.id} className="card rc" onClick={()=>setDrawer(r.id)}
                          style={{padding:11,background:s.bg,borderColor:s.bd,position:'relative',overflow:'hidden'}}>
                          <div className="mono" style={{fontSize:24,fontWeight:700,lineHeight:1,marginBottom:5}}>{r.num}</div>
                          <div style={{fontSize:10,color:T.faint,marginBottom:6,textTransform:'capitalize'}}>{r.type}</div>
                          <div style={{display:'inline-flex',padding:'2px 7px',borderRadius:4,border:`1px solid ${s.bd}`}}>
                            <span className="mono" style={{fontSize:9,fontWeight:700,color:s.color}}>{s.label.toUpperCase()}</span>
                          </div>
                          {r.asgn&&<div style={{fontSize:10,color:T.muted,marginTop:5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>→ {sName(r.asgn).split(' ')[0]}</div>}
                          {hasMaint&&<div style={{position:'absolute',top:7,right:7,width:7,height:7,borderRadius:'50%',background:T.orange}}/>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ──────────────────────────────────────────
            MODULE 3 — ASSIGNMENTS
        ────────────────────────────────────────── */}
        {view==='assign'&&(
          <div style={{padding:22}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18,flexWrap:'wrap',gap:10}}>
              <div>
                <h1 style={{fontSize:20,fontWeight:700}}>Assignment Engine</h1>
                <div style={{fontSize:12,color:T.muted,marginTop:2}}>Only rooms with status <strong style={{color:RS.dirty.color}}>Dirty</strong> are eligible for assignment</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn" onClick={clearAssign} style={{padding:'7px 16px',fontSize:12,background:'transparent',color:T.muted,border:`1px solid ${T.border}`}}>↺ Clear</button>
                <button className="btn" onClick={autoAssign}  style={{padding:'7px 18px',fontSize:12,background:T.amber,color:'#000'}}>⚡ Auto-Assign</button>
              </div>
            </div>
            <div className="card" style={{padding:14,marginBottom:20,borderColor:'rgba(245,158,11,0.25)',background:'rgba(245,158,11,0.04)'}}>
              <div style={{fontSize:11,fontWeight:700,color:T.amber,marginBottom:6,letterSpacing:'0.5px'}}>ASSIGNMENT LOGIC</div>
              <div style={{fontSize:12,color:T.muted,lineHeight:1.8}}>
                Only rooms with status <strong style={{color:RS.dirty.color}}>Dirty</strong> are queued.
                Rooms are distributed round-robin to on-shift housekeepers — the one with the fewest current assignments gets the next room.
                Use the table below for manual override per room.
              </div>
            </div>
            {/* Housekeeper cards */}
            <div style={{fontSize:12,fontWeight:600,marginBottom:10,letterSpacing:'0.5px',color:T.muted}}>HOUSEKEEPERS ON SHIFT</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(225px,1fr))',gap:10,marginBottom:24}}>
              {staff.filter(s=>s.role==='housekeeper').map(h=>{
                const asgnd=rooms.filter(r=>boardOf(r.id)?.asgn===h.id&&r.status==='dirty');
                return(
                  <div key={h.id} className="card" style={{padding:14,opacity:h.onShift?1:0.45}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:14}}>{h.name}</div>
                        <div style={{fontSize:11,color:T.faint,marginTop:2}}>{h.skill}</div>
                      </div>
                      <span style={{fontSize:10,padding:'3px 8px',borderRadius:99,
                        background:h.onShift?'rgba(16,185,129,0.12)':'rgba(107,114,128,0.12)',
                        border:`1px solid ${h.onShift?'rgba(16,185,129,0.3)':'rgba(107,114,128,0.3)'}`,
                        color:h.onShift?T.green:T.muted,fontWeight:700}}>{h.onShift?'ON':'OFF'}</span>
                    </div>
                    <div style={{fontSize:11,color:T.muted,marginBottom:6}}>{asgnd.length} dirty room{asgnd.length!==1?'s':''} assigned</div>
                    <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                      {asgnd.map(r=><span key={r.id} className="mono" style={{fontSize:10,padding:'2px 7px',background:T.surf,borderRadius:4,color:RS.dirty.color,border:`1px solid ${RS.dirty.bd}`}}>{r.num}</span>)}
                      {!asgnd.length&&<span style={{fontSize:11,color:T.faint,fontStyle:'italic'}}>No dirty rooms</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Unassigned dirty rooms table */}
            <div style={{fontSize:12,fontWeight:600,marginBottom:10,letterSpacing:'0.5px',color:T.muted}}>UNASSIGNED DIRTY ROOMS</div>
            <div className="card" style={{overflow:'hidden'}}>
              <table className="tbl">
                <thead><tr><th>ROOM</th><th>FLOOR</th><th>TYPE</th><th>NOTES</th><th>ASSIGN TO</th></tr></thead>
                <tbody>
                  {rooms.filter(r=>r.status==='dirty'&&!boardOf(r.id)?.asgn).map((r,i)=>(
                    <tr key={r.id} style={{background:i%2?'transparent':T.surf}}>
                      <td><span className="mono" style={{fontWeight:700}}>{r.num}</span></td>
                      <td style={{color:T.muted}}>{r.fl}</td>
                      <td style={{color:T.muted,textTransform:'capitalize'}}>{r.type}</td>
                      <td style={{color:T.faint,fontSize:11,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.notes||'—'}</td>
                      <td>
                        <select style={{fontSize:11,padding:'4px 8px',width:'auto'}} value="" onChange={e=>{
                          if(!e.target.value)return;
                          setBoard(p=>p.map(b=>b.mid===r.id?{...b,asgn:e.target.value}:b));
                          log('Supervisor',`Room ${r.num} manually assigned to ${sName(e.target.value)}`);
                          e.target.value='';
                        }}>
                          <option value="">Choose…</option>
                          {staff.filter(s=>s.role==='housekeeper'&&s.onShift).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {!rooms.filter(r=>r.status==='dirty'&&!boardOf(r.id)?.asgn).length&&(
                    <tr><td colSpan={5} style={{padding:22,textAlign:'center',color:T.faint,fontStyle:'italic',fontSize:12}}>✓ All dirty rooms are assigned</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────
            MODULE 4 — MAINTENANCE
        ────────────────────────────────────────── */}
        {view==='maint'&&(
          <div style={{padding:22}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18,flexWrap:'wrap',gap:10}}>
              <div>
                <h1 style={{fontSize:20,fontWeight:700}}>Maintenance Tracker</h1>
                <div style={{fontSize:12,color:T.muted,marginTop:2}}>
                  {maintOpen} open · Creating a request → room set to <strong style={{color:RS.maintenance.color}}>Maintenance</strong> · Resolving → room set to <strong style={{color:RS.available.color}}>Available</strong>
                </div>
              </div>
              <button className="btn"
                onClick={()=>setModal({type:'maint',mode:'add',data:{mid:'',cat:'AC',sev:'medium',desc:'',tech:null,status:'open',notes:''}})}
                style={{padding:'8px 18px',fontSize:12,background:T.amber,color:'#000'}}>+ New Request</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:14}}>
              {MAINT_STATS.map(st=>{
                const cfg=MS_CFG[st];
                const col=maint.filter(m=>m.status===st);
                return(
                  <div key={st}>
                    <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:10}}>
                      <div style={{width:7,height:7,borderRadius:'50%',background:cfg.c,flexShrink:0}}/>
                      <span style={{fontWeight:600,fontSize:12,color:cfg.c}}>{cfg.l}</span>
                      <span className="mono" style={{fontSize:10,color:T.faint,background:T.surf,borderRadius:4,padding:'1px 5px'}}>{col.length}</span>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {col.map(m=>{
                        const sc=SEV_C[m.sev];
                        const rm=roomOf(m.mid);
                        const tech=staff.find(s=>s.id===m.tech);
                        return(
                          <div key={m.id} className="card" style={{padding:12,borderColor:`${cfg.c}30`,background:`${cfg.c}09`}}>
                            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                              <div style={{display:'flex',gap:7,alignItems:'center'}}>
                                <span className="mono" style={{fontSize:10,color:T.faint}}>{m.id}</span>
                                <span className="mono" style={{fontSize:14,fontWeight:700}}>Rm {rm?.num||'?'}</span>
                              </div>
                              <span style={{fontSize:9,padding:'2px 6px',borderRadius:3,background:`${sc}22`,color:sc,fontWeight:700}}>{m.sev.toUpperCase()}</span>
                            </div>
                            {rm&&<div style={{fontSize:11,color:T.faint,marginBottom:4}}>{rm.type} · Floor {rm.fl}</div>}
                            <div style={{fontSize:12,fontWeight:600,marginBottom:3}}>{m.cat}</div>
                            <div style={{fontSize:11,color:T.muted,marginBottom:5,lineHeight:1.5}}>{m.desc}</div>
                            {m.notes&&<div style={{fontSize:11,color:T.green,marginBottom:4,fontStyle:'italic'}}>→ {m.notes}</div>}
                            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:T.faint,marginBottom:tech?4:0}}>
                              <span>{m.at}</span>
                            </div>
                            {tech&&<div style={{fontSize:11,color:T.blue,marginBottom:2}}>🔧 {tech.name}</div>}
                            <div style={{display:'flex',gap:5,marginTop:9}}>
                              <button className="btn" onClick={()=>setModal({type:'maint',mode:'edit',data:{...m}})} style={{flex:1,padding:'5px 0',fontSize:11,background:T.surf,color:T.text,border:`1px solid ${T.border}`}}>Edit</button>
                              <IBtn icon="✕" danger onClick={()=>setModal({type:'maint',mode:'delete',data:{...m}})}/>
                            </div>
                          </div>
                        );
                      })}
                      {!col.length&&<div style={{padding:14,textAlign:'center',color:T.faint,fontSize:11,fontStyle:'italic',border:`1px dashed ${T.border}`,borderRadius:7}}>No tickets</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────
            MODULE 5 — SHIFT ROSTER
        ────────────────────────────────────────── */}
        {view==='shift'&&(
          <div style={{padding:22}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18,flexWrap:'wrap',gap:10}}>
              <div>
                <h1 style={{fontSize:20,fontWeight:700}}>Shift Roster</h1>
                <div style={{fontSize:12,color:T.muted,marginTop:2}}>{staff.filter(s=>s.onShift).length} on shift · {staff.length} total staff</div>
              </div>
              <button className="btn" onClick={()=>setModal({type:'staff',mode:'add',data:{name:'',role:'housekeeper',skill:'Mid',onShift:true}})}
                style={{padding:'8px 18px',fontSize:12,background:T.amber,color:'#000'}}>+ Add Staff</button>
            </div>
            {ROLES.map(role=>{
              const grp=staff.filter(s=>s.role===role);
              if(!grp.length) return null;
              const rc=ROLE_C[role];
              return(
                <div key={role} style={{marginBottom:22}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                    <span style={{fontSize:11,fontWeight:700,color:rc,letterSpacing:'0.5px',textTransform:'uppercase'}}>{role}</span>
                    <div style={{flex:1,height:1,background:T.border}}/>
                    <span style={{fontSize:11,color:T.faint}}>{grp.filter(s=>s.onShift).length}/{grp.length} on shift</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(225px,1fr))',gap:10}}>
                    {grp.map(h=>(
                      <div key={h.id} className="card" style={{padding:14,opacity:h.onShift?1:0.5}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                          <div>
                            <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>{h.name}</div>
                            <Tag label={h.skill} color={rc}/>
                          </div>
                          <div className="toggle" style={{background:h.onShift?T.green:'#374151'}} onClick={()=>toggleShift(h.id)}>
                            <div className="toggle-knob" style={{left:h.onShift?23:3}}/>
                          </div>
                        </div>
                        <div style={{display:'flex',gap:6,marginTop:6}}>
                          <button className="btn" onClick={()=>setModal({type:'staff',mode:'edit',data:{...h}})} style={{flex:1,padding:'5px 0',fontSize:11,background:T.surf,color:T.text,border:`1px solid ${T.border}`}}>Edit</button>
                          <IBtn icon="✕" danger onClick={()=>setModal({type:'staff',mode:'delete',data:{...h}})}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ──────────────────────────────────────────
            MODULE 6 — ANALYTICS
        ────────────────────────────────────────── */}
        {view==='analytics'&&(
          <div style={{padding:22}}>
            <div style={{marginBottom:18}}>
              <h1 style={{fontSize:20,fontWeight:700}}>Analytics</h1>
              <div style={{fontSize:12,color:T.muted,marginTop:2}}>Morning shift · 20 April 2026</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(145px,1fr))',gap:10,marginBottom:22}}>
              {[
                {l:'Total Rooms',   v:master.length,                                            c:T.text},
                {l:'Available',     v:board.filter(b=>b.status==='available').length,           c:RS.available.color},
                {l:'Occupied',      v:board.filter(b=>b.status==='occupied').length,            c:RS.occupied.color},
                {l:'Dirty',         v:board.filter(b=>b.status==='dirty').length,               c:RS.dirty.color},
                {l:'Maintenance',   v:board.filter(b=>b.status==='maintenance').length,         c:RS.maintenance.color},
                {l:'Blocked',       v:board.filter(b=>b.status==='blocked').length,             c:RS.blocked.color},
                {l:'Dirty Unassign',v:board.filter(b=>b.status==='dirty'&&!b.asgn).length,     c:T.amber},
                {l:'Open Tickets',  v:maintOpen,                                                c:T.orange},
                {l:'Critical',      v:maint.filter(m=>m.sev==='critical').length,              c:T.red},
                {l:'On Shift',      v:staff.filter(s=>s.onShift).length,                       c:T.green},
              ].map(m=>(
                <div key={m.l} className="card" style={{padding:14}}>
                  <div style={{fontSize:10,color:T.faint,marginBottom:6,letterSpacing:'0.5px'}}>{m.l.toUpperCase()}</div>
                  <div className="mono" style={{fontSize:28,fontWeight:700,color:m.c,lineHeight:1}}>{m.v}</div>
                </div>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <div className="card" style={{padding:16}}>
                <div style={{fontSize:12,fontWeight:600,marginBottom:14,letterSpacing:'0.5px'}}>ROOM STATUS BREAKDOWN</div>
                {Object.entries(RS).map(([k,v])=>{
                  const cnt=board.filter(b=>b.status===k).length;
                  const pct=master.length?Math.round(cnt/master.length*100):0;
                  return(
                    <div key={k} style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                      <span style={{width:90,fontSize:12,color:v.color}}>{v.label}</span>
                      <div style={{flex:1,height:6,background:T.border,borderRadius:3,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${pct}%`,background:v.color,borderRadius:3}}/>
                      </div>
                      <span className="mono" style={{width:28,textAlign:'right',fontSize:12}}>{cnt}</span>
                    </div>
                  );
                })}
              </div>
              <div className="card" style={{padding:16}}>
                <div style={{fontSize:12,fontWeight:600,marginBottom:14,letterSpacing:'0.5px'}}>MAINTENANCE BY SEVERITY</div>
                {MAINT_SEVS.map(sv=>{
                  const c=SEV_C[sv];
                  const cnt=maint.filter(m=>m.sev===sv).length;
                  const pct=maint.length?Math.round(cnt/maint.length*100):0;
                  return(
                    <div key={sv} style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                      <span style={{width:60,fontSize:12,color:c,textTransform:'capitalize'}}>{sv}</span>
                      <div style={{flex:1,height:6,background:T.border,borderRadius:3,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${pct}%`,background:c,borderRadius:3}}/>
                      </div>
                      <span className="mono" style={{width:16,textAlign:'right',fontSize:12}}>{cnt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────
            MODULE 7 — AUDIT LOG
        ────────────────────────────────────────── */}
        {view==='audit'&&(
          <div style={{padding:22}}>
            <div style={{marginBottom:18}}>
              <h1 style={{fontSize:20,fontWeight:700}}>Audit Log</h1>
              <div style={{fontSize:12,color:T.muted,marginTop:2}}>Immutable record of all system actions</div>
            </div>
            <div className="card" style={{overflow:'hidden'}}>
              <table className="tbl">
                <thead><tr><th>DATE</th><th>TIME</th><th>USER</th><th>ACTION</th></tr></thead>
                <tbody>
                  {audit.map((l,i)=>(
                    <tr key={i} style={{background:i%2?'transparent':T.surf}}>
                      <td className="mono" style={{fontSize:11,color:T.faint,whiteSpace:'nowrap'}}>{l.date||'—'}</td>
                      <td className="mono" style={{fontSize:11,color:T.amber,whiteSpace:'nowrap'}}>{l.time}</td>
                      <td style={{fontSize:12,whiteSpace:'nowrap'}}>{l.user}</td>
                      <td style={{fontSize:12,color:T.muted}}>{l.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ═══ ROOM BOARD DRAWER ═══ */}
      {drawer&&(()=>{
        const m=roomOf(drawer);
        const b=boardOf(drawer)||{status:'available',asgn:null,notes:''};
        const s=RS[b.status];
        const related=maint.filter(mr=>mr.mid===drawer&&mr.status!=='resolved');
        if(!m) return null;
        return(
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',display:'flex',justifyContent:'flex-end',zIndex:100}}
            onClick={e=>e.target===e.currentTarget&&setDrawer(null)}>
            <div style={{width:360,background:T.surf,borderLeft:`1px solid ${T.border}`,overflowY:'auto',display:'flex',flexDirection:'column'}}>
              <div style={{padding:'18px 18px 14px',borderBottom:`1px solid ${T.border}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                  <div className="mono" style={{fontSize:28,fontWeight:700,lineHeight:1}}>Room {m.num}</div>
                  <button className="btn" onClick={()=>setDrawer(null)} style={{padding:'5px 10px',background:'transparent',color:T.muted,border:`1px solid ${T.border}`,fontSize:13}}>✕</button>
                </div>
                <div style={{fontSize:12,color:T.muted}}>{m.type} · Floor {m.fl}</div>
              </div>
              <div style={{padding:14,borderBottom:`1px solid ${T.border}`}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
                  {[{l:'Current Status',v:s.label,c:s.color},{l:'Assigned To',v:b.asgn?sName(b.asgn):'—',c:b.asgn?T.text:T.faint}].map(item=>(
                    <div key={item.l} style={{padding:'9px 11px',background:T.card,borderRadius:7,border:`1px solid ${T.border}`}}>
                      <div style={{fontSize:9,color:T.faint,marginBottom:4,letterSpacing:'0.5px'}}>{item.l.toUpperCase()}</div>
                      <div style={{fontSize:13,fontWeight:600,color:item.c}}>{item.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:10,fontWeight:700,color:T.muted,marginBottom:9,letterSpacing:'0.5px'}}>CHANGE STATUS</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {Object.entries(RS).map(([k,v])=>(
                    <button key={k} className="btn" disabled={b.status===k}
                      onClick={()=>{setBoardStatus(drawer,k,'Staff');setDrawer(drawer);}}
                      style={{padding:'5px 11px',fontSize:10,background:b.status===k?v.color:'transparent',color:b.status===k?'#000':v.color,border:`1px solid ${v.bd}`}}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
              {related.length>0&&(
                <div style={{padding:14}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.muted,marginBottom:10,letterSpacing:'0.5px'}}>OPEN MAINTENANCE ({related.length})</div>
                  {related.map(mr=>{
                    const sc=SEV_C[mr.sev];
                    return(
                      <div key={mr.id} style={{padding:10,background:T.card,border:`1px solid ${T.border}`,borderRadius:7,marginBottom:7}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                          <span style={{fontSize:12,fontWeight:600}}>{mr.cat}</span>
                          <span style={{fontSize:9,padding:'2px 6px',borderRadius:3,background:`${sc}22`,color:sc,fontWeight:700}}>{mr.sev.toUpperCase()}</span>
                        </div>
                        <div style={{fontSize:11,color:T.muted,marginBottom:3}}>{mr.desc}</div>
                        <div style={{fontSize:10,color:T.faint}}>Status: <span style={{color:MS_CFG[mr.status].c}}>{MS_CFG[mr.status].l}</span> · {mr.at}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ═══ MODALS ═══ */}
      {modal&&modal.type==='master'&&(
        <MasterModal mode={modal.mode} initial={modal.data}
          onClose={()=>setModal(null)} onSave={saveMaster}
          onDelete={()=>modal.mode==='edit'?setModal({...modal,mode:'delete'}):deleteMaster(modal.data)}/>
      )}
      {modal&&modal.type==='staff'&&(
        <StaffModal mode={modal.mode} initial={modal.data}
          onClose={()=>setModal(null)} onSave={saveStaff}
          onDelete={()=>modal.mode==='edit'?setModal({...modal,mode:'delete'}):deleteStaff(modal.data)}/>
      )}
      {modal&&modal.type==='maint'&&(
        <MaintModal mode={modal.mode} initial={modal.data} master={master} staff={staff}
          onClose={()=>setModal(null)} onSave={saveMaint}
          onDelete={()=>modal.mode==='edit'?setModal({...modal,mode:'delete'}):deleteMaint(modal.data)}/>
      )}
    </div>
  );
}

/* ─── MASTER ROOM MODAL ────────────────────────────────── */
function MasterModal({ mode, initial, onClose, onSave, onDelete }) {
  const [d,setD]=useState({...initial});
  const s=k=>e=>setD(p=>({...p,[k]:e.target.value}));
  if(mode==='delete') return(
    <Modal title={`Delete Room ${d.num}`} onClose={onClose}>
      <div className="dz">
        <div style={{fontSize:13,color:T.text}}>Permanently delete <strong>Room {d.num}</strong> from master data. This will also remove its board entry and all linked maintenance requests. Cannot be undone.</div>
      </div>
      <FormActions onCancel={onClose} onSave={onDelete} saveLabel="Yes, Delete"/>
    </Modal>
  );
  return(
    <Modal title={mode==='add'?'Add Room to Master Data':'Edit Room'} onClose={onClose}>
      <div style={{fontSize:11,color:T.faint,marginBottom:16,padding:'8px 10px',background:'rgba(59,130,246,0.06)',borderRadius:6,border:'1px solid rgba(59,130,246,0.15)'}}>
        Master data defines room structure. Status and assignments are managed in the Room Board.
      </div>
      <div className="field"><label>ROOM NUMBER</label><input value={d.num} onChange={s('num')} placeholder="e.g. 407"/></div>
      <div className="grid2">
        <div className="field"><label>FLOOR</label>
          <select value={d.fl} onChange={e=>setD(p=>({...p,fl:Number(e.target.value)}))}>
            {FLOORS.map(f=><option key={f} value={f}>Floor {f}</option>)}
          </select>
        </div>
        <div className="field"><label>ROOM TYPE</label>
          <select value={d.type} onChange={s('type')}>
            {ROOM_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <FormActions onCancel={onClose} onSave={()=>onSave(d)} saveLabel={mode==='add'?'Add Room':'Save'}
        danger={mode==='edit'} onDanger={onDelete} dangerLabel="Delete Room"/>
    </Modal>
  );
}

/* ─── STAFF MODAL ──────────────────────────────────────── */
function StaffModal({ mode, initial, onClose, onSave, onDelete }) {
  const [d,setD]=useState({...initial});
  const s=k=>e=>setD(p=>({...p,[k]:e.target.value}));
  if(mode==='delete') return(
    <Modal title={`Remove ${d.name}`} onClose={onClose}>
      <div className="dz"><div style={{fontSize:13,color:T.text}}>Permanently remove <strong>{d.name}</strong> and unassign all their rooms.</div></div>
      <FormActions onCancel={onClose} onSave={onDelete} saveLabel="Yes, Remove"/>
    </Modal>
  );
  return(
    <Modal title={mode==='add'?'Add Staff Member':'Edit Staff'} onClose={onClose}>
      <div className="field"><label>FULL NAME</label><input value={d.name} onChange={s('name')} placeholder="e.g. Siti Rahayu"/></div>
      <div className="grid2">
        <div className="field"><label>ROLE</label>
          <select value={d.role} onChange={s('role')}>
            {['housekeeper','supervisor','technician'].map(r=><option key={r} value={r}>{r[0].toUpperCase()+r.slice(1)}</option>)}
          </select>
        </div>
        <div className="field"><label>SKILL LEVEL</label>
          <select value={d.skill} onChange={s('skill')}>{['Junior','Mid','Senior','Supervisor'].map(sk=><option key={sk}>{sk}</option>)}</select>
        </div>
      </div>
      <div className="field"><label>ON SHIFT</label>
        <div style={{display:'flex',alignItems:'center',gap:10,marginTop:6}}>
          <div className="toggle" style={{background:d.onShift?T.green:'#374151'}} onClick={()=>setD(p=>({...p,onShift:!p.onShift}))}>
            <div className="toggle-knob" style={{left:d.onShift?23:3}}/>
          </div>
          <span style={{fontSize:12,color:d.onShift?T.green:T.muted}}>{d.onShift?'On Shift':'Off Shift'}</span>
        </div>
      </div>
      <FormActions onCancel={onClose} onSave={()=>onSave(d)} saveLabel={mode==='add'?'Add Staff':'Save'}
        danger={mode==='edit'} onDanger={onDelete} dangerLabel="Remove Staff"/>
    </Modal>
  );
}

/* ─── MAINTENANCE MODAL ────────────────────────────────── */
function MaintModal({ mode, initial, master, staff, onClose, onSave, onDelete }) {
  const [d,setD]=useState({...initial});
  const s=k=>e=>setD(p=>({...p,[k]:e.target.value}));
  if(mode==='delete') return(
    <Modal title={`Delete ${d.id||'Request'}`} onClose={onClose}>
      <div className="dz"><div style={{fontSize:13,color:T.text}}>Permanently delete <strong>{d.id}</strong>. Cannot be undone.</div></div>
      <FormActions onCancel={onClose} onSave={onDelete} saveLabel="Yes, Delete"/>
    </Modal>
  );
  const techs = staff.filter(s=>s.role==='technician');
  return(
    <Modal title={mode==='add'?'New Maintenance Request':'Edit Request'} onClose={onClose}>
      {mode==='add'&&(
        <div style={{fontSize:11,color:T.orange,marginBottom:14,padding:'8px 10px',background:'rgba(249,115,22,0.07)',borderRadius:6,border:'1px solid rgba(249,115,22,0.2)'}}>
          Creating this request will automatically set the selected room to <strong>Maintenance</strong> status.
          Resolving the request will set it back to <strong>Available</strong>.
        </div>
      )}
      <div className="grid2">
        <div className="field"><label>ROOM</label>
          <select value={d.mid} onChange={e=>setD(p=>({...p,mid:e.target.value}))}>
            <option value="">Select room…</option>
            {master.map(m=><option key={m.id} value={m.id}>{m.num} — {m.type} (Fl. {m.fl})</option>)}
          </select>
        </div>
        <div className="field"><label>CATEGORY</label>
          <select value={d.cat} onChange={s('cat')}>{MAINT_CATS.map(c=><option key={c}>{c}</option>)}</select>
        </div>
      </div>
      <div className="grid2">
        <div className="field"><label>SEVERITY</label>
          <select value={d.sev} onChange={s('sev')}>{MAINT_SEVS.map(sv=><option key={sv} value={sv}>{sv[0].toUpperCase()+sv.slice(1)}</option>)}</select>
        </div>
        <div className="field"><label>STATUS</label>
          <select value={d.status} onChange={s('status')}>{MAINT_STATS.map(st=><option key={st} value={st}>{MS_CFG[st].l}</option>)}</select>
        </div>
      </div>
      <div className="field"><label>DESCRIPTION</label><textarea value={d.desc} onChange={s('desc')} placeholder="Describe the issue…"/></div>
      <div className="field"><label>ASSIGN TECHNICIAN</label>
        <select value={d.tech||''} onChange={e=>setD(p=>({...p,tech:e.target.value||null}))}>
          <option value="">Unassigned</option>
          {techs.map(t=><option key={t.id} value={t.id}>{t.name} ({t.skill})</option>)}
        </select>
      </div>
      <div className="field"><label>NOTES / RESOLUTION</label><textarea value={d.notes} onChange={s('notes')} placeholder="Progress or resolution notes…"/></div>
      {mode==='edit'&&d.status==='resolved'&&(
        <div style={{fontSize:11,color:T.green,marginBottom:14,padding:'8px 10px',background:'rgba(16,185,129,0.06)',borderRadius:6,border:'1px solid rgba(16,185,129,0.2)'}}>
          ✓ Saving as Resolved will set the room back to <strong>Available</strong> (if no other open requests exist for this room).
        </div>
      )}
      <FormActions onCancel={onClose} onSave={()=>onSave(d)} saveLabel={mode==='add'?'Raise Request':'Save'}
        danger={mode==='edit'} onDanger={onDelete} dangerLabel="Delete Request"/>
    </Modal>
  );
}
