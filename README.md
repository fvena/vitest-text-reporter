<br /><!-- markdownlint-disable-line -->

<p align="right">
  <a href="https://github.com/fvena/typescript-library-template-pro">
    ⭐ &nbsp;&nbsp;<strong>Star this template if you find it useful</strong> ↗️
  </a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/fvena/typescript-library-template-pro/main/docs/public/logo.png" alt="TypeScript Library Template Pro Logo" width="180"/>

  <h1 align="center">TypeScript Library Template Pro</h1>
  <div align="center">A modern, professional template for building robust TypeScript libraries with zero configuration.</div>
</p>

<br/>

<div align="center">

<!-- markdownlint-disable MD042 -->

![GitHub package.json version](https://img.shields.io/github/package-json/v/fvena/typescript-library-template-pro)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Build Status](https://github.com/fvena/typescript-library-template-pro/workflows/CI%2FCD/badge.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

<!-- markdownlint-enable MD042 -->

</div>

## Why This Template?

Stop wasting days on boilerplate setup and **focus on what matters - your library code**:

- **Instant Setup**: Start coding your library in less than 5 minutes
- **Developer Experience**: Hot reloading, type checking and fast testing
- **Battle-tested Tools**: Pre-configured ESLint, Prettier, Vitest, Husky, and more
- **Future-proof**: ESM & CommonJS support, full TypeScript strictness
- **Automated Everything**: From linting to releases to documentation
- **Playground**: A playground for testing your library

<div align="center">
  <img src="https://raw.githubusercontent.com/fvena/typescript-library-template-pro/main/docs/public/preview.png" alt="Workflow Visualization" width="700"/>
</div>

## Key Features

- **TypeScript First**: Full support for modern TypeScript with strict typing
- **Dual Package**: Outputs both ESM and CommonJS formats
- **Optimized Build**: Lightning-fast builds with [Tsup](https://tsup.egoist.dev)
- **Code Quality**: Pre-configured [ESLint](https://eslint.org) and [Prettier](https://prettier.io)
- **Testing Ready**: Unit testing with [Vitest](https://vitest.dev)
- **Git Hooks**: Enforced commit standards with [Commitlint](https://commitlint.js.org) and [Husky](https://typicode.github.io/husky/)
- **Documentation**: Beautiful docs with [Vitepress](https://vitepress.dev)
- **CI/CD**: GitHub Actions for testing, publishing and deploying
- **Semantic Release**: Automated versioning and changelog generation

## Quick Start in 3 Steps

### 1. Create Your Project

You can start using this template by clicking the green **"Use this template"** button on GitHub or by **cloning the repository**:

```bash
# Clone the repository
git clone https://github.com/fvena/typescript-library-template-pro.git your-library-name
cd your-library-name

# Install dependencies
npm install
```

### 2. Configure Your Project

Customize your project details before development:

- **Project Metadata**: Update `package.json` (name, version, author, etc.)
- **License**: Edit `LICENSE` with your details
- **Docs Configuration**: Update `docs/.vitepress/config.ts` (set `base` to repo name)

Optional (Recommended for Publishing):

- **GitHub Secrets**: Add `GH_TOKEN` and `NPM_TOKEN` for releases
- **Enable GitHub Pages**: Set GitHub Actions as the source for GitHub Pages

### 3. Start Developing

```bash
npm run dev          # Development mode with auto-rebuild
npm run playground   # Start the playground
npm test             # Run tests
npm run doc:dev      # Preview documentation
```

## Deployment & Publishing

The deployment process is **fully automated** with GitHub Actions.

1. Use Conventional Commits (feat:, fix:, etc.)
2. Push to `main`
3. GitHub Actions will:
   - Run tests & linting
   - Update version & changelog
   - Publish to NPM (if configured)
   - Deploy docs (if enabled)

## Complete Documentation

For detailed instructions on setup, customization, and advanced features, visit our <a href="https://fvena.github.io/typescript-library-template-pro/" target="_blank">📘 documentation site</a>.

**Popular Sections**

- **[Getting Started Guide](https://fvena.github.io/typescript-library-template-pro/guide/getting-started.html)**: Step-by-step setup instructions
- **[Development Workflow](https://fvena.github.io/typescript-library-template-pro/guide/development-workflow.html)**: Best practices for smooth coding
- **[Testing Strategies](https://fvena.github.io/typescript-library-template-pro/guide/testing-strategies.html)**: Unit testing, debugging, and CI
- **[Build & Configuration](https://fvena.github.io/typescript-library-template-pro/guide/build-configuration.html)**: Customizing the output format
- **[Release Process](https://fvena.github.io/typescript-library-template-pro/guide/release-process.html)**: Learn how versioning and publishing work

## Need Help?

- **Check the FAQs**: Common questions are answered in the [documentation](https://fvena.github.io/typescript-library-template-pro/)
- **Open an Issue**: For bugs or feature requests
- **Contribute**: PRs are welcome! See our contribution guidelines

## License

This template is [MIT licensed](./LICENSE) - use it freely for personal and commercial projects.

---

<p align="center">
  Your ⭐ motivates continued development and maintenance
</p>
