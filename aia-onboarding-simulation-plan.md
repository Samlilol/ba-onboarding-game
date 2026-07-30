# AIA New Job Onboarding Simulation — Development Plan

## Status

Planning only. No HTML, CSS, or JavaScript should be developed until this plan is reviewed.

## Product Summary

Build a simple, single-page HTML simulation in which the player joins an AIA Automation CoE-style team as a junior contract AI Business Analyst. Across 18 workplace scenarios, the player chooses A, B, C, or D, receives immediate coaching, and sees how the decision changes their estimated chance of:

1. converting to a permanent role; or
2. having the contract end without renewal/conversion.

The point is not to predict a real employment decision. The game is a safe rehearsal tool for the behaviors that create trust: learning the organization, framing problems, producing buildable analysis, managing stakeholders, protecting controls, delivering measurable value, and gradually taking ownership.

Working title: **Contract to Core: Your First Year as an AI BA**

## Problem

A new junior BA can read a large amount of onboarding and career material without becoming better at making decisions inside ambiguous workplace situations. The difficult part is recognizing which mental model applies when a manager, Senior PO, SME, developer, QA colleague, or business stakeholder creates competing pressure.

The simulation converts the vault material into repeated practice:

`scenario → decision → consequence → explanation → reusable mental model`

## Goals

- Teach the highest-leverage behaviors for the first year of an AI BA contract.
- Let the player practice workplace judgment through 18 short scenarios.
- Explain why each option is strong, weak, or conditionally useful.
- Make progress and consequences legible through a permanent-role probability and six skill signals.
- Cover onboarding, BA craft, AI quality, delivery, controls, stakeholder management, adoption, and ownership.
- Finish in approximately 25–40 minutes, with individual stages suitable for shorter sessions.
- End with a useful capability debrief, even when the player receives the contract-ended outcome.

## Non-Goals

- Predicting AIA hiring, renewal, compensation, promotion, or HR decisions.
- Reproducing confidential AIA systems, policies, people, or internal data.
- Testing insurance-law citations or obscure product trivia.
- Simulating every possible BA responsibility or the full three-year career roadmap.
- Adding accounts, a backend, multiplayer, analytics, AI-generated questions, or an admin content editor in v1.
- Using real employee likenesses or implying that the game is an official AIA product.

## Audience and Tone

Primary audience: the user preparing to start a contract AI BA role in a Hong Kong insurance automation team.

Tone:

- supportive but candid;
- workplace-realistic rather than cartoonish;
- educational after both good and poor choices;
- written in clear English, with selected Hong Kong workplace phrasing where natural;
- no humiliating “wrong answer” language.

The player is competent but junior. Strong decisions should feel thoughtful and practical, not magically senior.

## World and Characters

Names should remain fictional except that “Andrea” may be used only if the user confirms this is acceptable. The safer v1 default is fictional names with role labels.

| Character | Role in the simulation | What they test |
|---|---|---|
| Player | Junior contract AI BA | Learning speed, judgment, reliability, ownership |
| Maya | Assistant Manager, direct team lead | Day-to-day expectations, coaching, escalation, contract check-ins |
| Andrea / fictional equivalent | Senior Product Owner and senior project leader | Priority, product outcomes, business cases, executive communication |
| Ken | Senior BA | BA methods, requirements quality, mentoring signal |
| Chloe | QA lead | Testability, UAT, defect triage |
| Ravi | Developer | Feasibility, dependencies, ambiguity, delivery trade-offs |
| Iris | Data/AI engineer | RAG, evaluation, probabilistic-system constraints |
| Grace | Compliance and privacy partner | Controls, evidence, safe scope, auditability |
| Vincent | Agency operations SME | Real workflows, exceptions, adoption |
| Elaine | Business unit stakeholder | Urgency, solution-first requests, changing scope |
| Frontline agents | End users | Workflow fit, trust, language, adoption |

Characters should recur so the player sees relationships and credibility change over time.

## Learning Model

### Six visible capability signals

Each choice changes one or more signals on a 0–100 scale:

