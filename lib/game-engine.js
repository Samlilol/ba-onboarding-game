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
    version: 1,
    currentStage: 1,
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
    hintsUsed: [],
    severeFlags: [],
    recoveredFlags: [],
    completed: false,
  };
}

export function applyChoice(state, stageId, choice) {
  if (state.selectedAnswers[stageId]) {
    return state;
  }

  const capabilities = { ...state.capabilities };
  for (const [key, delta] of Object.entries(choice.capabilityDeltas ?? {})) {
    if (key in capabilities) {
      capabilities[key] = clamp(capabilities[key] + delta, 0, 100);
    }
  }

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
    permanentChance: clamp(
      state.permanentChance + choice.chanceDelta,
      5,
      95,
    ),
    capabilities,
    selectedAnswers: {
      ...state.selectedAnswers,
      [stageId]: choice.id,
    },
    severeFlags,
    recoveredFlags,
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
  if (!state.selectedAnswers[state.currentStage]) {
    return state;
  }

  if (state.currentStage >= totalStages) {
    return { ...state, completed: true };
  }

  return {
    ...state,
    currentStage: state.currentStage + 1,
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
      parsed?.version !== 1 ||
      typeof parsed.currentStage !== "number" ||
      parsed.currentStage < 1 ||
      parsed.currentStage > 18 ||
      typeof parsed.permanentChance !== "number" ||
      parsed.permanentChance < 5 ||
      parsed.permanentChance > 95 ||
      !isCapabilitySet(parsed.capabilities) ||
      !parsed.selectedAnswers ||
      typeof parsed.selectedAnswers !== "object" ||
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
