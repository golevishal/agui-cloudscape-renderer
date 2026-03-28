# AUI Cloudscape Renderer

A highly robust, reactive React application acting as the bridge between [A2UI Protocol](https://a2ui.org/) event streams and the native [AWS Cloudscape Design System](https://cloudscape.design/).

By ingesting strict JSON payloads defined by the Agent-User Interaction standard, this renderer recursively projects dynamic, enterprise-grade layouts, interactive surfaces, and data display utilities without writing rigid UI frameworks per feature. 

## Features

- **ProtocolBridge**: The brain of the operation. Parses inbound `A2UI_RENDER`, `ACTION_REQUIRED`, `STATE_DELTA`, and `TOOL_CALL_START` events and safely routes them to their matching presentation layer.
- **A2UIRenderer**: A recursive dictionary parser targeting the [A2UI v0.9 Basic Catalog Specification](https://a2ui.org/specification/v0_9/json/basic_catalog.json). Maps all native structural Layouts (`Row`, `Column`, `Tabs`, `Card`) and Primitives (`Text`, `TextField`, `Button`, `Divider`) 1:1 against their exact counterpart inside Cloudscape.
- **A2UITableRenderer**: High-performance data table constructor featuring intelligent column autogeneration, bidirectional pagination, sorting, and native "Status" string extrapolation converting `"Success"` or `"Pending"` strings directly to Cloudscape `<StatusIndicator>` symbols.
- **SurfaceRenderer**: An actionable bidirectional `<Container>` form capable of deploying complex user-feedback arrays alongside `USER_RESPONSE` stream emissions.
- **A2UIPropertyRedact**: Security module wrapping strings matching sensitive token metrics into a click-to-release `<ExpandableSection>`, protecting against shoulder surfing of exposed system keys.
- **Interactive Protocol Playground**: An internal development laboratory routed via `/playground`. Features a dual-panel visualization screen letting engineers directly alter JSON testing payloads in realtime across all 18 natively mapped A2UI UI interfaces to observe the structural behavior. 

## Architecture

Built atop standard Vite scaffolding integrating React 19, TypeScript, and `@cloudscape-design/components`.  

- `src/types/agui.ts`: Primary dictionary maintaining strictly typed data structures aligned to downstream backend Agent structures. 
- `src/hooks/useAgUiEvents.ts`: (Mock) Emulates simulated temporal delays mirroring websocket/SSE latency between AI analysis boundaries and structural delivery blocks. 

## Quick Start
Provide a fresh installation hook inside the environment:
```bash
# 1. Install precise application dependencies
npm install

# 2. Fire up the development server
npm run dev
```

Navigate the application:
- `localhost:5173/` - Live Agent temporal latency emulation.
- `localhost:5173/playground` - Static mapping JSON visualization testing suite.

## Development & Testing
The repository leverages `Vitest` executing isolated environment mounts asserting layout fidelity and form interactions. Standard strict-type checking applies.
```bash
# Lint checking alongside the Vitest integration suite
npm run lint && npm run test
```
