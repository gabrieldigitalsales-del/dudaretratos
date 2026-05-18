const KEY = "m_fotografia_site_v2";
const $ = (s) => document.querySelector(s);
function loadSite(){ try { return JSON.parse(localStorage.getItem(KEY)) || DEFAULT_SITE; } catch { return DEFAULT_SITE; } }
function wa(num, msg){ return `https://wa.me/${num}?text=${encodeURIComponent(msg || "Olá! Vim pelo site e quero fazer um orçamento.")}`; }
function imgTag(src, alt){ return `<img src="${src}" alt="${alt || ''}" loading="lazy">`; }
let site = loadSite();
function render(){
  site = loadSite();
  $("#heroImage").src = site.heroImage;
  $("#brandInitial").textContent = site.brandInitial;
  $("#brandName").textContent = site.brandName;
  $("#aboutText").textContent = site.aboutText;
  $("#aboutImage").src = site.aboutImage;
  $("#footerText").textContent = site.footer;
  ["#whatsTop","#whatsBottom","#aboutBtn","#budgetNav"].forEach(id => $(id).href = wa(site.whatsapp));
  ["#instaTop","#instaBottom"].forEach(id => $(id).href = site.instagram);
  ["#emailTop","#emailBottom"].forEach(id => $(id).href = `mailto:${site.email}`);
  $("#locBottom").href = site.location || "#";
  renderGrid("ensaios", "#ensaiosGrid");
  renderGrid("eventos", "#eventosGrid");
}
function renderGrid(group, target){
  const items = site.categories.filter(c => c.group === group);
  $(target).innerHTML = items.map(c => `<button class="card" data-id="${c.id}">${imgTag(c.cover,c.title)}<span>${c.title}</span></button>`).join("");
  document.querySelectorAll(`${target} .card`).forEach(btn => btn.onclick = () => openCategory(btn.dataset.id));
}
function openCategory(id){
  const c = site.categories.find(x => x.id === id); if(!c) return;
  $("#modalTitle").textContent = c.title;
  $("#modalDesc").textContent = c.description || "";
  $("#modalGallery").innerHTML = (c.images || []).map((src,i) => `<figure class="${i===0?'big':''}">${imgTag(src,c.title)}</figure>`).join("");
  $("#modalBudget").href = wa(site.whatsapp, `Olá! Quero fazer um orçamento para ${c.title}.`);
  $("#modal").classList.add("open");
}
$("#closeModal").onclick = () => $("#modal").classList.remove("open");
$("#modal").onclick = (e) => { if(e.target.id === "modal") $("#modal").classList.remove("open"); };
$("#menuBtn").onclick = () => $("#menu").classList.toggle("open");
render();