1. **Reliability** — follow-through, meeting discipline, no surprises.
2. **Analysis** — problem framing, evidence, requirements, edge cases.
3. **Collaboration** — listening, translation, conflict handling, trust.
4. **Risk Judgment** — privacy, compliance, access, safety, escalation.
5. **Ownership** — initiative within authority, decisions, recommendations.
6. **Business Impact** — adoption, measurable outcomes, prioritization.

These signals make the game educational. The permanent-role chance is the summary, not the only feedback.

### Permanent-role chance

- Start at **50%**. This communicates uncertainty rather than presumed success or failure.
- Choices normally move the chance by **−8 to +8 percentage points**.
- Cap the displayed chance between **5% and 95%**.
- A single mistake should not decide the ending unless it is a repeated or severe control failure.
- Later scenarios weigh Ownership and Business Impact more heavily; early scenarios weigh Reliability and Learning.
- The UI shows the delta after each answer, for example `+5%: You protected delivery while keeping momentum`.

Recommended deterministic outcome rules:

- **Permanent role:** final chance is 65% or above, with no severe-control-failure gate.
- **Borderline review:** final chance is 45–64%. Resolve using the six capability signals and the final contract conversation. The game still ends in one of the two requested outcomes but explains the deciding evidence.
- **Contract ends:** final chance is below 45%, or the player accumulated two severe uncorrected control failures.

The implementation should not use random chance in v1. A deterministic result lets the player learn from replaying different decisions.

### Severe control failures

Only a few choices should create a severe flag, such as:

- exposing personal policy/performance data without authorization;
- letting an LLM approve or reject a claim;
- hiding a known critical compliance/security issue;
- knowingly launching without required business/control sign-off.

A later corrective choice may clear one flag. This teaches recovery and escalation rather than making one click permanently fatal.

### Hints

- Every stage has one **Hint** button.
- Hints do not reduce score.
- A hint reveals the decision frame, not the correct letter.
- Example: “Separate the stakeholder’s proposed solution from the outcome they want. Which option makes the assumptions testable?”
- After use, the button changes to `Hint shown` and remains expanded.
- Hint usage is included in the final learning summary only as a study signal, not a performance penalty.

### Feedback after each answer

Feedback should contain:

1. **Immediate consequence** — what happens in the scene.
2. **Assessment** — strong, reasonable but incomplete, risky, or serious control failure.
3. **Why** — the trade-off and what the player missed or protected.
4. **Better move** — the best next action or improved wording.
5. **Mental model** — a short vault-derived principle.
6. **Score change** — permanent-role delta and affected capabilities.

All four options need tailored feedback. Avoid making three options obviously foolish.

## User / Actor Flows

### First-time play

1. Player sees title, premise, disclaimer, estimated duration, and `Start first day`.
2. A brief character introduction establishes the reporting line:
   `Junior AI BA → Assistant Manager → Senior PO/project leader`.
3. Stage 1 opens.
4. Player reads the scenario and may open the hint.
5. Player selects A, B, C, or D.
6. The selected option locks and feedback appears.
7. Capability changes and permanent-role chance animate once.
8. Player selects `Continue`.
9. The left stage bar advances and the next scenario opens.
10. After Stage 18, the game shows one of the two outcomes plus a capability debrief and replay options.

### Returning play

- Save the current stage, answers, score, flags, and hint state to `localStorage`.
- On reload, offer `Continue saved game` and `Start over`.
- Confirm before erasing a saved run.

### Replay

- `Replay all` resets the game.
- `Review decisions` opens a summary of all selected answers and coaching.
- Optional v1.1: replay only weak-signal stages.

## Stage Map

Use 18 stages grouped into five phases. The left navigation shows all phases and stages but locks future stages to preserve the learning sequence.

