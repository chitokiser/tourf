// app.js — 여행 홈페이지 전용 스크립트
// 데이터는 localStorage 에 저장됩니다.

// ========= 유틸 =========
const LS_KEY = 'travel_data_v1';
const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 375'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%231f2937'/><stop offset='100%' stop-color='%230b0d14'/></linearGradient></defs><rect width='600' height='375' fill='url(%23g)'/><text x='50%' y='50%' text-anchor='middle' fill='%2399a2b3' font-size='28' font-family='Inter, Arial'>No Image</text></svg>`)} `;

const fmtPrice = (n, c='KRW') => (typeof n === 'number' && !isNaN(n))
  ? new Intl.NumberFormat('ko-KR', { style:'currency', currency:c }).format(n)
  : '가격문의';
const esc = (s='')=>String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m]));
const byVal = k => (a,b)=> (a[k] ?? 0) - (b[k] ?? 0);
const byValDesc = k => (a,b)=> (b[k] ?? 0) - (a[k] ?? 0);

// ========= 데이터 =========
const sample = {
  recommended: [
    { id: crypto.randomUUID(), title:'제주 한라산 & 동문시장', subtitle:'자연+미식 베스트', image:'https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=1200&auto=format&fit=crop', price:299000, currency:'KRW', location:'김포/김해 출발 · 제주', duration:'2박 3일', rating:4.9, tags:['국내','자연','미식'], highlights:['성산일출봉 일출','한라산 둘레길','동문시장 야간 미식투어'], description:'왕복 항공+호텔 2박+렌터카 48시간 포함. 일정 커스터마이즈 가능.', link:'#', featured:true },
    { id: crypto.randomUUID(), title:'오키나와 가족 자유여행', subtitle:'아이들과 함께', image:'https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1200&auto=format&fit=crop', price:659000, currency:'KRW', location:'인천 출발 · 오키나와', duration:'3박 4일', rating:4.7, tags:['해변','가족','자유여행'], highlights:['츄라우미 수족관','코우리대교 드라이브','국제거리 자유시간'], description:'가성비 최고 일정 + 렌터카 + 가족 친화 숙소.', link:'#', featured:true },
    { id: crypto.randomUUID(), title:'방콕+파타야 시티하이라이트', subtitle:'핵심만 쏙', image:'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=1200&auto=format&fit=crop', price:799000, currency:'KRW', location:'인천 출발 · 태국', duration:'4박 6일', rating:4.8, tags:['야시장','마사지','템플'], highlights:['왕궁·왓포','야시장 미식','파타야 산호섬'], description:'핵심 투어+자유시간 균형 설계. 마사지 1회 포함.', link:'#', featured:true }
  ],
  packages: [
    { id: crypto.randomUUID(), title:'다낭 바나힐 & 호이안 올인원', subtitle:'베스트셀러', image:'https://source.unsplash.com/CsoQ-jm_0vQ/1200x800', price:599000, currency:'KRW', location:'인천 출발 · 베트남', duration:'3박 5일', rating:4.8, tags:['베트남','야시장','가성비'], highlights:['바나힐 골든브릿지','호이안 야경 투어','미케비치 자유시간'], description:'항공+호텔+관광 전부 포함. 팁/옵션 최소화 상품.', link:'#', featured:true },
    { id: crypto.randomUUID(), title:'괌 올인클루시브 리조트', subtitle:'허니문/가족', image:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop', price:1299000, currency:'KRW', location:'인천 출발 · 괌', duration:'4박 5일', rating:4.6, tags:['휴양','올인클루시브'], highlights:['전일 리조트 자유','선셋 크루즈(옵션)','면세 쇼핑'], description:'항공+리조트+식음 포함(일부). 프리미엄 휴양.', link:'#', featured:true },
    { id: crypto.randomUUID(), title:'스위스 알프스 체험', subtitle:'대자연 핵심 코스', image:'https://images.unsplash.com/photo-1504194104404-433180773017?q=80&w=1200&auto=format&fit=crop', price:3499000, currency:'KRW', location:'인천 출발 · 유럽', duration:'7박 9일', rating:4.9, tags:['유럽','자연','트레킹'], highlights:['융프라우요흐 전망','루체른 호수','인터라켄 체험'], description:'스위스 일주 핵심 코스, 열차/케이블카 포함 일정.', link:'#', featured:true }
  ],
  specials: [
    { id: crypto.randomUUID(), title:'프라이빗 요트 선셋 디너(다낭)', subtitle:'한정 좌석', image:'https://images.unsplash.com/photo-1465447142348-e9952c393450?q=80&w=1200&auto=format&fit=crop', price:189000, currency:'KRW', location:'다낭 미케비치', duration:'약 2시간', rating:4.7, tags:['프라이빗','선셋','커플'], highlights:['전용 요트 탑승','스파클링 와인','전문 포토'], description:'커플/프로포즈 강력 추천. 시간/날씨에 따라 변동.', link:'#', featured:true },
    { id: crypto.randomUUID(), title:'온천 리조트 2박3일(규슈)', subtitle:'쉼을 위한 시간', image:'https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=1200&auto=format&fit=crop', price:549000, currency:'KRW', location:'부산 출발 · 일본', duration:'2박 3일', rating:4.8, tags:['온천','힐링','미식'], highlights:['노천탕 객실','가이세키 디너','특급 온천패스'], description:'조용한 힐링을 원하는 분께 추천.', link:'#', featured:true },
    { id: crypto.randomUUID(), title:'몰디브 수상비행 포토세션', subtitle:'버킷리스트', image:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop', price:5900000, currency:'KRW', location:'말레 · 몰디브', duration:'4박 6일', rating:5.0, tags:['럭셔리','허니문'], highlights:['수상비행','워터빌라','프라이빗 포토'], description:'평생 한 번, 감동의 순간을 남기세요.', link:'#', featured:true }
  ]
};

/** @type {{recommended:any[], packages:any[], specials:any[]}} */
let data = load();
// 빈 저장이면 샘플 자동 주입
if (![...data.recommended, ...data.packages, ...data.specials].length) {
  data = structuredClone(sample); save();
}

function load(){
  try{ const raw = localStorage.getItem(LS_KEY); if(raw){ const parsed = JSON.parse(raw); return normalize(parsed); } }catch(e){ console.warn('load error', e); }
  return structuredClone(sample);
}
function save(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(data)); }catch{} }

