import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.ok(html.includes("<style>"), "index.html should include inline CSS for file:// use");
assert.ok(html.includes("<script>"), "index.html should include inline JS for file:// use");
assert.ok(!html.includes('type="module"'), "index.html must not depend on ES modules");
assert.ok(!html.includes('rel="stylesheet"'), "index.html must not depend on external CSS");
assert.ok(!html.includes('rel="manifest"'), "index.html must not require a service worker manifest");
assert.ok(!html.includes("navigator.serviceWorker"), "index.html must not require service worker registration");
assert.ok(html.includes("const STAGES = ["), "index.html should embed timeline data");
assert.ok((html.match(/id: "/g) || []).length >= 30, "index.html should embed the full stage set");
assert.ok(html.includes("data-plate-image"), "active stage card should expose a dynamic image target");
assert.ok(html.includes("const STAGE_VISUALS = {"), "index.html should embed stage visual mappings");
assert.ok(html.includes("stage-plates/"), "index.html should reference the local stage plate directory");
assert.ok((html.match(/plate\("/g) || []).length >= 25, "index.html should map stages to the local plate set");

console.log("standalone html tests passed");
