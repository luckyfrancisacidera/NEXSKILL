# ATS Scoring Rubric

## Purpose
This document explains how the ATS scoring system calculates a candidate match score, which metrics it uses, how evidence is mapped, and how values in `appsettings.json` affect the result.

The implementation is primarily in:

- `server/SkillSense.Application/Services/Scoring/ResumeEmbeddingScoringOrchestrator.cs`
- `server/SkillSense.Api/appsettings.json`

Important: `appsettings.json` does not contain the full scoring rubric. It overrides only some settings. Many scoring controls fall back to defaults defined in `AtsScoringConfig` inside the orchestrator.

## High-Level Flow
The scorer follows this pipeline:

1. Collect candidate evidence from the parsed resume.
2. Match job required skills and preferred skills against resume evidence.
3. Match job responsibilities against resume evidence.
4. Match job description chunks against resume evidence.
5. Score education and years of experience with rule-based logic.
6. Build an implementation-evidence signal from work and project proof.
7. Blend section scores into a weighted base score.
8. Apply calibration, strong-match boosts, and gap penalties.
9. Convert the result to a `0..100` final ATS score.

## Evidence Sources
The scorer pulls evidence from these resume areas:

- `skills`
- `work_experience[*].technologies`
- `work_experience[*].bullets`
- `projects[*].technologies`
- `projects[*].bullets`
- `projects[*].description`
- `certifications[*].name`
- `summary`

These sources do not all carry equal weight. Work-experience and project evidence are treated as stronger than summary-only evidence.

## Match Types and Mapping
For each job skill or text chunk, the engine tries to match evidence in a layered order from strongest to weakest.

### 1. Exact Match
An exact match happens after normalization. The scorer lowercases text and removes spaces and periods for the exact-skill key.

Examples:

- `React` -> `react`
- `ASP.NET Core` -> `aspnetcore`

Exact matches are the most trusted signals.

### 2. Alias Match
If exact matching fails, the scorer canonicalizes a term through the alias map.

Examples:

- `RESTful API Design` can map toward `rest api`
- alternate spellings or naming variants can collapse into one canonical term

Alias matches are slightly weaker than exact matches, but still strong.

### 3. Related-Cluster Match
If there is no exact or alias hit, the scorer checks whether the candidate evidence belongs to the same capability family.

Examples of capability clusters defined in code:

- `database_relational`
- `api_backend`
- `auth_security`
- `frontend_web`
- `performance_backend`
- `devops_versioning`

Examples:

- `SQL Server`, `PostgreSQL`, and `MySQL` can map into a relational-database cluster
- `JWT`, `RBAC`, and `authentication` can map into an auth/security cluster

This is called `related_cluster` matching.

### 4. Semantic Match
If no stronger lexical or cluster signal wins, the scorer uses embedding similarity.

This semantic matching is many-to-many, not just single-best-hit matching. The scorer ranks multiple candidate evidence items and combines the top results with decay.

### 5. Rule Fallback
If no real evidence is found, the scorer emits a `rule` result with no meaningful match evidence. These fallback items are mostly placeholders so the scoring pipeline still has a complete match list.

## Step-by-Step Score Construction

### Step 1. Required and Preferred Skill Matching
The scorer builds matches for:

- `job.RequiredSkills`
- `job.PreferredSkills`

Each skill can end up as one of these match types:

- `exact`
- `alias`
- `related_cluster`
- `semantic_many_to_many`
- `rule`

Each accepted match stores:

- the matched JD item
- the best resume evidence
- the source path
- similarity
- match type
- match reason
- evidence counts
- depth multiplier
- final match confidence

### Step 2. Supporting Evidence and Depth Bonus
After a primary match is found, the scorer looks for additional supporting evidence across the resume.

It then applies:

- diminishing-return support bonuses
- evidence-type diversity bonuses
- a capped depth multiplier

This prevents one repeated keyword from inflating the score too much while still rewarding corroborated evidence from multiple places.

