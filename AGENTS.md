# Contributor Guidelines

This project is a small React single page application. The following guidelines apply to all pull requests.

## Setup
- Run `npm install` before starting development to install dependencies.
- Start the development server with `npm run dev`.
- Build production files with `npm run build`.
- Execute unit tests with `npm test`.

## Development
- For every non-trivial change you must add or update tests.
- Run the full test suite (`npm test`) and ensure it passes before creating a pull request.
- All tables in the UI must be sortable and filterable. Users should be able to show/hide columns and the UI state (sort order, column visibility, etc.) must persist between sessions.
- Tables must support exporting their data as JSON, CSV/TSV and Markdown.
- The application must be easily localizable. Provide English and Estonian translations for all strings and keep translations in sync when modifying the UI.
- Update `spec.md` whenever the overall concept of the app changes or when you introduce major implementation changes.

These instructions apply to all files in this repository.
