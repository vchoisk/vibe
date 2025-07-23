# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a minimal Turbo monorepo setup currently containing only the root configuration. The project uses:

- **Turbo**: Monorepo build system for task orchestration
- **Yarn**: Package manager (yarn.lock present)

## Development Commands

### Package Management
```bash
yarn install          # Install dependencies
```

### Turbo Commands
The project uses Turbo for build orchestration, though no specific tasks are currently configured in turbo.json.

```bash
npx turbo <command>    # Run turbo commands (when tasks are configured)
```

## Architecture Notes

- This appears to be a freshly initialized Turbo monorepo
- The turbo.json contains only schema reference, no build pipelines configured yet
- No applications or packages are currently present in the workspace
- Ready for expansion with apps/ and packages/ directories following Turbo conventions

## Current State

The repository is in its initial state with:
- Basic Turbo setup
- Minimal package.json with turbo as dev dependency
- Empty turbo.json configuration
- Standard LICENSE and README files

This setup is prepared for a monorepo structure but doesn't yet contain any applications or shared packages.