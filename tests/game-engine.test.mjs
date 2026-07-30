import assert from "node:assert/strict";
import test from "node:test";

import {
  advanceToArtifact,
  applyChoice,
  applyArtifactChoice,
  advanceStage,
  createInitialState,
  determineOutcome,
  restoreState,
} from "../lib/game-engine.js";
import { STAGES } from "../lib/stages.js";

test("the simulation contains 18 complete stages with manager coaching", () => {
  assert.equal(STAGES.length, 18);

  for (const [index, stage] of STAGES.entries()) {
    assert.equal(stage.id, index + 1);
    assert.ok(stage.phase);
    assert.ok(stage.timeline);
    assert.ok(stage.title);
    assert.ok(stage.manager);
    assert.ok(stage.scenario.length >= 80);
    assert.ok(stage.question);
    assert.ok(stage.hint);
    assert.equal(stage.options.length, 4);
    assert.ok(stage.artifact.title);
    assert.ok(stage.artifact.type);
    assert.ok(stage.artifact.prompt.length >= 40);
    assert.ok(stage.artifact.hint);
    assert.equal(stage.artifact.options.length, 4);
    assert.equal(
      stage.artifact.options.filter((artifactOption) => artifactOption.correct).length,
      1,
    );
    assert.ok(stage.artifact.model.title);
    assert.ok(stage.artifact.model.sections.length >= 3);

    for (const option of stage.options) {
      assert.match(option.id, /^[ABCD]$/);
      assert.ok(option.text);
      assert.ok(option.feedback.assessment);
      assert.ok(option.feedback.consequence);
      assert.ok(option.feedback.didWell);
      assert.ok(option.feedback.improve);
      assert.ok(option.feedback.betterMove);
      assert.ok(option.feedback.mentalModel);
      assert.ok(Number.isInteger(option.chanceDelta));
      assert.ok(option.capabilityDeltas);
    }

    for (const artifactOption of stage.artifact.options) {
      assert.match(artifactOption.id, /^[ABCD]$/);
      assert.ok(artifactOption.text);
      assert.ok(artifactOption.feedback);
      assert.ok(Number.isInteger(artifactOption.chanceDelta));
      assert.ok(artifactOption.capabilityDeltas);
    }
  }
});

test("a new run starts at stage one with neutral capability signals", () => {
  const state = createInitialState();

  assert.equal(state.version, 2);
  assert.equal(state.currentStage, 1);
  assert.equal(state.currentPart, "scenario");
  assert.equal(state.permanentChance, 50);
  assert.deepEqual(state.selectedAnswers, {});
  assert.deepEqual(state.artifactAnswers, {});
  assert.equal(state.artifactCorrect, 0);
  assert.equal(state.artifactAttempts, 0);
  assert.deepEqual(state.hintsUsed, []);
  assert.deepEqual(state.severeFlags, []);
  assert.equal(state.completed, false);

  for (const value of Object.values(state.capabilities)) {
    assert.equal(value, 50);
  }
});

test("applying a choice updates the run once and clamps all scores", () => {
  const state = createInitialState();
  const oversizedChoice = {
    id: "A",
    chanceDelta: 80,
    capabilityDeltas: {
      reliability: 80,
      analysis: -90,
    },
  };

  const updated = applyChoice(state, 1, oversizedChoice);
  assert.equal(updated.permanentChance, 95);
  assert.equal(updated.capabilities.reliability, 100);
  assert.equal(updated.capabilities.analysis, 0);
  assert.equal(updated.selectedAnswers[1], "A");

  const duplicate = applyChoice(updated, 1, oversizedChoice);
  assert.deepEqual(duplicate, updated);
});

test("a stage requires its workplace decision before entering the artifact lab", () => {
  const initial = createInitialState();
  assert.deepEqual(advanceToArtifact(initial), initial);

  const decided = applyChoice(initial, 1, STAGES[0].options[0]);
  const artifactPart = advanceToArtifact(decided);
  assert.equal(artifactPart.currentPart, "artifact");
  assert.equal(artifactPart.currentStage, 1);
});

test("an artifact answer updates judgment once and is required to advance", () => {
  const scenarioDone = advanceToArtifact(
    applyChoice(createInitialState(), 1, STAGES[0].options[0]),
  );
  const correctChoice = STAGES[0].artifact.options.find((choice) => choice.correct);
  const answered = applyArtifactChoice(scenarioDone, 1, correctChoice);

  assert.equal(answered.artifactAnswers[1], correctChoice.id);
  assert.equal(answered.artifactCorrect, 1);
  assert.equal(answered.artifactAttempts, 1);

  const duplicate = applyArtifactChoice(answered, 1, correctChoice);
  assert.deepEqual(duplicate, answered);

  const advanced = advanceStage(answered, STAGES.length);
  assert.equal(advanced.currentStage, 2);
  assert.equal(advanced.currentPart, "scenario");

  const blocked = advanceStage(scenarioDone, STAGES.length);
  assert.deepEqual(blocked, scenarioDone);
});

test("severe flags can be added and explicitly recovered", () => {
  const state = createInitialState();
  const flagged = applyChoice(state, 1, {
    id: "D",
    chanceDelta: -8,
    capabilityDeltas: { risk: -10 },
    severeFlag: "privacy",
  });

  assert.deepEqual(flagged.severeFlags, ["privacy"]);

  const recovered = applyChoice(flagged, 2, {
    id: "A",
    chanceDelta: 4,
    capabilityDeltas: { risk: 6 },
    recoversFlag: "privacy",
  });

  assert.deepEqual(recovered.severeFlags, []);
  assert.deepEqual(recovered.recoveredFlags, ["privacy"]);
});

test("ending rules return permanent, contract-ended, and deterministic borderline outcomes", () => {
  const strong = {
    ...createInitialState(),
    permanentChance: 72,
  };
  assert.equal(determineOutcome(strong), "permanent");

  const weak = {
    ...createInitialState(),
    permanentChance: 38,
  };
  assert.equal(determineOutcome(weak), "contract-ended");

  const unsafe = {
    ...createInitialState(),
    permanentChance: 90,
    severeFlags: ["privacy", "hidden-critical-risk"],
  };
  assert.equal(determineOutcome(unsafe), "contract-ended");

  const borderlineStrong = {
    ...createInitialState(),
    permanentChance: 54,
    capabilities: {
      ...createInitialState().capabilities,
      reliability: 72,
      risk: 70,
      ownership: 66,
    },
    selectedAnswers: { 18: "A" },
  };
  assert.equal(determineOutcome(borderlineStrong), "permanent");

  const borderlineWeak = {
    ...borderlineStrong,
    capabilities: {
      ...borderlineStrong.capabilities,
      reliability: 42,
      risk: 46,
      ownership: 48,
    },
    selectedAnswers: { 18: "D" },
  };
  assert.equal(determineOutcome(borderlineWeak), "contract-ended");
});

test("saved state restores only when its shape and version are valid", () => {
  const valid = {
    ...createInitialState(),
    currentStage: 7,
    currentPart: "artifact",
    permanentChance: 61,
    selectedAnswers: { 1: "A" },
    artifactAnswers: { 1: "B" },
    artifactCorrect: 1,
    artifactAttempts: 1,
  };

  assert.deepEqual(restoreState(JSON.stringify(valid)), valid);
  assert.equal(restoreState("not-json"), null);
  assert.equal(restoreState(JSON.stringify({ version: 99 })), null);
  assert.equal(
    restoreState(
      JSON.stringify({
        ...valid,
        permanentChance: "high",
      }),
    ),
    null,
  );
});
