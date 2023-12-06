<h1 align="center" style="border-bottom: none;">🔬 🔭 cypress-multi-node</h1>
<h3 align="center">Bring Cypress End-2-End testing to the System Integration level over multiple nodes</h3>


## Why

## Installation

```bash
npm i -D cypress-system-integration
# or
yarn add -D cypress-system-integration
```

## Usage

### Cypress Plugin

Add this line to your project's `cypress/support/e2e.ts`:

```javascript
import 'cypress-system-integration';
```

### Orchestration Server

```
cd orchestrator
npm run start
```
Note: A docker container will be provided in the future.
