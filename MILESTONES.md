## Milestones – Multilingual Roadmap

### 1. Core refactor for language-agnostic pipeline
- Abstract parser/prompt logic so the generation command can select language specific templates.
- Introduce a `language` metadata provider to inspect the active file and load the proper rule set.
- Expand configuration schema to store per-language defaults (model/endpoint overrides, style rules).
- Add regression tests covering Java plus a placeholder "mock language" to ensure abstraction works.

### 2. Pilot support for TypeScript & JavaScript
- Ship curated prompts for TSDoc/JSDoc, including `@param`, `@returns`, and `@remarks` conventions.
- Detect `.ts`/`.tsx`/`.js`/`.jsx` files and surface the same context menu and toolbar actions.
- Provide preview transformers that keep existing comments while upgrading them to TSDoc format.
- Gather telemetry (opt-in) on generation duration/errors to tune prompt and rate limits.

### 3. Python docstring generation
- Allow users to pick preferred docstring style (Google, NumPy, Sphinx) via settings/onboarding.
- Handle function/class/module docstrings with indentation-sensitive edits.
- Add formatting safeguards to respect existing type hints and decorators.
- Create dedicated walkthrough content describing how to set up Python providers/models.

### 3.5 Language-specific profiles
- Introduce `profiles.<language>` configuration objects to store endpoint, model, temperature, and style overrides per language.
- Update onboarding webview to create/edit/switch profiles and migrate existing Java settings automatically.
- Expose commands/status bar indicators for selecting the active profile per language and per workspace.
- Add resolver tests to guarantee the correct config cascade (global -> language default -> profile override).

### 4. Enterprise-ready batch processing
- Extend file-selection command to queue mixed language batches and render per-language progress.
- Offer dry-run mode that previews diff chunks before applying changes.
- Introduce workspace level policies (e.g, disallow touching generated files) configurable via `settings.json`.
- Document CI recommendations for verifying generated docs using language-specific linters.

### 5. Ecosystem integrations
- VSCode task providers for mass documentation runs triggered from launch/config files.
- API surface for other extensions to request language-aware doc generation programmatically.
- Explore GitHub Action/workflow template using the shared prompt library for PR checks.
