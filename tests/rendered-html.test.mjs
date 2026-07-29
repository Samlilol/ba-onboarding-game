import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the onboarding simulation introduction", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Contract to Core/);
  assert.match(html, /Your first year as an AI BA/i);
  assert.match(html, /18 workplace decisions/i);
  assert.match(html, /Start first day/i);
  assert.match(html, /learning simulation/i);
  assert.match(html, /not an AIA employment forecast/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
  assert.doesNotMatch(html, /react-loading-skeleton/i);
});

test("the product source includes accessible game, feedback, and persistence states", async () => {
  const [game, css, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/Game.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(game, /localStorage/);
  assert.match(game, /aria-live="polite"/);
  assert.match(game, /What you did well/);
  assert.match(game, /How to improve/);
  assert.match(game, /Manager feedback/);
  assert.match(game, /Review decisions/);
  assert.match(game, /Start over/);
  assert.match(game, /event\.key\.toUpperCase/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(max-width:\s*820px\)/);
  assert.match(layout, /Contract to Core/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
