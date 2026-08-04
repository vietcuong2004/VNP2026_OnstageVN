const TALENT_PRESETS = [
  "KOL livestream",
  "KOC beauty",
  "MC sự kiện",
  "Người mẫu ảnh",
  "PG event",
  "Thời trang",
  "Beauty",
  "Catwalk",
];

const JOB_PRESETS = [
  "KOL livestream",
  "Livestream Hà Nội",
  "KOL thời trang",
  "PG event",
  "MC sự kiện",
  "Beauty campaign",
  "Job cát-xê 1-2 triệu",
  "Đang tuyển gấp",
];

const TALENT_TYPE_ALIASES = new Map([
  ["model", "Người mẫu"],
  ["người mẫu", "Người mẫu"],
  ["nguoi mau", "Người mẫu"],
  ["actor", "Diễn viên"],
  ["diễn viên", "Diễn viên"],
  ["dien vien", "Diễn viên"],
  ["kol", "KOL"],
  ["kols", "KOL"],
  ["koc", "KOC"],
  ["kocs", "KOC"],
  ["livestreamer", "Livestreamer"],
  ["mc", "MC"],
  ["pg", "PG/PB"],
  ["pb", "PG/PB"],
  ["pg/pb", "PG/PB"],
  ["pageant", "Hoa hậu"],
  ["hoa hậu", "Hoa hậu"],
  ["hoa hau", "Hoa hậu"],
]);

export function normalizeSuggestionText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll(String.fromCharCode(273), "d")
    .replaceAll(String.fromCharCode(272), "D")
    .toLowerCase()
    .trim();
}

function compactLabel(value) {
  return String(value || "")
    .replace(/^(tỉnh|thành phố|tp\.?|city)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTalentTypeLabel(value) {
  const label = compactLabel(value);
  const normalized = normalizeSuggestionText(label);
  return TALENT_TYPE_ALIASES.get(normalized) || label;
}

function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // keep delimiter split below
    }
    return value.split(/[,;/|]/).map((item) => item.trim()).filter(Boolean);
  }
  return [value];
}

function optionLabel(value) {
  if (!value) return "";
  if (typeof value === "string") return compactLabel(value);
  return compactLabel(value.name || value.title || value.label || value.value || "");
}

function addCount(map, label, payload = {}) {
  const normalizedLabel = compactLabel(label);
  if (!normalizedLabel) return;
  const key = normalizeSuggestionText(normalizedLabel);
  if (!key) return;
  const current = map.get(key) || { label: normalizedLabel, count: 0, searchQuery: normalizedLabel, ...payload };
  current.count += 1;
  map.set(key, current);
}

function toSuggestions(map, unitLabel, query, limit, isPartial) {
  const normalizedQuery = normalizeSuggestionText(query);
  return [...map.values()]
    .filter((item) => !normalizedQuery || normalizeSuggestionText(item.label).includes(normalizedQuery))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "vi"))
    .slice(0, limit)
    .map((item) => ({
      ...item,
      query: item.query || item.label,
      searchQuery: item.searchQuery ?? item.query ?? item.label,
      meta: `${item.count + 10}+ ${unitLabel}`,
    }));
}

function fallbackSuggestions(presets, query, limit) {
  const normalizedQuery = normalizeSuggestionText(query);
  return presets
    .filter((label) => !normalizedQuery || normalizeSuggestionText(label).includes(normalizedQuery))
    .slice(0, limit)
    .map((label) => ({ label, query: label, searchQuery: label, meta: "Gợi ý" }));
}

function getTalentTypes(talent) {
  const raw = talent?.talentTypes || talent?.talent_types || talent?.categories || talent?.categoryNames || talent?.types;
  return asArray(raw).map(optionLabel).map(normalizeTalentTypeLabel).filter(Boolean);
}

function getTalentSkills(talent) {
  const raw = talent?.skills || talent?.skillNames || talent?.specialties || talent?.fields || talent?.tags;
  return asArray(raw).map(optionLabel).filter(Boolean);
}

