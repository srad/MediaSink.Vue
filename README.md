# MediaSink.Vue

[![Build Status](https://teamcity.sedrad.com/app/rest/builds/buildType:(id:MediaSinkVue_Build)/statusIcon)](https://teamcity.sedrad.com/viewType.html?buildTypeId=MediaSinkVue_Build&guest=1)
 
## Project Setup

```sh
pnpm install
pnpm approve-builds # for pnpm 10+
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm test:unit
```

### Run End-to-End Tests with [Nightwatch](https://nightwatchjs.org/)

```sh
# When using CI, the project must be built first.
pnpm build

# Runs the end-to-end tests
pnpm test:e2e
# Runs the tests only on Chrome
pnpm test:e2e --env chrome
# Runs the tests of a specific file
pnpm test:e2e tests/e2e/example.ts
# Runs the tests in debug mode
pnpm test:e2e --debug
```
    
### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```