function normalize(d){
  const sections = ['recommended','packages','specials'];
  const out = { recommended:[], packages:[], specials:[] };
  for(const s of sections){
    const arr = Array.isArray(d[s]) ? d[s] : [];
    out[s] = arr.map(x => ({
      id: x.id || crypto.randomUUID(),
      title: x.title||'', subtitle: x.subtitle||'', image: x.image||'',
      price: (typeof x.price==='number'?x.price: (x.price?Number(x.price):undefined)),
      currency: x.currency||'KRW', location: x.location||'', duration: x.duration||'',
      rating: typeof x.rating==='number'?x.rating:4.8,
      tags: Array.isArray(x.tags)?x.tags: (x.tags?String(x.tags).split(',').map(s=>s.trim()).filter(Boolean):[]),
      highlights: Array.isArray(x.highlights)?x.highlights: (x.highlights?String(x.highlights).split(/\n|,/).map(s=>s.trim()).filter(Boolean):[]),
      description: x.description||'', link: x.link||'', featured: x.featured!==false
    }));
  }
  return out;
}

// ========= 렌더 =========
const grids = {
  recommended: document.getElementById('grid-recommended'),
  packages: document.getElementById('grid-packages'),
  specials: document.getElementById('grid-specials')
};

function starHTML(r){
  const full = Math.floor(r||0), half = (r-full)>=0.5;
  let s = ''; for(let i=0;i<full;i++) s += '★'; if(half) s += '☆';
  return `<span title="평점 ${r?.toFixed?.(1)??'-'}">${s || '☆'}</span>`;
}

