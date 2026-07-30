"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  advanceToArtifact,
  advanceStage,
  applyArtifactChoice,
  applyChoice,
  createInitialState,
  determineOutcome,
  markHintUsed,
  restoreState,
} from "../lib/game-engine.js";
import { PHASES, STAGES } from "../lib/stages.js";

const STORAGE_KEY = "contract-to-core-v2";
const STORAGE_EVENT = "contract-to-core-save";

const CAPABILITY_META = {
  reliability: { label: "Reliability", short: "RL" },
  analysis: { label: "Analysis", short: "AN" },
  collaboration: { label: "Collaboration", short: "CO" },
  risk: { label: "Risk judgment", short: "RJ" },
  ownership: { label: "Ownership", short: "OW" },
  impact: { label: "Business impact", short: "BI" },
};

type Screen = "intro" | "game" | "review";
type CapabilityKey = keyof typeof CAPABILITY_META;
type ScoredOption = {
  id: string;
  chanceDelta: number;
  capabilityDeltas: Partial<Record<CapabilityKey, number>>;
  severeFlag?: string;
  recoversFlag?: string;
};
type ArtifactOption = ScoredOption & {
  text: string;
  feedback: string;
  correct: boolean;
};
type ArtifactSection = {
  label: string;
  content: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function ChanceMeter({ value, compact = false }: { value: number; compact?: boolean }) {
  return (
    <div className={cx("chance-meter", compact && "chance-meter--compact")}>
      <div className="chance-meter__head">
        <span>Permanent role chance</span>
        <strong>{value}%</strong>
      </div>
      <div
        className="chance-meter__track"
        role="progressbar"
        aria-label="Permanent role simulation chance"
        aria-valuemin={5}
        aria-valuemax={95}
        aria-valuenow={value}
      >
        <span style={{ width: `${value}%` }} />
      </div>
      {!compact && (
        <p>
          Simulation estimate · <span>not an employment prediction</span>
        </p>
      )}
    </div>
  );
}

function CapabilityList({
  capabilities,
  detailed = false,
}: {
  capabilities: Record<CapabilityKey, number>;
  detailed?: boolean;
}) {
  return (
    <div className={cx("capability-list", detailed && "capability-list--detailed")}>
      {(Object.keys(CAPABILITY_META) as CapabilityKey[]).map((key) => (
        <div className="capability" key={key}>
          <div className="capability__label">
            <span>{detailed ? CAPABILITY_META[key].label : CAPABILITY_META[key].short}</span>
            <b>{capabilities[key]}</b>
          </div>
          <div className="capability__track">
            <span style={{ width: `${capabilities[key]}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Intro({
  hasSaved,
  onStart,
  onContinue,
}: {
  hasSaved: boolean;
  onStart: () => void;
  onContinue: () => void;
}) {
  return (
    <main className="intro">
      <div className="intro__glow intro__glow--one" />
      <div className="intro__glow intro__glow--two" />
      <section className="intro__content">
        <div className="brand-mark" aria-hidden="true">
          C<span>→</span>C
        </div>
        <p className="eyebrow">A workplace learning simulation</p>
        <h1>
          Contract <em>to</em> Core
        </h1>
        <p className="intro__subtitle">
          Your first year as an AI BA. Every choice builds—or spends—the trust
          behind a permanent role.
        </p>

        <div className="role-line" aria-label="Your reporting line">
          <span>You · Junior AI BA</span>
          <i>→</i>
          <span>Maya · Assistant Manager</span>
          <i>→</i>
          <span>Andrea · Senior PO</span>
        </div>

        <div className="intro__stats">
          <span className="sr-only">36 decisions across 18 workplace scenarios and 18 artifact labs</span>
          <div>
            <strong>36</strong>
            <span>decisions</span>
          </div>
          <div>
            <strong>18</strong>
            <span>artifact labs</span>
          </div>
          <div>
            <strong>40–60</strong>
            <span>minutes to complete</span>
          </div>
        </div>

        <div className="intro__actions">
          {hasSaved && (
            <button className="button button--primary" onClick={onContinue}>
              Continue saved game <span aria-hidden="true">→</span>
            </button>
          )}
          <button
            className={cx("button", hasSaved ? "button--secondary" : "button--primary")}
            onClick={onStart}
          >
            Start first day <span aria-hidden="true">→</span>
          </button>
        </div>

        <p className="intro__note">
          Built from your onboarding vault. This is a learning simulation, not
          an AIA employment forecast or official company guidance.
        </p>
      </section>

      <aside className="intro__preview" aria-hidden="true">
        <div className="preview-card">
          <div className="preview-card__top">
            <span>MONTH 3 · QUALITY PLANNING</span>
            <b>11 / 18</b>
          </div>
          <div className="preview-card__speaker">
            <div>A</div>
            <p>
              <b>Andrea · Senior PO</b>
              <span>“What does ‘always accurate’ actually mean?”</span>
            </p>
          </div>
          <div className="preview-card__question">
            <small>YOUR DECISION</small>
            <h2>Define what good looks like.</h2>
            <span className="preview-answer">A</span>
            <span className="preview-answer">B</span>
            <span className="preview-answer preview-answer--active">C</span>
            <span className="preview-answer">D</span>
          </div>
          <div className="preview-card__footer">
            <span>Manager feedback follows every decision</span>
            <b>+6%</b>
          </div>
        </div>
      </aside>
    </main>
  );
}

function Sidebar({
  state,
  mobileOpen,
  onClose,
  onReviewStage,
  onReset,
}: {
  state: ReturnType<typeof createInitialState>;
  mobileOpen: boolean;
  onClose: () => void;
  onReviewStage: (stageId: number) => void;
  onReset: () => void;
}) {
  return (
    <>
      <div
        className={cx("sidebar-backdrop", mobileOpen && "is-open")}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={cx("sidebar", mobileOpen && "is-open")}>
        <div className="sidebar__brand">
          <div className="brand-mark brand-mark--small" aria-hidden="true">
            C<span>→</span>C
          </div>
          <div>
            <b>Contract to Core</b>
            <span>AI BA simulation</span>
          </div>
          <button className="icon-button sidebar__close" onClick={onClose} aria-label="Close stages">
            ×
          </button>
        </div>

        <ChanceMeter value={state.permanentChance} />
        <CapabilityList capabilities={state.capabilities} />

        <nav className="stage-nav" aria-label="Simulation stages">
          {PHASES.map((phase, phaseIndex) => {
            const phaseStages = STAGES.filter(
              (stage) => stage.id >= phase.range[0] && stage.id <= phase.range[1],
            );
            return (
              <section className="stage-group" key={phase.id}>
                <p>
                  <span>0{phaseIndex + 1}</span>
                  {phase.title}
                </p>
                {phaseStages.map((stage) => {
                  const isComplete = Boolean(
                    state.selectedAnswers[stage.id] && state.artifactAnswers[stage.id],
                  );
                  const isCurrent = state.currentStage === stage.id && !state.completed;
                  const isLocked = stage.id > state.currentStage;
                  return (
                    <button
                      key={stage.id}
                      className={cx(
                        "stage-link",
                        isComplete && "is-complete",
                        isCurrent && "is-current",
                      )}
                      disabled={!isComplete || isCurrent || isLocked}
                      onClick={() => onReviewStage(stage.id)}
                    >
                      <span>{isComplete ? "✓" : stage.id}</span>
                      <b>{stage.title}</b>
                    </button>
                  );
                })}
              </section>
            );
          })}
        </nav>

        <button className="sidebar__reset" onClick={onReset}>
          Start over
        </button>
      </aside>
    </>
  );
}

function ManagerFeedback({
  stage,
  selectedOption,
}: {
  stage: (typeof STAGES)[number];
  selectedOption: (typeof STAGES)[number]["options"][number];
}) {
  const delta = selectedOption.chanceDelta;
  return (
    <section className="feedback" aria-live="polite">
      <div className="feedback__header">
        <div className="avatar avatar--manager">{stage.manager.charAt(0)}</div>
        <div>
          <span>Manager feedback</span>
          <h3>{stage.manager}’s review</h3>
        </div>
        <div className={cx("delta", delta >= 0 ? "delta--positive" : "delta--negative")}>
          {delta >= 0 ? "+" : ""}
          {delta}%
        </div>
      </div>

      <div className="feedback__assessment">
        <span>{selectedOption.feedback.assessment}</span>
        <p>{selectedOption.feedback.consequence}</p>
      </div>

      <div className="feedback__grid">
        <article>
          <div className="feedback-icon feedback-icon--good">✓</div>
          <div>
            <h4>What you did well</h4>
            <p>{selectedOption.feedback.didWell}</p>
          </div>
        </article>
        <article>
          <div className="feedback-icon feedback-icon--improve">↗</div>
          <div>
            <h4>How to improve</h4>
            <p>{selectedOption.feedback.improve}</p>
          </div>
        </article>
      </div>

      <div className="feedback__move">
        <span>Better move</span>
        <p>{selectedOption.feedback.betterMove}</p>
      </div>

      <div className="mental-model">
        <span>Mental model</span>
        <p>{selectedOption.feedback.mentalModel}</p>
        <small>From: {stage.source}</small>
      </div>
    </section>
  );
}

function ArtifactLab({
  stage,
  state,
  onSelect,
  onHint,
  onContinue,
  onOpenMenu,
}: {
  stage: (typeof STAGES)[number];
  state: ReturnType<typeof createInitialState>;
  onSelect: (option: ArtifactOption) => void;
  onHint: () => void;
  onContinue: () => void;
  onOpenMenu: () => void;
}) {
  const artifact = stage.artifact;
  const selectedId = state.artifactAnswers[stage.id];
  const selected = artifact.options.find(
    (entry: ArtifactOption) => entry.id === selectedId,
  );
  const correct = artifact.options.find((entry: ArtifactOption) => entry.correct);
  const hintKey = `artifact-${stage.id}`;
  const hintShown = state.hintsUsed.includes(hintKey);

  return (
    <main className="game-main">
      <header className="mobile-header">
        <button className="icon-button" onClick={onOpenMenu} aria-label="Open stages">
          ☰
        </button>
        <div>
          <b>Stage {stage.id} of 18</b>
          <span>Artifact lab</span>
        </div>
        <strong>{state.permanentChance}%</strong>
      </header>

      <div className="game-main__inner">
        <div className="stage-meta">
          <span>{stage.timeline}</span>
          <b>Part 2 / 2 · Artifact judgment</b>
        </div>

        <section className="artifact-hero">
          <p className="scenario__phase">Artifact lab</p>
          <span className="artifact-hero__type">{artifact.type}</span>
          <h1>{artifact.title}</h1>
          <p>{artifact.prompt}</p>
        </section>

        <section className="decision artifact-decision">
          <div className="decision__head">
            <div>
              <span>Choose the strongest artifact</span>
              <h2>Which draft would you take into the work?</h2>
            </div>
            <button
              className={cx("hint-button", hintShown && "is-used")}
              onClick={onHint}
              disabled={hintShown}
            >
              <span aria-hidden="true">✦</span> {hintShown ? "Hint shown" : "Show hint"}
            </button>
          </div>

          {hintShown && (
            <div className="hint-panel" aria-live="polite">
              <b>Inspect the artifact, not the formatting</b>
              <p>{artifact.hint}</p>
            </div>
          )}

          <div className="options artifact-options">
            {artifact.options.map((entry: ArtifactOption) => {
              const isSelected = entry.id === selectedId;
              return (
                <button
                  key={entry.id}
                  className={cx(
                    "option",
                    "artifact-option",
                    isSelected && "is-selected",
                    selectedId && !isSelected && "is-muted",
                  )}
                  data-correct={entry.correct}
                  onClick={() => onSelect(entry)}
                  disabled={Boolean(selectedId)}
                  aria-pressed={isSelected}
                >
                  <span>{entry.id}</span>
                  <p>{entry.text}</p>
                  {isSelected && <b aria-hidden="true">{entry.correct ? "✓" : "!"}</b>}
                </button>
              );
            })}
          </div>
          {!selectedId && <p className="keyboard-note">Tip: press A, B, C, or D to choose</p>}
        </section>

        {selected && correct && (
          <>
            <section className="artifact-review" aria-live="polite">
              <div className="artifact-review__result">
                <span>Artifact review</span>
                <h3>{selected.correct ? "Sound artifact judgment" : "A useful correction"}</h3>
                <p>{selected.feedback}</p>
              </div>
              {!selected.correct && (
                <div className="artifact-review__correct">
                  <b>Strongest choice: {correct.id}</b>
                  <p>{correct.text}</p>
                  <small>{correct.feedback}</small>
                </div>
              )}
            </section>

            <section className="model-artifact">
              <div className="model-artifact__head">
                <div>
                  <span>Model artifact</span>
                  <h3>{artifact.model.title}</h3>
                </div>
                <b>Complete example</b>
              </div>
              <div className="model-artifact__sections">
                {artifact.model.sections.map((section: ArtifactSection) => (
                  <article key={section.label}>
                    <span>{section.label}</span>
                    <p>{section.content}</p>
                  </article>
                ))}
              </div>
            </section>

            <div className="continue-row">
              <p>
                Your artifact judgment is saved.
                <span>
                  {" "}
                  {stage.id === 18 ? "Next: final review" : `Next: ${STAGES[stage.id].title}`}
                </span>
              </p>
              <button className="button button--primary" onClick={onContinue}>
                {stage.id === 18 ? "See final outcome" : "Next stage"}{" "}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function GameStage({
  state,
  onSelect,
  onArtifactSelect,
  onHint,
  onContinue,
  onOpenMenu,
}: {
  state: ReturnType<typeof createInitialState>;
  onSelect: (option: (typeof STAGES)[number]["options"][number]) => void;
  onArtifactSelect: (option: ArtifactOption) => void;
  onHint: () => void;
  onContinue: () => void;
  onOpenMenu: () => void;
}) {
  const stage = STAGES[state.currentStage - 1];
  const selectedId = state.selectedAnswers[stage.id];
  const selectedOption = stage.options.find((entry) => entry.id === selectedId);
  const hintShown = state.hintsUsed.includes(stage.id);

  if (state.currentPart === "artifact") {
    return (
      <ArtifactLab
        stage={stage}
        state={state}
        onSelect={onArtifactSelect}
        onHint={onHint}
        onContinue={onContinue}
        onOpenMenu={onOpenMenu}
      />
    );
  }

  return (
    <main className="game-main">
      <header className="mobile-header">
        <button className="icon-button" onClick={onOpenMenu} aria-label="Open stages">
          ☰
        </button>
        <div>
          <b>Stage {stage.id} of 18</b>
          <span>{stage.phase}</span>
        </div>
        <strong>{state.permanentChance}%</strong>
      </header>

      <div className="game-main__inner">
        <div className="stage-meta">
          <span>{stage.timeline}</span>
          <b>
            Stage {String(stage.id).padStart(2, "0")} / {STAGES.length}
          </b>
        </div>

        <section className="scenario">
          <p className="scenario__phase">{stage.phase}</p>
          <h1>{stage.title}</h1>

          <div className="speaker">
            <div className="avatar">{stage.speaker.charAt(0)}</div>
            <div>
              <b>{stage.speaker}</b>
              <p>{stage.scenario}</p>
            </div>
          </div>
        </section>

        <section className="decision">
          <div className="decision__head">
            <div>
              <span>Your decision</span>
              <h2>{stage.question}</h2>
            </div>
            <button
              className={cx("hint-button", hintShown && "is-used")}
              onClick={onHint}
              disabled={hintShown}
            >
              <span aria-hidden="true">✦</span> {hintShown ? "Hint shown" : "Show hint"}
            </button>
          </div>

          {hintShown && (
            <div className="hint-panel" aria-live="polite">
              <b>Think like a senior BA</b>
              <p>{stage.hint}</p>
            </div>
          )}

          <div className="options" onKeyDown={() => undefined}>
            {stage.options.map((entry) => {
              const isSelected = selectedId === entry.id;
              return (
                <button
                  key={entry.id}
                  className={cx(
                    "option",
                    isSelected && "is-selected",
                    selectedId && !isSelected && "is-muted",
                  )}
                  onClick={() => onSelect(entry)}
                  disabled={Boolean(selectedId)}
                  aria-pressed={isSelected}
                >
                  <span>{entry.id}</span>
                  <p>{entry.text}</p>
                  {isSelected && <b aria-hidden="true">✓</b>}
                </button>
              );
            })}
          </div>
          {!selectedId && <p className="keyboard-note">Tip: press A, B, C, or D to choose</p>}
        </section>

        {selectedOption && (
          <>
            <ManagerFeedback stage={stage} selectedOption={selectedOption} />
            <div className="continue-row">
              <p>
                Your progress is saved on this device.
                <span> Next: artifact lab · {stage.artifact.type}</span>
              </p>
              <button className="button button--primary" onClick={onContinue}>
                Continue to artifact exercise{" "}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function Debrief({
  state,
  onReview,
  onReset,
}: {
  state: ReturnType<typeof createInitialState>;
  onReview: () => void;
  onReset: () => void;
}) {
  const outcome = determineOutcome(state);
  const ranked = (Object.entries(state.capabilities) as Array<[CapabilityKey, number]>).sort(
    (a, b) => b[1] - a[1],
  );
  const strengths = ranked.slice(0, 2);
  const growth = ranked.slice(-2).reverse();
  const isPermanent = outcome === "permanent";

  return (
    <main className="debrief">
      <div className="debrief__top">
        <p className="eyebrow">Month 12 · Final review</p>
        <div className={cx("outcome-stamp", isPermanent ? "is-positive" : "is-caution")}>
          {isPermanent ? "Permanent offer" : "Contract concludes"}
        </div>
        <h1>
          {isPermanent
            ? "You became part of the core."
            : "The contract ends—but the learning does not."}
        </h1>
        <p>
          {isPermanent
            ? "Your managers saw a repeatable pattern: reliable delivery, safe judgment, visible business value, and ownership that stayed inside clear decision rights."
            : "Your review shows where trust leaked away. In real life, budget and organization also matter; this simulation focuses only on the behaviors you can practice."}
        </p>
      </div>

      <section className="debrief__score">
        <div className="debrief__chance">
          <span>Final simulation chance</span>
          <strong>{state.permanentChance}%</strong>
          <div className="chance-meter__track">
            <span style={{ width: `${state.permanentChance}%` }} />
          </div>
          <div className="artifact-score">
            <span>Artifact judgment</span>
            <strong>
              {state.artifactCorrect}/{state.artifactAttempts}
            </strong>
            <small>
              {state.artifactAttempts
                ? `${Math.round((state.artifactCorrect / state.artifactAttempts) * 100)}% correct`
                : "No attempts"}
            </small>
          </div>
        </div>
        <CapabilityList capabilities={state.capabilities} detailed />
      </section>

      <section className="debrief__insights">
        <article>
          <span>Strongest signals</span>
          {strengths.map(([key, score]) => (
            <div key={key}>
              <b>{CAPABILITY_META[key].label}</b>
              <strong>{score}</strong>
            </div>
          ))}
        </article>
        <article>
          <span>Next growth focus</span>
          {growth.map(([key, score]) => (
            <div key={key}>
              <b>{CAPABILITY_META[key].label}</b>
              <strong>{score}</strong>
            </div>
          ))}
        </article>
        <article>
          <span>Manager’s closing note</span>
          <p>
            {isPermanent
              ? "Keep moving from doing the work well to defining how the team does it well. That is the path from BA execution to Senior BA ownership."
              : "Replay the weak-signal decisions. Focus on early clarification, visible trade-offs, safe escalation, and evidence-based ownership."}
          </p>
        </article>
      </section>

      {state.severeFlags.length > 0 && (
        <div className="control-note">
          <b>Unresolved control flags</b>
          <p>{state.severeFlags.join(" · ")}</p>
        </div>
      )}

      <div className="debrief__actions">
        <button className="button button--primary" onClick={onReview}>
          Review decisions <span aria-hidden="true">→</span>
        </button>
        <button className="button button--secondary" onClick={onReset}>
          Start over
        </button>
      </div>
    </main>
  );
}

function DecisionReview({
  state,
  onBack,
}: {
  state: ReturnType<typeof createInitialState>;
  onBack: () => void;
}) {
  return (
    <main className="review">
      <header className="review__header">
        <div>
          <p className="eyebrow">Your decision record</p>
          <h1>Review all 36 choices</h1>
          <p>Revisit each workplace decision, artifact judgment, model artifact, and coaching note.</p>
        </div>
        <button className="button button--secondary" onClick={onBack}>
          ← Back to outcome
        </button>
      </header>
      <div className="review__list">
        {STAGES.map((stage) => {
          const choice = stage.options.find(
            (entry) => entry.id === state.selectedAnswers[stage.id],
          );
          const artifactChoice = stage.artifact.options.find(
            (entry: ArtifactOption) => entry.id === state.artifactAnswers[stage.id],
          );
          if (!choice) return null;
          return (
            <details key={stage.id}>
              <summary>
                <span>{String(stage.id).padStart(2, "0")}</span>
                <div>
                  <small>{stage.timeline}</small>
                  <b>{stage.title}</b>
                </div>
                <em className={choice.chanceDelta >= 0 ? "positive" : "negative"}>
                  {choice.chanceDelta >= 0 ? "+" : ""}
                  {choice.chanceDelta}%
                </em>
              </summary>
              <div className="review__detail">
                <p>
                  <b>Your answer: {choice.id}</b> · {choice.text}
                </p>
                <div>
                  <article>
                    <span>What you did well</span>
                    <p>{choice.feedback.didWell}</p>
                  </article>
                  <article>
                    <span>How to improve</span>
                    <p>{choice.feedback.improve}</p>
                  </article>
                </div>
                <blockquote>{choice.feedback.mentalModel}</blockquote>
                {artifactChoice && (
                  <div className="review__artifact">
                    <span>Artifact choice · {stage.artifact.type}</span>
                    <p>
                      <b>
                        {artifactChoice.id} · {artifactChoice.correct ? "Correct" : "Needs revision"}
                      </b>{" "}
                      — {artifactChoice.text}
                    </p>
                    <p>{artifactChoice.feedback}</p>
                    <div className="review__model">
                      <b>Model artifact</b>
                      {stage.artifact.model.sections.map((section: ArtifactSection) => (
                        <p key={section.label}>
                          <strong>{section.label}:</strong> {section.content}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </main>
  );
}

function StageReviewModal({
  stageId,
  state,
  onClose,
}: {
  stageId: number;
  state: ReturnType<typeof createInitialState>;
  onClose: () => void;
}) {
  const stage = STAGES[stageId - 1];
  const choice = stage.options.find((entry) => entry.id === state.selectedAnswers[stageId]);
  if (!choice) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="review-stage-title">
      <button className="modal__backdrop" onClick={onClose} aria-label="Close review" />
      <section className="modal__panel">
        <button className="icon-button modal__close" onClick={onClose} aria-label="Close review">
          ×
        </button>
        <p className="eyebrow">
          Stage {stage.id} · {stage.timeline}
        </p>
        <h2 id="review-stage-title">{stage.title}</h2>
        <p className="modal__scenario">{stage.scenario}</p>
        <div className="modal__answer">
          <span>{choice.id}</span>
          <p>{choice.text}</p>
        </div>
        <ManagerFeedback stage={stage} selectedOption={choice} />
      </section>
    </div>
  );
}

export function Game() {
  const [state, setState] = useState(createInitialState);
  const [screen, setScreen] = useState<Screen>("intro");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reviewStageId, setReviewStageId] = useState<number | null>(null);
  const [started, setStarted] = useState(false);

  const currentStage = STAGES[state.currentStage - 1];
  const currentSelected =
    state.currentPart === "scenario"
      ? Boolean(state.selectedAnswers[state.currentStage])
      : Boolean(state.artifactAnswers[state.currentStage]);

  const subscribeToSavedRun = useCallback((listener: () => void) => {
    window.addEventListener(STORAGE_EVENT, listener);
    window.addEventListener("storage", listener);
    return () => {
      window.removeEventListener(STORAGE_EVENT, listener);
      window.removeEventListener("storage", listener);
    };
  }, []);

  const hasSaved = useSyncExternalStore(
    subscribeToSavedRun,
    () => Boolean(restoreState(window.localStorage.getItem(STORAGE_KEY) ?? "")),
    () => false,
  );

  useEffect(() => {
    if (started) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new Event(STORAGE_EVENT));
    }
  }, [state, started]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (screen !== "game" || state.completed || currentSelected) return;
      const key = event.key.toUpperCase();
      const choices: ScoredOption[] =
        state.currentPart === "scenario"
          ? currentStage.options
          : currentStage.artifact.options;
      const selected = choices.find((entry: ScoredOption) => entry.id === key);
      if (selected) {
        event.preventDefault();
        setState((current) =>
          state.currentPart === "scenario"
            ? applyChoice(current, currentStage.id, selected)
            : applyArtifactChoice(current, currentStage.id, selected),
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [screen, state.completed, state.currentPart, currentSelected, currentStage]);

  const startFresh = () => {
    if (hasSaved && !window.confirm("Start over and erase the saved run on this device?")) {
      return;
    }
    const fresh = createInitialState();
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(STORAGE_EVENT));
    setState(fresh);
    setStarted(true);
    setScreen("game");
  };

  const continueSaved = () => {
    const restored = restoreState(window.localStorage.getItem(STORAGE_KEY) ?? "");
    if (!restored) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event(STORAGE_EVENT));
      return;
    }
    setState(restored);
    setStarted(true);
    setScreen("game");
  };

  const reset = () => {
    if (!window.confirm("Start over and erase all saved decisions?")) return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(STORAGE_EVENT));
    setState(createInitialState());
    setStarted(false);
    setMobileMenuOpen(false);
    setReviewStageId(null);
    setScreen("intro");
  };

  const handleContinue = () => {
    setState((current) =>
      current.currentPart === "scenario"
        ? advanceToArtifact(current)
        : advanceStage(current, STAGES.length),
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (screen === "intro") {
    return <Intro hasSaved={hasSaved} onStart={startFresh} onContinue={continueSaved} />;
  }

  if (screen === "review") {
    return <DecisionReview state={state} onBack={() => setScreen("game")} />;
  }

  if (state.completed) {
    return (
      <Debrief
        state={state}
        onReview={() => setScreen("review")}
        onReset={reset}
      />
    );
  }

  return (
    <div className="game-shell">
      <Sidebar
        state={state}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onReviewStage={(stageId) => {
          setReviewStageId(stageId);
          setMobileMenuOpen(false);
        }}
        onReset={reset}
      />
      <GameStage
        state={state}
        onSelect={(selected) =>
          setState((current) => applyChoice(current, currentStage.id, selected))
        }
        onArtifactSelect={(selected) =>
          setState((current) =>
            applyArtifactChoice(current, currentStage.id, selected),
          )
        }
        onHint={() =>
          setState((current) =>
            markHintUsed(
              current,
              current.currentPart === "scenario"
                ? currentStage.id
                : `artifact-${currentStage.id}`,
            ),
          )
        }
        onContinue={handleContinue}
        onOpenMenu={() => setMobileMenuOpen(true)}
      />
      {reviewStageId && (
        <StageReviewModal
          stageId={reviewStageId}
          state={state}
          onClose={() => setReviewStageId(null)}
        />
      )}
    </div>
  );
}