| # | Time / scenario | Primary test | Core decision being rehearsed | Main vault basis |
|---|---|---|---|---|
| 1 | Day 1: “Get up to speed quickly” | Reliable initiative | Ask for outcome, scope, boundaries, and sources; create an investigation plan instead of waiting or pretending to understand | First Two Weeks 80/20 Onboarding; Hands-On, No-Hand-Holding |
| 2 | Day 3: Who really matters? | Stakeholder mapping | Identify decision maker, SME, and blocker/gatekeeper by evidence, not title alone | Stakeholder Role Map for a New Team |
| 3 | End of Week 1: Conflicting explanations | Organizational diagnosis | Compare Challenge–Goal–Gap accounts and mark fact versus assumption | Three-Question Organizational Diagnosis |
| 4 | Week 2: Agents say the SOP is wrong | Workflow discovery | Observe real cases, handoffs, workarounds, exceptions, and controls instead of copying the SOP | Business Analysis Delivery Lifecycle |
| 5 | Week 3: “Build us a smarter chatbot” | Problem framing | Convert a vague solution request into Problem–Win–Constraint before decomposition | Problem Win Constraint Workflow |
| 6 | Week 4: The senior stakeholder’s idea | Constructive challenge | Acknowledge the idea, surface assumptions, and propose a bounded experiment with success and guardrail metrics | How to Respond When BU Has the Idea |
| 7 | Month 2: Requirements workshop | Senior questioning | State the decision, use context–observation–impact–question, probe evidence, then close the loop | Senior BA Questioning and Probing |
| 8 | Month 2: Business vs IT vs Compliance | Conflict and decision rights | Separate need, requirement, constraint, preference, and assumption; present options and name the accountable decision owner | Enterprise Stakeholder Management; Interview Prep Pack |
| 9 | Month 2: Map the future workflow | End-to-end BA craft | Define TO-BE, business rules, exceptions, dependencies, non-scope, and traceable acceptance criteria | Business Analysis Delivery Lifecycle |
| 10 | Month 3: Personal policy-status request | AI routing and privacy | Route approved knowledge to RAG, personal data to authorized APIs, calculations to deterministic functions, and high-risk cases to refusal/handoff | AIA Automation CoE Interview Prep Pack |
| 11 | Month 3: “The bot should always be accurate” | AI acceptance criteria | Replace absolute promises with representative test sets, thresholds, critical-error limits, fallbacks, and ownership | Career Roadmap; Chatbot Evaluation |
| 12 | Month 4: Accuracy falls after a KB update | Root-cause analysis | Use a failure taxonomy to distinguish retrieval miss, stale knowledge, intent error, hallucination, and tool failure | Career Roadmap; Chatbot Evaluation |
| 13 | Month 5: E-claim expansion pressure | Controlled workflow design | Keep identity, entitlement, rules, confirmation, submission, audit, and claim decisions outside free-form generation | E-Claim Model Workflow; Insurance Compliance Operating Model |
| 14 | Month 6: UAT is “almost done” | UAT judgment | Cover happy, negative, boundary, permission, language, timeout, duplicate, audit, and fallback scenarios; obtain accountable sign-off | Business Analysis Delivery Lifecycle; UAT Model Answer |
| 15 | Month 7: Agents are not using the bot | Adoption diagnosis | Diagnose awareness, access, capability, trust, and workflow friction before prescribing training | Adoption Model Answer |
| 16 | Month 8: New scope threatens the date | Executive communication | Give outcome, status, risk/impact, recommendation, and required decision; make scope/date trade-offs visible | Enterprise Stakeholder Management |
| 17 | Month 9: Make your work visible | Quantified ownership | Translate AI quality improvements into business outcomes, document a reusable method, and give credit to the team | Career Roadmap; Three-Year Scenarios |
| 18 | Month 9–12: Contract conversation | Career agency and judgment | Ask early whether performance is on track, present evidence and gaps, seek conversion/renewal clarity, and maintain a professional plan B | Career Roadmap; Three-Year Scenarios |

### Phase labels

1. **Learn the System** — Stages 1–4
2. **Frame the Work** — Stages 5–9
3. **Build Safe AI** — Stages 10–13
4. **Deliver Real Adoption** — Stages 14–16
5. **Earn Trust and Ownership** — Stages 17–18

