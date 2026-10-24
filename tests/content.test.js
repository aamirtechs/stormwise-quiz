const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const content = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "content.json"), "utf8"));

test("app has title and intro", () => {
  assert.ok(content.appTitle && content.appTitle.length > 2);
  assert.ok(content.intro && content.intro.length > 10);
});

test("exactly three scenarios: flooding, heatwaves, thunderstorms", () => {
  assert.strictEqual(content.scenarios.length, 3);
  assert.deepStrictEqual(content.scenarios.map((s) => s.id), ["flooding", "heatwaves", "thunderstorms"]);
});

test("each scenario has exactly three well-formed questions", () => {
  for (const sc of content.scenarios) {
    assert.ok(sc.title && sc.tagline, sc.id);
    assert.ok(sc.source && sc.source.label && sc.source.url.startsWith("https://"), sc.id);
    assert.strictEqual(sc.questions.length, 3, sc.id);
    for (const q of sc.questions) {
      assert.ok(q.question.length > 10, sc.id);
      assert.ok(Array.isArray(q.options) && q.options.length >= 3, sc.id);
      assert.strictEqual(new Set(q.options).size, q.options.length, "options must be unique: " + sc.id);
      assert.ok(Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < q.options.length, sc.id);
      assert.ok(q.explanation && q.explanation.length > 20, sc.id);
      assert.ok(q.source && q.source.label && q.source.url.startsWith("https://"), sc.id);
    }
  }
});

test("fallback content matches content.json", () => {
  const fb = fs.readFileSync(path.join(__dirname, "..", "content-fallback.js"), "utf8");
  const parsed = JSON.parse(fb.replace(/^window\.STORMWISE_CONTENT = /, "").replace(/;\s*$/, ""));
  assert.deepStrictEqual(parsed, content);
});
