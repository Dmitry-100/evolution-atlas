import assert from "node:assert/strict";
import { STAGES, ERAS } from "../data/lineage.js";

assert.ok(Array.isArray(STAGES), "STAGES must be an array");
assert.ok(STAGES.length >= 28, "first release must include at least 28 stages");
assert.ok(Array.isArray(ERAS), "ERAS must be an array");

const ids = new Set();
for (const stage of STAGES) {
  assert.equal(typeof stage.id, "string", "stage id must be a string");
  assert.ok(!ids.has(stage.id), `duplicate id: ${stage.id}`);
  ids.add(stage.id);
  assert.equal(typeof stage.title, "string", `${stage.id} title`);
  assert.equal(typeof stage.ageMa, "number", `${stage.id} ageMa`);
  assert.ok(stage.ageMa >= 0, `${stage.id} ageMa must be non-negative`);
  assert.equal(typeof stage.summary, "string", `${stage.id} summary`);
  assert.equal(typeof stage.inherited, "string", `${stage.id} inherited`);
  assert.equal(typeof stage.framing, "string", `${stage.id} framing`);
  assert.ok(["representative", "stem-form", "close-relative", "direct-lineage", "side-branch"].includes(stage.framing), `${stage.id} framing must be explicit`);
  assert.equal(typeof stage.image.alt, "string", `${stage.id} image alt`);
  assert.equal(typeof stage.image.credit, "string", `${stage.id} image credit`);
  const hasImageCandidate = stage.image.src || (Array.isArray(stage.image.remoteFallbacks) && stage.image.remoteFallbacks.length > 0);
  assert.ok(hasImageCandidate || stage.image.localFallback === true, `${stage.id} must include an image source, remote fallback, or explicit localFallback`);
  if (stage.image.localFallback === true) {
    assert.ok(stage.image.alt.length > 10, `${stage.id} local fallback needs descriptive alt text`);
  }
  assert.ok(Array.isArray(stage.sources), `${stage.id} sources must be an array`);
  assert.ok(stage.sources.length > 0, `${stage.id} must include at least one source`);
}

assert.ok(STAGES.some((stage) => stage.id === "early-apes"), "must include the answer to where apes came from");
assert.ok(STAGES.some((stage) => stage.framing === "side-branch"), "must include at least one side branch");

console.log("data smoke tests passed");
