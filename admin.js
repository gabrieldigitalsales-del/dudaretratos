const $ = (s) => document.querySelector(s);
const uid = () => Math.random().toString(36).slice(2,9);
let site = DEFAULT_SITE;

function esc(s){ return String(s||'').replace(/[&<>\"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
function status(msg){ $("#status").textContent = msg; }
function slugifyTitle(value){ return sanitizeSlug(value || uid()); }

$("#enter").onclick = async () => {
  if($("#pass").value !== ADMIN_PASSWORD){ alert("Senha incorreta"); return; }
  $("#login").classList.add("hidden");
  $("#panel").classList.remove("hidden");
  status(supabaseReady() ? "Supabase conectado. Alterações serão salvas para todos." : "Supabase ainda não configurado. Salvando apenas neste navegador.");
  site = await loadSiteData();
  fill();
};
$("#pass").addEventListener("keydown", e => { if(e.key === "Enter") $("#enter").click(); });

function fill(){
  ["brandInitial","brandName","whatsapp","instagram","email","location","footer","aboutText"].forEach(id => $("#"+id).value = site[id] || "");
  renderCats();
}

$("#saveMain").onclick = async () => {
  try {
    status("Salvando dados principais...");
    ["brandInitial","brandName","whatsapp","instagram","email","location","footer","aboutText"].forEach(id => site[id] = $("#"+id).value);
    const heroFile = $("#heroImage").files && $("#heroImage").files[0];
    if(heroFile) site.heroImage = await uploadImageToSupabase(heroFile, "principal");
    const aboutFile = $("#aboutImage").files && $("#aboutImage").files[0];
    if(aboutFile) site.aboutImage = await uploadImageToSupabase(aboutFile, "sobre-mim");
    const result = await saveSiteData(site);
    status(result.localOnly ? "Salvo localmente. Configure Supabase para aparecer para todos." : "Salvo no Supabase. Já aparece para todos.");
    alert("Salvo!");
  } catch (err) {
    console.error(err);
    status("Erro ao salvar: " + err.message);
    alert("Erro ao salvar: " + err.message);
  }
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
      <label>Adicionar fotos à galeria<input class="addImg" type="file" accept="image/*" multiple></label>
      <button class="removeCat danger">Remover categoria</button>
    </div>`).join("");

  document.querySelectorAll(".removeCat").forEach(btn => btn.onclick = () => {
    const i = +btn.closest('.cat').dataset.i;
    if(confirm('Remover categoria?')){ site.categories.splice(i,1); renderCats(); }
  });
  document.querySelectorAll(".removeImg").forEach(btn => btn.onclick = () => {
    const cat = btn.closest('.cat');
    const i = +cat.dataset.i;
    const j = +btn.dataset.j;
    site.categories[i].images.splice(j,1);
    renderCats();
  });
}

async function syncCatsFromDom(){
  const cats = Array.from(document.querySelectorAll('.cat'));
  for(const cat of cats){
    const i = +cat.dataset.i;
    const c = site.categories[i];
    c.title = cat.querySelector('.ctitle').value;
    c.id = slugifyTitle(c.title);
    c.group = cat.querySelector('.cgroup').value;
    c.description = cat.querySelector('.cdesc').value;

    const coverFile = cat.querySelector('.ccover').files && cat.querySelector('.ccover').files[0];
    if(coverFile) c.cover = await uploadImageToSupabase(coverFile, `${c.id}-capa`);

    const input = cat.querySelector('.addImg');
    if(input.files && input.files.length){
      for(const file of input.files){
        const url = await uploadImageToSupabase(file, c.id);
        c.images.push(url);
      }
      if((!c.cover || c.cover.includes('placeholder')) && c.images[0]) c.cover = c.images[0];
    }
  }
}

$("#saveCats").onclick = async () => {
  try {
    status("Enviando fotos e salvando categorias...");
    await syncCatsFromDom();
    const result = await saveSiteData(site);
    status(result.localOnly ? "Categorias salvas localmente. Configure Supabase para aparecer para todos." : "Categorias salvas no Supabase. Já aparece para todos.");
    alert("Categorias salvas!");
    renderCats();
  } catch (err) {
    console.error(err);
    status("Erro ao salvar categorias: " + err.message);
    alert("Erro ao salvar categorias: " + err.message);
  }
};

$("#addCategory").onclick = () => {
  site.categories.push({id:uid(),group:'ensaios',title:'NOVA CATEGORIA',cover:'assets/images/placeholder/dudaretratos-placeholder.svg',description:'',images:[]});
  renderCats();
};

$("#reset").onclick = async () => {
  if(!confirm('Restaurar padrão? Isso vai substituir os textos/fotos salvos.')) return;
  site = JSON.parse(JSON.stringify(DEFAULT_SITE));
  await saveSiteData(site);
  fill();
  status("Padrão restaurado.");
};