### Step 3. Skill Aggregation
Required and preferred skills are scored separately, then blended.

The skill aggregate uses:

- match quality
- coverage ratio
- evidence confidence
- strong-match bonuses
- exact-match bonus
- alias-match bonus

Conceptually:

`skill score = quality + coverage + confidence + bonuses`

Then:

`skillsScore = requiredScore * RequiredSkillsBlend + preferredScore * PreferredSkillsBlend`

Finally the result is capped by `SkillsScoreCeiling`.

With current app settings:

- required contributes `0.90`
- preferred contributes `0.10`
- final skills score is capped at `0.90`

### Step 4. Responsibility Scoring
Responsibilities are scored differently from skills.

The scorer evaluates:

- top-match quality
- coverage above a similarity floor
- momentum across the top responsibility matches
- relevant-match ratio
- strong-match ratio

This creates a responsibility score that rewards both quality and breadth, not just isolated high-similarity bullets.

The final result is capped by `ResponsibilitiesScoreCeiling`.

### Step 5. Description Scoring
The job description is chunked and matched against resume evidence.

The description score uses:

- weighted chunk quality
- chunk coverage
- strong chunk coverage

If a match is supported only by summary text and not corroborated by stronger non-summary evidence, it is discounted.

This is controlled by:

- `DescriptionCorroborationThreshold`
- `SummaryOnlyDescriptionPenaltyScale`

The final result is capped by `DescriptionScoreCeiling`.

### Step 6. Education Scoring
Education is rule-based, not semantic.

The scorer ranks education requirements as:

- doctorate/phd = `4`
- master = `3`
- bachelor = `2`
- associate/diploma = `1`
- unknown/none = `0`

If the candidate meets or exceeds the minimum level, education score is `1.0`. Otherwise it is `0.0`.

### Step 7. Years of Experience Scoring
Years of experience are also rule-based, but with a soft curve instead of a hard fail.

Logic:

- if no minimum years are required, score = `1.0`
- if candidate meets or exceeds required years, score = `1.0`
- if candidate has zero usable experience, score = `YearsExperienceZeroExperienceFloor`
- otherwise a softened partial score is computed using:
  - `YearsExperiencePartialFloor`
  - `YearsExperienceCurveExponent`

Near misses can receive a high minimum floor if they are close enough to the requirement:

- `YearsNearMissBufferYears`
- `YearsNearMissFloor`

This is why candidates slightly under the requirement can still score strongly in the years section.

### Step 8. Work Experience Score
The work-experience score is not scored independently from scratch. It is blended from other signals:

`baseWorkScore = responsibilitiesScore * WorkScoreResponsibilityBlend + descriptionScore * WorkScoreSummaryBlend + requiredScore * WorkScoreRequiredSkillsBlend`

Then implementation evidence can raise it further:

`implementationAdjustment = max(0, implementationEvidenceOverall - baseWorkScore) * WorkScoreImplementationBlend`

`workScore = baseWorkScore + implementationAdjustment`

The work score is capped by `WorkScoreCeiling`.

This means work experience is really a synthesis of:

- responsibility alignment
- description alignment
- required-skill proof
- implementation proof from work and projects

## Implementation Evidence
Implementation evidence is a separate signal that checks whether the resume shows hands-on delivery rather than only keyword presence.

The scorer groups evidence into buckets:

- work evidence
- project evidence
- supporting evidence

Each bucket uses:

- similarity quality
- match type quality
- source strength
- distinct JD coverage
- evidence diversity bonuses

The overall implementation score blends those buckets and can be more favorable to projects for junior candidates.

This is why project-heavy junior candidates can still score fairly when the project evidence is concrete and technically aligned.

## Final Score Formula
After all section scores are computed, the scorer normalizes the configured section weights and computes:

`weightedBaseScore = sum(sectionScore * normalizedSectionWeight)`

Then it calibrates the weighted base:

`calibratedBaseScore = 1 - (1 - weightedBaseScore) ^ BaseScoreExponent`

Then it adds boosts and subtracts penalties:

