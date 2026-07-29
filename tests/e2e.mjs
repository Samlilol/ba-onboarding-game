import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000/";
const executablePath =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const browser = await chromium.launch({
  executablePath,
  headless: true,
});

async function completeRun(page, optionIndex) {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Start first day/i }).click();

  for (let stage = 1; stage <= 18; stage += 1) {
    await page.locator(".option").nth(optionIndex).click();
    await page.getByText("Manager feedback", { exact: true }).waitFor();
    await page.getByText("What you did well", { exact: true }).waitFor();
    await page.getByText("How to improve", { exact: true }).waitFor();
    await page
      .getByRole("button", { name: /Continue to artifact exercise/i })
      .click();
    await page.locator(".scenario__phase", { hasText: "Artifact lab" }).waitFor();
    await page.locator(".artifact-option").nth(optionIndex).click();
    await page.getByText("Artifact review", { exact: true }).waitFor();
    await page.getByText("Model artifact", { exact: true }).waitFor();
    await page
      .getByRole("button", {
        name: stage === 18 ? /See final outcome/i : /Next stage/i,
      })
      .click();
  }
}

try {
  const strongContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const strongPage = await strongContext.newPage();

  await strongPage.goto(baseURL, { waitUntil: "networkidle" });
  assert.equal(await strongPage.locator("h1").first().innerText(), "Contract to Core");
  await strongPage.getByRole("button", { name: /Start first day/i }).click();
  await strongPage.getByRole("button", { name: /Show hint/i }).click();
  assert.match(
    await strongPage.getByText("Think like a senior BA", { exact: true }).innerText(),
    /Think like a senior BA/,
  );

  for (let stage = 1; stage <= 18; stage += 1) {
    await strongPage.locator(".option").first().click();
    await strongPage.getByText("Manager feedback", { exact: true }).waitFor();
    await strongPage.getByText("What you did well", { exact: true }).waitFor();
    await strongPage.getByText("How to improve", { exact: true }).waitFor();
    await strongPage
      .getByRole("button", { name: /Continue to artifact exercise/i })
      .click();
    await strongPage.locator(".scenario__phase", { hasText: "Artifact lab" }).waitFor();
    const correctArtifact = strongPage.locator(".artifact-option[data-correct='true']");
    await correctArtifact.click();
    await strongPage.getByText("Artifact review", { exact: true }).waitFor();
    await strongPage.getByText("Model artifact", { exact: true }).waitFor();
    await strongPage
      .getByRole("button", {
        name: stage === 18 ? /See final outcome/i : /Next stage/i,
      })
      .click();
  }

  assert.match(
    await strongPage.locator(".outcome-stamp").innerText(),
    /Permanent offer/i,
  );
  assert.match(await strongPage.locator(".artifact-score").innerText(), /18\/18/);
  await strongPage.getByRole("button", { name: /Review decisions/i }).click();
  assert.equal(await strongPage.locator(".review__list details").count(), 18);
  await strongPage.reload({ waitUntil: "networkidle" });
  await strongPage.getByRole("button", { name: /Continue saved game/i }).waitFor();
  await strongContext.close();

  const weakContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const weakPage = await weakContext.newPage();
  await completeRun(weakPage, 3);
  assert.match(
    await weakPage.locator(".outcome-stamp").innerText(),
    /Contract concludes/i,
  );
  assert.ok(
    await weakPage.getByRole("button", { name: /Review decisions/i }).isVisible(),
  );
  assert.ok((await weakPage.evaluate(() => document.body.scrollWidth)) <= 390);
  await weakContext.close();

  console.log("E2E passed: strong, saved-run, weak, feedback, and mobile paths.");
} finally {
  await browser.close();
}