### Content authoring standard per stage

Each stage object should contain:

- stage number, phase, timeline label, title;
- speaker and short dialogue;
- scenario context of 80–140 words;
- one question;
- exactly four options;
- hint;
- per-option consequence and coaching;
- capability deltas;
- permanent-role delta;
- optional severe-control flag;
- mental-model title and short explanation;
- source-note labels for internal authoring traceability.

## Ending Design

### Ending A: Permanent role offered

The direct manager explains the evidence:

- reliable delivery and no surprises;
- strong problem/requirement framing;
- safe AI and control judgment;
- trusted cross-functional relationships;
- measurable contribution;
- signs of ownership without overstepping.

The epilogue should position the next path as Senior BA capability and gradual ownership, not an instant promotion to PO.

### Ending B: Contract ends

The manager explains the observable pattern without moral judgment, such as:

- execution without diagnosis;
- weak visibility or follow-through;
- stakeholder avoidance;
- unsafe shortcuts;
- activity metrics without business impact;
- waiting too long to clarify contract expectations.

The debrief gives the top three skills to practice and invites replay. It should also note that real contract outcomes may be driven by budget or organizational factors beyond individual performance.

### Final debrief

Show:

- final permanent-role chance;
- six capability bars;
- strongest two capabilities;
- weakest two capabilities;
- severe flags and recoveries, if any;
- three recommended vault topics to revisit;
- `Review decisions` and `Replay` buttons.

## Layout and Interaction Design

### Desktop

- **Left sidebar, approximately 28% width**
  - game title;
  - permanent-role chance meter;
  - six compact capability indicators;
  - five collapsible phase groups;
  - stage states: completed, current, locked;
  - reset control at the bottom.
- **Right main area, approximately 72% width**
  - timeline/phase eyebrow;
  - character speaker and dialogue;
  - scenario card;
  - hint button;
  - four large answer buttons;
  - feedback panel after selection;
  - `Continue` button.

### Mobile

- Sidebar becomes a compact top progress panel plus a slide-out stage drawer.
- Answer options remain full-width and easy to tap.
- Feedback appears directly below the selected answer.

### Visual direction

- Corporate-learning feel, not a casino or childish quiz.
- Warm neutral background, deep red accent inspired by the setting but no copied AIA brand assets.
- Distinct colors for capability growth, caution, and control risk.
- Recurring character initials or simple CSS avatars; no image generation needed for v1.
- Light motion only: score delta, progress transition, and feedback reveal.

## Requirements

### Functional Requirements

- Present 18 stages in the defined order.
- Allow exactly one A/B/C/D selection per stage.
- Allow the hint before answering.
- Lock the selected answer and show tailored feedback.
- Update permanent-role chance and capability signals.
- Support severe-control flags and corrective recovery.
- Save and restore a run with `localStorage`.
- Provide start-over confirmation.
- Display one of the two required final outcomes.
- Provide a full decision review after completion.
- Work by opening `index.html` locally without a server.

### Non-Functional Requirements

- Use semantic HTML, CSS, and vanilla JavaScript.
- No build step, external API, login, or network dependency.
- Keyboard operable: options selectable by focus/Enter/Space and optionally keys A–D.
- Visible focus styles and sufficient color contrast.
- Use `aria-live` for score and feedback changes without excessive announcements.
- Respect `prefers-reduced-motion`.
- Responsive from approximately 360px mobile width through desktop.
- Keep content separate from rendering logic so stages can be edited safely.
- Avoid loading real or personal employee information.

## API

Not applicable. The v1 game is entirely client-side.

## Data

Recommended files:

```text
index.html
styles.css
game.js
stages.js
README.md
```

`stages.js` contains the authored scenario objects. `game.js` contains state transitions, scoring, persistence, and rendering behavior.

Saved state:

```text
version
currentStage
selectedAnswers[]
hintsUsed[]
permanentChance
capabilities{}
severeFlags[]
recoveredFlags[]
completed
```

Include a schema version so a future content update can invalidate incompatible saved games cleanly.

