export const CAPABILITY_KEYS = [
  "reliability",
  "analysis",
  "collaboration",
  "risk",
  "ownership",
  "impact",
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function createInitialState() {
  return {
    version: 2,
    currentStage: 1,
    currentPart: "scenario",
    permanentChance: 50,
    capabilities: {
      reliability: 50,
      analysis: 50,
      collaboration: 50,
      risk: 50,
      ownership: 50,
      impact: 50,
    },
    selectedAnswers: {},
    artifactAnswers: {},
    artifactCorrect: 0,
    artifactAttempts: 0,
    hintsUsed: [],
    severeFlags: [],
    recoveredFlags: [],
    completed: false,
  };
}

function applyScoreDeltas(state, choice) {
  const capabilities = { ...state.capabilities };
  for (const [key, delta] of Object.entries(choice.capabilityDeltas ?? {})) {
    if (key in capabilities) {
      capabilities[key] = clamp(capabilities[key] + delta, 0, 100);
    }
  }

  return {
    permanentChance: clamp(
      state.permanentChance + choice.chanceDelta,
      5,
      95,
    ),
    capabilities,
  };
}

export function applyChoice(state, stageId, choice) {
  if (state.selectedAnswers[stageId]) {
    return state;
  }

  const scores = applyScoreDeltas(state, choice);

  let severeFlags = [...state.severeFlags];
  const recoveredFlags = [...state.recoveredFlags];

  if (choice.severeFlag && !severeFlags.includes(choice.severeFlag)) {
    severeFlags.push(choice.severeFlag);
  }

  if (choice.recoversFlag && severeFlags.includes(choice.recoversFlag)) {
    severeFlags = severeFlags.filter((flag) => flag !== choice.recoversFlag);
    if (!recoveredFlags.includes(choice.recoversFlag)) {
      recoveredFlags.push(choice.recoversFlag);
    }
  }

  return {
    ...state,
    ...scores,
    selectedAnswers: {
      ...state.selectedAnswers,
      [stageId]: choice.id,
    },
    severeFlags,
    recoveredFlags,
  };
}

export function advanceToArtifact(state) {
  if (
    state.currentPart !== "scenario" ||
    !state.selectedAnswers[state.currentStage]
  ) {
    return state;
  }

  return { ...state, currentPart: "artifact" };
}

export function applyArtifactChoice(state, stageId, choice) {
  if (
    state.currentPart !== "artifact" ||
    state.currentStage !== stageId ||
    state.artifactAnswers[stageId]
  ) {
    return state;
  }

  return {
    ...state,
    ...applyScoreDeltas(state, choice),
    artifactAnswers: {
      ...state.artifactAnswers,
      [stageId]: choice.id,
    },
    artifactCorrect: state.artifactCorrect + (choice.correct ? 1 : 0),
    artifactAttempts: state.artifactAttempts + 1,
  };
}

export function markHintUsed(state, stageId) {
  if (state.hintsUsed.includes(stageId)) {
    return state;
  }

  return {
    ...state,
    hintsUsed: [...state.hintsUsed, stageId],
  };
}

export function advanceStage(state, totalStages) {
  if (
    state.currentPart !== "artifact" ||
    !state.selectedAnswers[state.currentStage] ||
    !state.artifactAnswers[state.currentStage]
  ) {
    return state;
  }

  if (state.currentStage >= totalStages) {
    return { ...state, completed: true };
  }

  return {
    ...state,
    currentStage: state.currentStage + 1,
    currentPart: "scenario",
  };
}

export function determineOutcome(state) {
  if (state.severeFlags.length >= 2) {
    return "contract-ended";
  }

  if (state.permanentChance >= 65) {
    return "permanent";
  }

  if (state.permanentChance < 45) {
    return "contract-ended";
  }

  const trustScore =
    state.capabilities.reliability * 0.4 +
    state.capabilities.risk * 0.35 +
    state.capabilities.ownership * 0.25;
  const finalConversationStrong = ["A", "B"].includes(
    state.selectedAnswers[18],
  );

  return trustScore >= 60 && finalConversationStrong
    ? "permanent"
    : "contract-ended";
}

function isCapabilitySet(value) {
  return (
    value &&
    typeof value === "object" &&
    CAPABILITY_KEYS.every(
      (key) =>
        typeof value[key] === "number" &&
        value[key] >= 0 &&
        value[key] <= 100,
    )
  );
}

export function restoreState(rawState) {
  try {
    const parsed = JSON.parse(rawState);
    if (
      parsed?.version !== 2 ||
      typeof parsed.currentStage !== "number" ||
      parsed.currentStage < 1 ||
      parsed.currentStage > 18 ||
      !["scenario", "artifact"].includes(parsed.currentPart) ||
      typeof parsed.permanentChance !== "number" ||
      parsed.permanentChance < 5 ||
      parsed.permanentChance > 95 ||
      !isCapabilitySet(parsed.capabilities) ||
      !parsed.selectedAnswers ||
      typeof parsed.selectedAnswers !== "object" ||
      !parsed.artifactAnswers ||
      typeof parsed.artifactAnswers !== "object" ||
      !Number.isInteger(parsed.artifactCorrect) ||
      parsed.artifactCorrect < 0 ||
      parsed.artifactCorrect > 18 ||
      !Number.isInteger(parsed.artifactAttempts) ||
      parsed.artifactAttempts < 0 ||
      parsed.artifactAttempts > 18 ||
      !Array.isArray(parsed.hintsUsed) ||
      !Array.isArray(parsed.severeFlags) ||
      !Array.isArray(parsed.recoveredFlags) ||
      typeof parsed.completed !== "boolean"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
