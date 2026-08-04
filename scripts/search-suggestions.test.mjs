import assert from "node:assert/strict";
import {
  buildJobSearchSuggestions,
  buildTalentSearchSuggestions,
} from "../lib/search-suggestions.mjs";

const talents = [
  { name: "Mai Anh", skills: ["livestream", "beauty"], city: "Hà Nội", talentTypes: ["KOL"] },
  { name: "Bao Linh", skills: ["catwalk", "fashion"], city: "Hà Nội", talentTypes: ["Model"] },
  { name: "Minh Châu", skills: ["livestream"], city: "Hồ Chí Minh", talentTypes: ["KOL"] },
];

const talentSuggestions = buildTalentSearchSuggestions({ talents, query: "kol", limit: 6, isPartial: true });
assert.equal(talentSuggestions[0].label, "KOL");
assert.equal(talentSuggestions[0].count, 2);
assert.equal(talentSuggestions[0].meta, "12+ hồ sơ");
assert.ok(!talentSuggestions.some((item) => item.meta.includes("online")));
const talentTypeSuggestion = talentSuggestions.find((item) => item.label === "KOL");
assert.equal(talentTypeSuggestion.searchQuery, "");

const talentComboSuggestion = talentSuggestions.find((item) => item.label === "KOL Hà Nội");
assert.ok(talentComboSuggestion);
assert.equal(talentComboSuggestion.searchQuery, "");
assert.equal(talentComboSuggestion.type, "KOL");
assert.equal(talentComboSuggestion.city, "Hà Nội");

const jobs = [
  { title: "Tuyển KOL livestream Hà Nội", city: "Hà Nội", type: "KOL livestream", brandName: "Onstage" },
  { title: "MC sự kiện khai trương", city: "Đà Nẵng", type: "MC sự kiện", brand: "Beauty" },
  { title: "PG event Hồ Chí Minh", city: "Hồ Chí Minh", jobType: "PG event", brandName: "Mall" },
];

const jobSuggestions = buildJobSearchSuggestions({ jobs, query: "kol", limit: 6, isPartial: true });
assert.equal(jobSuggestions[0].label, "KOL livestream");
assert.equal(jobSuggestions[0].count, 1);
assert.equal(jobSuggestions[0].meta, "11+ việc làm");
const jobTypeSuggestion = jobSuggestions.find((item) => item.label === "KOL livestream");
assert.equal(jobTypeSuggestion.searchQuery, "");

const jobComboSuggestion = jobSuggestions.find((item) => item.label === "KOL livestream Hà Nội");
assert.ok(jobComboSuggestion);
assert.equal(jobComboSuggestion.searchQuery, "");
assert.equal(jobComboSuggestion.type, "KOL livestream");
assert.equal(jobComboSuggestion.city, "Hà Nội");

const exactTalentSuggestions = buildTalentSearchSuggestions({ talents, query: "kol", limit: 6, isPartial: false });
assert.equal(exactTalentSuggestions[0].meta, "12+ hồ sơ");

const fallbackSuggestions = buildJobSearchSuggestions({ jobs: [], query: "", limit: 3 });
assert.equal(fallbackSuggestions.length, 3);
assert.equal(fallbackSuggestions[0].label, "KOL livestream");

console.log("search suggestions tests passed");