## Architecture and Data Flow

```text
Stage content (stages.js)
          |
          v
Game state + scoring rules (game.js) <----> localStorage
          |
          v
Accessible DOM rendering (index.html)
          |
          v
Layout and feedback states (styles.css)
```

State transition:

```text
INTRO → QUESTION → ANSWER_LOCKED/FEEDBACK → NEXT_STAGE
                                         → FINAL_DEBRIEF (after Stage 18)
```

## Business Logic and Rules

- Choices are deterministic.
- Score changes apply only once per stage.
- Refreshing cannot reapply a score delta.
- The stage sidebar is informational; future stages cannot be skipped.
- Completed stages may be reviewed but answers cannot be changed mid-run.
- A restart is the only way to change previous decisions.
- Probability language must say “simulation estimate,” never “AIA prediction.”
- The game should reward:
  - evidence before assumption;
  - outcomes before requested solutions;
  - controlled experimentation before broad commitment;
  - options and recommendations before passive coordination;
  - early escalation with a decision package;
  - safe limits and honest fallback over confident invention;
  - reusable methods and measurable outcomes over raw activity;
  - ownership inside clear decision rights.
- The game should penalize:
  - pretending to understand;
  - collecting every request without resolving conflict;
  - treating blockers as enemies;
  - hidden risk or late surprise;
  - unbounded AI behavior in regulated workflows;
  - mistaking login counts for adoption;
  - waiting passively for renewal discussion.

## Error Handling and Edge Cases

- If saved data is missing or invalid, offer a fresh start without breaking the page.
- If saved content version is obsolete, explain that the scenario set changed and reset only after confirmation.
- Prevent double-clicking an option from applying duplicate score changes.
- If JavaScript is disabled, show a simple message that the simulation requires JavaScript.
- Long feedback text must remain readable on small screens.
- Capability values and probability must remain within their bounds.
- If two endings are numerically tied in the borderline band, prefer the outcome supported by Reliability, Risk Judgment, and the final-stage decision, then explain the tie-break.

## Test Plan

### Logic tests

- Every stage has four options, a hint, feedback, deltas, and a source label.
- All 18 stages can be completed.
- Score and capability bounds never overflow.
- Score deltas apply once only.
- Severe flags set, recover, and affect endings correctly.
- Threshold and borderline outcomes resolve deterministically.
- Save, reload, continue, complete, review, and reset all work.

### Content QA

- Each stage tests one primary skill and no more than two secondary skills.
- The strongest option is defensible from the cited vault notes.
- Non-best options represent believable junior mistakes or trade-offs.
- Feedback explains behavior, consequence, and a reusable principle.
- No stage implies access to confidential AIA practices.
- Names and claims are fictionalized or clearly labeled as simulation assumptions.

### Accessibility and responsive QA

- Complete the game using keyboard only.
- Verify screen-reader announcements for selection, feedback, and score changes.
- Check contrast, focus visibility, text zoom at 200%, and reduced motion.
- Test 360px, tablet, laptop, and wide-desktop layouts.

### Manual acceptance run

Complete at least these paths:

1. consistently strong choices → permanent outcome;
2. consistently weak choices → contract-ended outcome;
3. borderline mixed choices → deterministic tie-break;
4. severe control failure followed by recovery;
5. two uncorrected severe failures → contract-ended outcome;
6. reload midway and continue without state or score corruption.

## Delivery Plan

### Step 1: Approve the learning design

- Confirm 18-stage scope.
- Confirm fictional versus real character names.
- Confirm whether the tone should be English-only or bilingual English/Cantonese.
- Confirm permanent-role meter visibility and deterministic endings.

### Step 2: Author the scenario content

- Draft all four choices and feedback for each stage.
- Apply the content authoring standard.
- Cross-check each stage against its vault source.
- Run a bias pass so the “best” option is not always the longest or most managerial-sounding answer.

### Step 3: Build the static game shell

- Implement semantic layout and responsive sidebar/main panel.
- Implement question, hint, selection, feedback, and continue states.
- Implement capability and probability displays.