`finalScore = (calibratedBaseScore + strongMatchBoost - totalPenalty) * 100`

The final score is clamped to `0..100`.

## Strong-Match Boosts
Small boosts can be added when the candidate is strong across important sections.

Boost sources include:

- work score above `StrongMatchThreshold`
- skills score above `StrongMatchThreshold`
- responsibilities score above `StrongMatchThreshold`
- description score above `StrongMatchThreshold`
- strong required-skill coverage
- strong implementation evidence
- combined strength in both skills and responsibilities

All boosts are capped by `MaxBoost`.

## Penalties
The scorer can subtract penalties for:

- missing minimum education
- missing minimum years of experience

Years penalties are softened when the candidate is close to the requirement or has strong implementation/project evidence.

The years penalty relief considers:

- near-miss proximity
- implementation evidence strength
- project evidence strength
- low required-years jobs
- existing years score strength

All penalties are capped by `MaxPenalty`.

## Recruiter Stage Mapping
The ATS score also affects recruiter workflow status.

In `ApplicantRecommendationPolicy`:

- candidates with score `>= 50` become `Recommended`
- candidates below `50` remain in `Completed` unless another stage already applies

This is a workflow threshold, not part of the scoring formula itself.

## Current `appsettings.json` Rubric
The current API config exposes these rubric values:

### Section Weights
- `WorkExperienceWeight = 0.18`
- `SkillsWeight = 0.41`
- `ResponsibilitiesWeight = 0.23`
- `SummaryWeight = 0.07`
- `EducationWeight = 0.03`
- `YearsExperienceWeight = 0.07`

These define how much each section contributes to the weighted base score before normalization.

### Section Ceilings
- `SkillsScoreCeiling = 0.90`
- `ResponsibilitiesScoreCeiling = 0.85`
- `DescriptionScoreCeiling = 0.82`
- `WorkScoreCeiling = 0.87`

These cap the maximum influence of each section.

### Skill Blending
- `RequiredSkillsBlend = 0.90`
- `PreferredSkillsBlend = 0.10`

These define how the total skills score is split between required and preferred skills.

### Work-Score Blending
- `WorkScoreResponsibilityBlend = 0.52`
- `WorkScoreSummaryBlend = 0.04`
- `WorkScoreRequiredSkillsBlend = 0.43`

These control how the work section is synthesized from other signals.

### Semantic Matching
- `SemanticSkillThreshold = 0.64`
- `SemanticEvidenceTopK = 2`
- `SemanticEvidenceDecay = 0.75`
- `SemanticEvidenceStrongThreshold = 0.78`
- `SemanticEvidenceCoverageBonusMax = 0.04`
- `SemanticLexicalBlendWeight = 0.30`

These control when semantic evidence is accepted and how multiple semantic matches are aggregated.

`SemanticEvidenceDecay` is especially important:

- first top semantic match gets full weight
- second gets multiplied by `0.75`
- later items continue decaying by the same factor

This rewards multiple aligned pieces of evidence without letting weaker later matches dominate.

### Description Controls
- `DescriptionCorroborationThreshold = 0.58`
- `SummaryOnlyDescriptionPenaltyScale = 0.72`

These reduce description score when the signal exists only in the summary and is not backed by better evidence elsewhere.

### Skill Neutral Floors and Coverage Weights
- `RequiredSkillMissingFloor = 0.24`
- `RequiredSkillsNeutralScore = 0.36`
- `PreferredSkillsNeutralScore = 0.48`
- `RequiredSkillCoverageWeight = 0.36`
- `PreferredSkillCoverageWeight = 0.28`
- `RequiredSkillStrongMatchBonusMax = 0.08`
- `SkillEvidenceConfidenceWeight = 0.16`
- `SkillSimilarityWeight = 0.68`
- `SkillEvidenceConfidenceSignalWeight = 0.20`
- `SkillMatchTypeSignalWeight = 0.12`
- `ExactMatchScoreBonusMax = 0.04`
- `AliasMatchScoreBonusMax = 0.02`

