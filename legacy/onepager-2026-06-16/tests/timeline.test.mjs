import assert from "node:assert/strict";
import {
  clamp,
  ageMaToPosition,
  positionToAgeMa,
  findNearestStage,
  formatAgeRu,
  sortStagesOldestFirst
} from "../lib/timeline.js";

const sampleStages = [
  { id: "sapiens", ageMa: 0.3 },
  { id: "tiktaalik", ageMa: 375 },
  { id: "eukaryotes", ageMa: 1800 },
  { id: "early-life", ageMa: 3800 }
];

assert.equal(clamp(-1, 0, 1), 0);
assert.equal(clamp(2, 0, 1), 1);
assert.equal(clamp(0.4, 0, 1), 0.4);

assert.equal(sortStagesOldestFirst(sampleStages)[0].id, "early-life");
assert.equal(sortStagesOldestFirst(sampleStages).at(-1).id, "sapiens");

const oldPosition = ageMaToPosition(3800, { minMa: 0.01, maxMa: 4000 });
const recentPosition = ageMaToPosition(0.3, { minMa: 0.01, maxMa: 4000 });
assert.ok(oldPosition < recentPosition, "older stages must render further left than recent stages");

const roundTrip = positionToAgeMa(ageMaToPosition(375, { minMa: 0.01, maxMa: 4000 }), {
  minMa: 0.01,
  maxMa: 4000
});
assert.ok(Math.abs(roundTrip - 375) < 0.0001);

assert.equal(findNearestStage(sampleStages, 0, { minMa: 0.01, maxMa: 4000 }).id, "early-life");
assert.equal(findNearestStage(sampleStages, 1, { minMa: 0.01, maxMa: 4000 }).id, "sapiens");
assert.equal(formatAgeRu(3800), "3,8 млрд лет назад");
assert.equal(formatAgeRu(0.12), "120 тыс. лет назад");

console.log("timeline tests passed");
