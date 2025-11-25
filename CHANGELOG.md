# Change Log

All notable changes to the "doc-generator" extension will be documented in this file.

## [0.0.5] - 19/11/2025
- Added "KU Javadoc: Open Setup" walkthrough entry and welcome view so new users can find the guided experience.
- Introduced onboarding webview with validation for name, API key, endpoint, and model plus quick link to OpenRouter keys.
- Extension now prompts to open the setup panel when no API key is configured and offers the same action from Javadoc generation errors.
- README updated with the first-time setup instructions reflecting the new workflow.

## [0.0.4] - 18/11/2025
- Fixed issue with Javadoc generation for methods with complex parameters.
- Improved performance of Javadoc generation.
- Added name for @author tag in generated comments in the settings.
- UI Improvements:
  - Added loading indicator while generating Javadoc comments.
  - Added first-run guided setup command and walkthrough to collect name, API key, endpoint, and model.

- Plan Update:
  - First installation experience panel to set up author name and API key.

## [0.0.3] - 18/11/2025
- Added toolbar button for generating Javadoc comments.
- Updated README.
- Improved prompt design to prevent renaming or removing code elements.
- Fixed minor bugs related to API endpoint configuration.
- Restuructured code for better maintainability.

## [Unreleased]

- Initial release