function getTalentCity(talent) {
  return compactLabel(talent?.city || talent?.location || talent?.province || talent?.address || "");
}

/**
 * @param {{ talents?: any[], query?: string, limit?: number, isPartial?: boolean }} options
 * @returns {Array<{ label: string, query: string, searchQuery: string, meta: string, count?: number, type?: string, city?: string }>}
 */
export function buildTalentSearchSuggestions({ talents = [], query = "", limit = 7, isPartial = false } = {}) {
  const typeCounts = new Map();
  const comboCounts = new Map();
  const skillCounts = new Map();

  for (const talent of talents) {
    const city = getTalentCity(talent);
    const types = getTalentTypes(talent);
    const skills = getTalentSkills(talent);

    for (const type of types) {
      addCount(typeCounts, type, { type, searchQuery: "", meta: "Loại hình Idol" });
      if (city) addCount(comboCounts, `${type} ${city}`, { type, city, searchQuery: "", meta: "Theo khu vực" });
    }

    for (const skill of skills) addCount(skillCounts, skill, { meta: "Kỹ năng / lĩnh vực" });
  }

  const suggestions = [
    ...toSuggestions(typeCounts, "hồ sơ", query, limit, isPartial),
    ...toSuggestions(comboCounts, "hồ sơ", query, limit, isPartial),
    ...toSuggestions(skillCounts, "hồ sơ", query, limit, isPartial),
  ];

  const seen = new Set();
  const unique = suggestions.filter((item) => {
    const key = normalizeSuggestionText(item.label);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);

  if (unique.length >= Math.min(3, limit)) return unique;

  return [...unique, ...fallbackSuggestions(TALENT_PRESETS, query, limit)]
    .filter((item) => {
      const key = normalizeSuggestionText(item.label);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

function getJobType(job) {
  return compactLabel(job?.type || job?.jobType || job?.campaignType || job?.category || "");
}

function getJobCity(job) {
  return compactLabel(job?.city || job?.location || job?.province || "");
}

function getJobTitle(job) {
  return compactLabel(job?.title || job?.name || "");
}

function getJobBrand(job) {
  if (typeof job?.brand === "string") return compactLabel(job.brand);
  return compactLabel(job?.brandName || job?.brand?.name || job?.companyName || "");
}

/**
 * @param {{ jobs?: any[], query?: string, limit?: number, isPartial?: boolean }} options
 * @returns {Array<{ label: string, query: string, searchQuery: string, meta: string, count?: number, type?: string, city?: string }>}
 */
export function buildJobSearchSuggestions({ jobs = [], query = "", limit = 7, isPartial = false } = {}) {
  const typeCounts = new Map();
  const comboCounts = new Map();
  const titleCounts = new Map();
  const brandCounts = new Map();

  for (const job of jobs) {
    const type = getJobType(job);
    const city = getJobCity(job);
    const title = getJobTitle(job);
    const brand = getJobBrand(job);

    addCount(typeCounts, type, { type, searchQuery: "", meta: "Loại hình việc làm" });
    if (type && city) addCount(comboCounts, `${type} ${city}`, { type, city, searchQuery: "", meta: "Theo khu vực" });
    addCount(titleCounts, title, { meta: "Tên việc làm" });
    addCount(brandCounts, brand, { meta: "Brand" });
  }

  const suggestions = [
    ...toSuggestions(typeCounts, "việc làm", query, limit, isPartial),
    ...toSuggestions(comboCounts, "việc làm", query, limit, isPartial),
    ...toSuggestions(titleCounts, "việc làm", query, limit, isPartial),
    ...toSuggestions(brandCounts, "việc làm", query, limit, isPartial),
  ];

  const seen = new Set();
  const unique = suggestions.filter((item) => {
    const key = normalizeSuggestionText(item.label);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);

  if (unique.length >= Math.min(3, limit)) return unique;

  return [...unique, ...fallbackSuggestions(JOB_PRESETS, query, limit)]
    .filter((item) => {
      const key = normalizeSuggestionText(item.label);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}