These control the internal skill-quality formula.

### Responsibility Controls
- `ResponsibilityRelevantThreshold = 0.62`
- `ResponsibilityStrongThreshold = 0.78`
- `ResponsibilityQualityWeight = 0.42`
- `ResponsibilityCoverageWeight = 0.34`
- `ResponsibilityMomentumWeight = 0.14`
- `ResponsibilityQualityWindowRatio = 0.80`
- `ResponsibilityCoverageFloor = 0.48`
- `ResponsibilityRelevantMatchBonusMax = 0.04`
- `ResponsibilityStrongMatchBonusMax = 0.06`
- `MissingResponsibilitiesNeutralScore = 0.55`

These control how responsibility evidence is aggregated.

### Description Neutral Score
- `MissingSummaryNeutralScore = 0.55`

This is the fallback description score when the JD does not provide useful description chunks.

### Strong-Match Boosts
- `StrongMatchThreshold = 0.78`
- `StrongExperienceBoost = 0.015`
- `StrongSkillsBoost = 0.025`
- `StrongResponsibilitiesBoost = 0.02`
- `StrongSummaryBoost = 0.01`
- `CombinedStrongMatchBoost = 0.01`
- `StrongCoverageThreshold = 0.85`
- `CoverageBoostMax = 0.01`
- `MaxBoost = 0.05`

These define how much extra reward is available for strong profiles.

### Penalties and Years Calibration
- `EducationGapPenalty = 0.01`
- `ExperienceGapPenaltyScale = 0.015`
- `ExperienceGapPenaltyExponent = 1.5`
- `MaxPenalty = 0.03`
- `YearsExperiencePartialFloor = 0.45`
- `YearsExperienceZeroExperienceFloor = 0.25`
- `YearsNearMissFloor = 0.94`
- `YearsExperienceCurveExponent = 0.65`

These define how years and education shortfalls affect the final result.

### Final Base Calibration
- `BaseScoreExponent = 1.08`

This slightly lifts stronger weighted bases instead of keeping the score perfectly linear.

## Important Code-Default Settings Not Present in `appsettings.json`
The implementation also uses important settings that are currently not listed in the JSON file, including:

- `WorkScoreImplementationBlend`
- implementation-evidence bucket weights
- junior-project evidence shifts
- semantic floors and ceilings
- exact/alias confidence defaults
- related-cluster coverage weights and support caps
- responsibility semantic blend weights
- description chunk thresholds
- implementation-evidence minimum semantic threshold
- implementation-based years-penalty relief settings
- `YearsNearMissBufferYears`
- `StrongImplementationBoost`
- `ImplementationStrongThreshold`

Because of this, documenting only `appsettings.json` would not fully describe the live rubric.

## Practical Interpretation
In practice, the scorer favors candidates who:

- match required skills strongly
- show evidence in work bullets, work technologies, or projects
- cover several responsibilities rather than one isolated bullet
- have corroborated evidence across multiple resume areas
- are close to required years, especially when project/work proof is strong

It penalizes candidates who:

- only mention relevant terms in a summary
- rely on weak semantic similarity without implementation evidence
- miss required experience or education with little compensating proof
- repeat the same evidence instead of showing diverse corroboration

## Recommended Maintenance Notes
When tuning the rubric:

- change section weights only if the product wants a real priority shift
- adjust semantic thresholds carefully because they affect both recall and false positives
- prefer small boost and penalty changes because they stack on top of the weighted base
- test junior, near-miss, semantic-only, and project-heavy resumes after any rubric change
- keep the code defaults and JSON overrides documented together

## Reference Files
- `server/SkillSense.Application/Services/Scoring/ResumeEmbeddingScoringOrchestrator.cs`
- `server/SkillSense.Api/appsettings.json`
- `server/SkillSense.Application/Common/Recruiter/ApplicantRecommendationPolicy.cs`
- `server/SkillSense.Application/Contracts/Response/AtsScoreResponse.cs`
