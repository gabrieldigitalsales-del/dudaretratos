const LOCAL_KEY = "dudaretratos_site_cache_v1";

function supabaseReady() {
  return Boolean(
    window.supabase &&
    typeof SUPABASE_URL === "string" &&
    typeof SUPABASE_ANON_KEY === "string" &&
    SUPABASE_URL.startsWith("http") &&
    SUPABASE_ANON_KEY.length > 20
  );
}

function getClient() {
  if (!supabaseReady()) return null;
  if (!window.dudaSupabaseClient) {
    window.dudaSupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return window.dudaSupabaseClient;
}

function mergeSite(base, incoming) {
  const content = incoming && typeof incoming === "object" ? incoming : {};
  return {
    ...base,
    ...content,
    categories: Array.isArray(content.categories) ? content.categories : base.categories,
  };
}

function localLoad() {
  try {
    const cached = JSON.parse(localStorage.getItem(LOCAL_KEY));
    return mergeSite(DEFAULT_SITE, cached);
  } catch (err) {
    return DEFAULT_SITE;
  }
}

function localSave(site) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(site));
}

async function loadSiteData() {
  const client = getClient();
  if (!client) return localLoad();

  const { data, error } = await client
    .from(SUPABASE_TABLE)
    .select("content")
    .eq("id", SUPABASE_ROW_ID)
    .maybeSingle();

  if (error) {
    console.warn("Supabase indisponível, usando cache local:", error.message);
    return localLoad();
  }

  const site = mergeSite(DEFAULT_SITE, data && data.content);
  localSave(site);
  return site;
}

async function saveSiteData(site) {
  localSave(site);
  const client = getClient();
  if (!client) return { localOnly: true };

  const { error } = await client
    .from(SUPABASE_TABLE)
    .upsert({ id: SUPABASE_ROW_ID, content: site, updated_at: new Date().toISOString() });

  if (error) throw error;
  return { localOnly: false };
}

function sanitizeSlug(value) {
  return String(value || "arquivo")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "arquivo";
}

function uniqueDudaFileName(area, originalName) {
  const ext = String(originalName || "jpg").split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const safeArea = sanitizeSlug(area);
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 9);
  return `dudaretratos-${safeArea}-${stamp}-${rand}.${ext}`;
}

async function uploadImageToSupabase(file, area) {
  const client = getClient();
  if (!client) return readFileAsDataURL(file);

  const path = `${sanitizeSlug(area)}/${uniqueDudaFileName(area, file.name)}`;
  const { error } = await client.storage
    .from(SUPABASE_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = client.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}