### Step 4: Add state, scoring, endings, and persistence

- Implement deterministic scoring.
- Add severe flags and recovery.
- Add `localStorage`, decision review, reset, and both endings.

### Step 5: QA and polish

- Validate all paths and acceptance tests.
- Run accessibility and responsive checks.
- Review visual hierarchy and feedback readability.
- Perform final content review against vault principles.

## Success Criteria

- A player can complete the entire game without instructions outside the page.
- All 18 stages provide specific, useful feedback for every choice.
- The player can explain at least three learned decision frames after completion.
- Strong, weak, borderline, and control-failure paths produce the intended outcome.
- Progress survives a normal page refresh.
- The game works locally on current desktop and mobile browsers.
- The result reads as a learning simulation, not an official employment forecast.

## Open Questions for Review

Recommended defaults are included so development can proceed after a simple approval.

1. **Language:** English UI with occasional Cantonese workplace phrases.  
   Recommended because the underlying work vocabulary is mostly English while the setting remains recognizably Hong Kong.
2. **Senior PO name:** use a fictional name and role label.  
   Recommended for privacy and to avoid implying a real person endorsed the scenarios.
3. **Score visibility:** show the permanent-role chance throughout.  
   Recommended because the user explicitly wants choices to increase or decrease the chance; capability bars keep it from becoming a one-number game.
4. **Ending:** exactly two employment outcomes, each with a nuanced debrief.  
   Recommended to honor the requested premise while acknowledging budget and organizational factors outside the player’s control.
5. **Hints:** no score penalty.  
   Recommended because the product is an educational rehearsal tool, not an exam.
6. **Stage navigation:** future stages locked; completed stages reviewable.  
   Recommended to preserve the learning arc and keep state logic simple.

## Appendix: Vault Context Used

Primary notes used to shape the plan:

- `aia-automation-coe-interview-onboarding-prep/career_roadmap_detailed.md`
  - BA → Senior BA → PO is a change in ownership, not just skill.
  - First-year priorities include reliability, quantified wins, evaluation methodology, contract check-ins, and visible business impact.
- `aia-automation-coe-interview-onboarding-prep/aia_3year_scenarios_v2.md`
  - The reporting line includes an Assistant Manager and Senior PO.
  - Early permanent conversion depends on first wins, ownership, visibility, and organizational conditions.
- `aia-automation-coe-interview-onboarding-prep/aia-automation-coe-interview-prep-pack.md`
  - Hands-on BA work, stakeholder conflict, AI chatbot routing, evaluation, UAT, and adoption.
- `Processes/first-two-weeks-80-20-onboarding.md`
  - Learn People, Problem, and Position before trying to know everything.
- `Processes/stakeholder-role-map-for-new-team.md`
  - Map decision makers, SMEs, and blockers by actual influence.
- `Processes/three-question-organizational-diagnosis.md`
  - Use Challenge, Goal, and Gap as a testable diagnosis.
- `Processes/problem-win-constraint-workflow.md`
  - Frame the problem, success condition, and limits before decomposing work.
- `Processes/how-to-respond-when-bu-has-the-idea.md`
  - Separate problem from proposed solution and make assumptions testable.
- `Digital Transformation & BA Career/business-analyst-mental-model.md`
  - Analyze outcome, people, process, rules, data, and technology.
- `Digital Transformation & BA Career/senior-ba-questioning-and-probing.md`
  - Ask questions to support a decision and close the loop.
- `Digital Transformation & BA Career/enterprise-stakeholder-management.md`
  - Pre-wire, facilitate, close, and escalate with options plus a recommendation.
- `Digital Transformation & BA Career/business-analysis-delivery-lifecycle.md`
  - Connect problem framing, AS-IS, TO-BE, requirements, UAT, adoption, and benefits review.

`Team Knowledge` and `Tools & Systems` contained no files at the time of planning, so they did not contribute scenario content.

Before implementation, use `plan-eng-review` to harden the state model, scoring tests, persistence behavior, and content validation.
