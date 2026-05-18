const KEY = "m_fotografia_site_v2";
const PASS = "asd123";
const $ = (s) => document.querySelector(s);
const uid = () => Math.random().toString(36).slice(2,9);
function loadSite(){ try { return JSON.parse(localStorage.getItem(KEY)) || DEFAULT_SITE; } catch { return DEFAULT_SITE; } }
function saveSite(v){ localStorage.setItem(KEY, JSON.stringify(v)); }
function fileToData(input){ return new Promise(resolve => { const f = input.files && input.files[0]; if(!f) return resolve(null); const r = new FileReader(); r.onload = () => resolve(r.result); r.readAsDataURL(f); }); }
let site = loadSite();
$("#enter").onclick = () => { if($("#pass").value === PASS){ $("#login").classList.add("hidden"); $("#panel").classList.remove("hidden"); fill(); } else alert("Senha incorreta"); };
$("#pass").addEventListener("keydown", e => { if(e.key === "Enter") $("#enter").click(); });
function fill(){
  site = loadSite();
  ["brandInitial","brandName","whatsapp","instagram","email","location","footer","aboutText"].forEach(id => $("#"+id).value = site[id] || "");
  renderCats();
}
$("#saveMain").onclick = async () => {
  ["brandInitial","brandName","whatsapp","instagram","email","location","footer","aboutText"].forEach(id => site[id] = $("#"+id).value);
  const hero = await fileToData($("#heroImage")); if(hero) site.heroImage = hero;
  const about = await fileToData($("#aboutImage")); if(about) site.aboutImage = about;
  saveSite(site); alert("Salvo!");
};
function renderCats(){
  $("#categories").innerHTML = site.categories.map((c,idx) => `
    <div class="cat" data-i="${idx}">
      <div class="cat-grid">
        <label>Nome<input class="ctitle" value="${esc(c.title)}"></label>
        <label>Grupo<select class="cgroup"><option value="ensaios" ${c.group==='ensaios'?'selected':''}>Ensaios</option><option value="eventos" ${c.group==='eventos'?'selected':''}>Eventos</option></select></label>
        <label>Descrição<textarea class="cdesc">${esc(c.description || '')}</textarea></label>
        <label>Capa<input class="ccover" type="file" accept="image/*"></label>
      </div>
      <div class="imgs">${(c.images||[]).map((src,j)=>`<div class="thumb"><img src="${src}"><button class="removeImg danger" data-j="${j}">Remover</button></div>`).join('')}</div>
      <label>Adicionar foto à galeria<input class="addImg" type="file" accept="image/*" multiple></label>
      <button class="removeCat danger">Remover categoria</button>
    </div>`).join("");
  document.querySelectorAll(".removeCat").forEach(btn => btn.onclick = () => { const i = +btn.closest('.cat').dataset.i; if(confirm('Remover categoria?')){ site.categories.splice(i,1); renderCats(); } });
  document.querySelectorAll(".removeImg").forEach(btn => btn.onclick = () => { const cat = btn.closest('.cat'); const i = +cat.dataset.i; const j = +btn.dataset.j; site.categories[i].images.splice(j,1); renderCats(); });
}
function esc(s){ return String(s||'').replace(/[&<>\"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
async function syncCatsFromDom(){
  const cats = Array.from(document.querySelectorAll('.cat'));
  for(const cat of cats){
    const i = +cat.dataset.i; const c = site.categories[i];
    c.title = cat.querySelector('.ctitle').value;
    c.id = c.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') || uid();
    c.group = cat.querySelector('.cgroup').value;
    c.description = cat.querySelector('.cdesc').value;
    const cover = await fileToData(cat.querySelector('.ccover')); if(cover) c.cover = cover;
    const input = cat.querySelector('.addImg');
    if(input.files && input.files.length){
      for(const f of input.files){ const data = await new Promise(res => { const r = new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(f); }); c.images.push(data); }
      if(!c.cover && c.images[0]) c.cover = c.images[0];
    }
  }
}
$("#saveCats").onclick = async () => { await syncCatsFromDom(); saveSite(site); alert("Categorias salvas!"); renderCats(); };
$("#addCategory").onclick = () => { site.categories.push({id:uid(),group:'ensaios',title:'NOVA CATEGORIA',cover:'assets/images/placeholder/photo.svg',description:'',images:[]}); renderCats(); };
$("#reset").onclick = () => { if(confirm('Restaurar padrão e apagar edições locais?')){ localStorage.removeItem(KEY); site = loadSite(); fill(); } };