function card(it, section, idx){
  const price = fmtPrice(it.price, it.currency);
  const img = esc(it.image||'');
  return `
  <article class="card" data-section="${section}" data-index="${idx}">
    <div class="thumb">
      <img src="${img||PLACEHOLDER_SVG}" alt="${esc(it.title)}" onerror="this.src='${PLACEHOLDER_SVG}'" />
      ${it.featured?`<div class="badge">추천</div>`:''}
    </div>
    <div class="meta">
      <div class="title">${esc(it.title)}</div>
      ${it.subtitle?`<div class="sub">${esc(it.subtitle)}</div>`:''}
      <div class="row">
        <div class="price">${price}</div>
        <div style="text-align:right;color:var(--warn)">${starHTML(it.rating||0)}</div>
      </div>
      <div class="tags">${(it.tags||[]).slice(0,4).map(t=>`<span class='chip'>#${esc(t)}</span>`).join(' ')}</div>
      ${it.description?`<div class="desc">${esc(it.description)}</div>`:''}
    </div>
    <div class="actions">
      ${it.link?`<a class="btn" href="${esc(it.link)}" target="_blank" rel="noopener">자세히 보기</a>`:''}
      <button class="btn" onclick="alert('문의 접수: ${esc(it.title)}')">문의하기</button>
    </div>
    ${isAdmin()?`
    <div class="admin-actions">
      <button class="btn" onclick="editItem('${section}', ${idx})">수정</button>
      <button class="btn" onclick="removeItem('${section}', ${idx})">삭제</button>
    </div>`:''}
  </article>`;
}

function renderSection(section){
  const grid = grids[section];
  const qEl = document.getElementById('q');
  const q = (qEl?.value || '').trim().toLowerCase();
  const sortSel = document.getElementById('sort-'+section);
  let arr = [...data[section]];

  if(q){ arr = arr.filter(it=> `${it.title} ${it.subtitle} ${(it.tags||[]).join(' ')}`.toLowerCase().includes(q)); }

  const v = sortSel?.value || 'featured';
  if(v==='price-asc') arr.sort(byVal('price'));
  else if(v==='price-desc') arr.sort(byValDesc('price'));
  else if(v==='rating-desc') arr.sort(byValDesc('rating'));
  else arr.sort((a,b)=> (b.featured?1:0) - (a.featured?1:0));

  grid.innerHTML = arr.map((it, i)=>card(it, section, i)).join('');
}

function renderAll(){ ['recommended','packages','specials'].forEach(renderSection); toggleAdminBar(); }

// ========= 검색/정렬 핸들 =========
const qInput = document.getElementById('q');
if (qInput) qInput.addEventListener('input', ()=> renderAll());
for(const id of ['sort-recommended','sort-packages','sort-specials']){
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', ()=> renderAll());
}

// ========= 관리자 =========
let _admin = false;
const adminBar = document.getElementById('adminBar');
const adminBtn = document.getElementById('adminBtn');

function isAdmin(){ return _admin; }
function toggleAdmin(force){
  _admin = typeof force==='boolean'? force : !_admin;
  toggleAdminBar(); renderAll();
}
function toggleAdminBar(){ adminBar.classList.toggle('show', _admin); adminBar.setAttribute('aria-hidden', _admin? 'false':'true'); }

adminBtn.addEventListener('click', ()=>{
  if(!_admin){
    const pass = prompt('관리자 비밀번호를 입력하세요 ');
    if(pass==='888888'){ toggleAdmin(true); }
    else if(pass!==null){ alert('비밀번호가 올바르지 않습니다.'); }
  }else{ toggleAdmin(false); }
});
window.addEventListener('keydown', (e)=>{ if(e.altKey && e.key.toLowerCase()==='a'){ adminBtn.click(); } });

// ========= 모달(Add/Edit) =========
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const itemForm = document.getElementById('itemForm');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const addItemBtn = document.getElementById('addItemBtn');

closeModalBtn.onclick = ()=> hideModal();
cancelBtn.onclick = ()=> hideModal();
addItemBtn.onclick = ()=> openModal();

let editing = null; // { section, index }

function openModal(payload){
  modal.classList.add('show');
  modalTitle.textContent = payload? '항목 수정' : '항목 추가';
  if(payload?.item){
    const f = itemForm;
    f.section.value = payload.section;
    f.featured.value = String(!!payload.item.featured);
    f.rating.value = payload.item.rating ?? 4.8;
    f.title.value = payload.item.title || '';
    f.subtitle.value = payload.item.subtitle || '';
    f.image.value = payload.item.image || '';
    f.price.value = payload.item.price ?? '';
    f.currency.value = payload.item.currency || 'KRW';
    f.location.value = payload.item.location || '';
    f.duration.value = payload.item.duration || '';
    f.tags.value = (payload.item.tags||[]).join(', ');
    f.highlights.value = (payload.item.highlights||[]).join('\n');
    f.description.value = payload.item.description || '';
    f.link.value = payload.item.link || '';
    editing = { section: payload.section, index: payload.index };
  } else {
    itemForm.reset(); editing = null;
  }
}
function hideModal(){ modal.classList.remove('show'); itemForm.reset(); editing=null; }

itemForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const f = e.target;
  const item = {
    id: crypto.randomUUID(),
    title: f.title.value.trim(),
    subtitle: f.subtitle.value.trim(),
    image: f.image.value.trim(),
    price: f.price.value ? Number(f.price.value) : undefined,
    currency: f.currency.value,
    location: f.location.value.trim(),
    duration: f.duration.value.trim(),
    rating: f.rating.value ? Number(f.rating.value) : 0,
    tags: f.tags.value ? f.tags.value.split(',').map(s=>s.trim()).filter(Boolean) : [],
    highlights: f.highlights.value ? f.highlights.value.split(/\n|,/).map(s=>s.trim()).filter(Boolean) : [],
    description: f.description.value.trim(),
    link: f.link.value.trim(),
    featured: f.featured.value === 'true'
  };
  const section = f.section.value;

  if(editing){
    // keep id
    item.id = data[editing.section][editing.index].id;
    data[editing.section][editing.index] = item;
  } else {
    data[section].unshift(item);
  }
  save(); hideModal(); renderAll();
});

// expose for inline buttons
window.editItem = (section, index)=>{
  const item = data[section][index];
  openModal({ item, section, index });
}
window.removeItem = (section, index)=>{
  if(confirm('정말 삭제할까요?')){ data[section].splice(index,1); save(); renderAll(); }
}

// ========= Import / Export =========
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const seedBtn = document.getElementById('seedBtn');
const clearBtn = document.getElementById('clearBtn');

exportBtn.addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'travel_data.json'; a.click(); URL.revokeObjectURL(a.href);
});
importFile.addEventListener('change', (e)=>{
  const file = e.target.files?.[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{ const parsed = JSON.parse(String(reader.result)); data = normalize(parsed); save(); renderAll(); alert('가져오기 완료'); }
    catch(err){ alert('JSON 파싱 오류: '+err.message); }
  };
  reader.readAsText(file);
  e.target.value = '';
});
seedBtn.addEventListener('click', ()=>{
  if(confirm('샘플 데이터로 초기화할까요? 기존 데이터는 덮어씁니다.')){ data = structuredClone(sample); save(); renderAll(); }
});
clearBtn.addEventListener('click', ()=>{
  if(confirm('모든 데이터를 삭제할까요?')){ data = { recommended:[], packages:[], specials:[] }; save(); renderAll(); }
});

// ========= 초기 렌더 =========
renderAll();
