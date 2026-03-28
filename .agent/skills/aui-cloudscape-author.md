---
name: aui-cloudscape-author
description: Design patterns and JSON templates for authoring A2UI payloads that render idiomatically in the AUI-Cloudscape-Renderer.
---

# AUI-Cloudscape Authoring Guide

You are an agent writing **A2UI JSON payloads** that will be rendered by the **AUI-Cloudscape-Renderer** — a React engine that maps the AG-UI / A2UI protocol to [AWS Cloudscape Design System](https://cloudscape.design) components.

This skill teaches you how to construct payloads that look native, professional, and production-grade inside a Cloudscape `AppLayout`.

---

## 1. Protocol Fundamentals

### 1.1 Event Types

Every payload you emit must be wrapped in one of these AG-UI event envelopes:

| Event Type          | Purpose                                     | Renders As                            |
| ------------------- | ------------------------------------------- | ------------------------------------- |
| `A2UI_RENDER`       | Display a UI component tree                 | Catalog components, Table, or Redact  |
| `ACTION_REQUIRED`   | Prompt the user for input (HITL)            | Cloudscape Form with validation       |
| `STATE_DELTA`       | Show transient agent status                 | Cloudscape `Alert` (info)             |
| `TOOL_CALL_START`   | Indicate a tool is executing                | Cloudscape `StatusIndicator` (loading)|
| `TOOL_CALL_END`     | Signal tool completion                      | (silent; updates TraceSidebar)        |
| `DATA_MODEL_UPDATE` | Merge data into the reactive state store    | (invisible; updates bound components) |

### 1.2 Multi-Surface Targeting

Every event payload accepts an optional `surface` field. This controls **where** in the Cloudscape `AppLayout` the UI renders:

| Surface ID     | AppLayout Slot  | Use Case                                |
| -------------- | --------------- | --------------------------------------- |
| `"main"`       | `content`       | Primary content area (default)          |
| `"tools"`      | `tools` panel   | Side panels, trace views, secrets       |
| `"navigation"` | `navigation`    | Override the sidebar navigation         |

If `surface` is omitted, it defaults to `"main"`.

```json
{
  "type": "A2UI_RENDER",
  "payload": {
    "surface": "tools",
    "componentName": "PropertyRedact",
    "label": "Deployment Token",
    "content": "sec-awsx-299388-abcd"
  }
}
```

### 1.3 Reactive Data Binding

Text properties that start with `$/` or `#/` are **JSON Pointers** into the reactive state store. When a `DATA_MODEL_UPDATE` arrives, only the bound components re-render.

```json
[
  {
    "type": "DATA_MODEL_UPDATE",
    "payload": { "deployment": { "status": "Configuring networking...", "pct": "45%" } }
  },
  {
    "type": "A2UI_RENDER",
    "payload": {
      "rootId": "root",
      "components": {
        "root": { "component": "Column", "children": ["title", "status", "pct"] },
        "title": { "component": "Text", "variant": "h2", "text": "Live Deployment" },
        "status": { "component": "Text", "variant": "body", "text": "$/deployment/status" },
        "pct": { "component": "Text", "variant": "h1", "text": "$/deployment/pct" }
      }
    }
  }
]
```

---

## 2. Component Catalog Reference

### 2.1 A2UI Catalog Components (Recursive Tree)

These use the `A2UI_RENDER` event with a `rootId` + `components` map. Each component is keyed by a unique ID, and parent components reference children by those IDs.

#### Layout Components

| Component      | Cloudscape Mapping        | Key Properties                                   |
| -------------- | ------------------------- | ------------------------------------------------ |
| `Text`         | `Box` (variant mapped)    | `text`, `variant` (h1–h5, caption, body)         |
| `Image`        | `<img>`                   | `url`, `description`, `fit`                      |
| `Icon`         | `Icon`                    | `name` (Cloudscape icon name or `{path: "..."}`) |
| `Row`          | `SpaceBetween` horizontal | `children[]`                                     |
| `Column`       | `SpaceBetween` vertical   | `children[]`                                     |
| `List`         | `SpaceBetween` vertical   | `children[]`                                     |
| `Card`         | `Container`               | `child` (single child ID)                        |
| `Tabs`         | `Tabs`                    | `tabs[{title, child}]`                           |
| `Modal`        | `Modal`                   | `trigger` (child ID), `content` (child ID)       |
| `Divider`      | `<hr>`                    | `axis` (horizontal/vertical)                     |

#### Interactive Components

| Component      | Cloudscape Mapping | Key Properties                                                    |
| -------------- | ------------------ | ----------------------------------------------------------------- |
| `Button`       | `Button`           | `child` (label text ID), `variant` (default, primary, borderless) |
| `TextField`    | `Input`            | `label`, `value`, `variant`, `validationRegexp`                   |
| `CheckBox`     | `Checkbox`         | `label`, `value` (boolean)                                        |
| `ChoicePicker` | `Select`           | `label`, `options[{label,value}]`, `value[]`                      |
| `DateTimeInput`| `DatePicker`       | `value` (ISO string), `min`, `max`, `label`                      |

### 2.2 Legacy Direct-Mapped Components

These use `A2UI_RENDER` with a `componentName` field instead of `rootId`:

#### Table
Renders a full-featured Cloudscape `Table` with filtering, sorting, and pagination.

```json
{
  "type": "A2UI_RENDER",
  "payload": {
    "componentName": "Table",
    "headers": ["InstanceId", "Type", "Status"],
    "rows": [
      { "InstanceId": "i-0abc123", "Type": "t3.micro", "Status": "Success" },
      { "InstanceId": "i-0def456", "Type": "m5.large", "Status": "Failed" }
    ]
  }
}
```

> **Tip**: The renderer auto-detects `Status` columns and renders them as `StatusIndicator`. Values containing "success", "fail", "pending", or "warn" get appropriate colors automatically.

#### PropertyRedact
Renders sensitive content behind a click-to-expand panel.

```json
{
  "type": "A2UI_RENDER",
  "payload": {
    "componentName": "PropertyRedact",
    "label": "AWS Secret Key",
    "content": "AKIAIOSFODNN7EXAMPLE"
  }
}
```

---

## 3. Human-in-the-Loop (HITL) Forms

Use `ACTION_REQUIRED` to collect validated input from the user. The renderer **blocks submission** until all validation rules pass.

### 3.1 Field Types & Validation Rules

```json
{
  "type": "ACTION_REQUIRED",
  "payload": {
    "formId": "unique-form-id",
    "title": "Form Title",
    "description": "Optional description shown above fields.",
    "fields": [
      {
        "type": "string",
        "name": "fieldName",
        "label": "Human-Readable Label",
        "required": true,
        "defaultValue": "pre-filled",
        "pattern": "^[a-zA-Z][a-zA-Z0-9-]*$",
        "minLength": 3,
        "maxLength": 64,
        "constraintText": "Shown below the field as a hint.",
        "errorMessage": "Custom override for validation failure."
      },
      {
        "type": "enum",
        "name": "region",
        "label": "Region",
        "options": ["us-east-1", "eu-west-1", "ap-southeast-1"],
        "required": true,
        "defaultValue": "us-east-1"
      },
      {
        "type": "boolean",
        "name": "confirm",
        "label": "I acknowledge this is a destructive action",
        "required": true,
        "errorMessage": "You must acknowledge before proceeding."
      }
    ]
  }
}
```

### 3.2 Validation Behavior

| Rule           | Applies To       | Behavior                                                  |
| -------------- | ---------------- | --------------------------------------------------------- |
| `required`     | string, enum     | Empty/whitespace-only ⟹ error                            |
| `required`     | boolean          | Unchecked ⟹ error                                        |
| `minLength`    | string           | Character count < min ⟹ error                            |
| `maxLength`    | string           | Character count > max ⟹ error                            |
| `pattern`      | string           | Tests `new RegExp(pattern)` against value                 |
| `constraintText` | all            | Preventive hint shown below field (before any error)      |
| `errorMessage` | all              | Custom override for the default error message             |

- Errors are **live-cleared** as the user fixes each field.
- The `USER_RESPONSE` event is **only emitted when all fields pass**.

---

## 4. Design Patterns

### 4.1 The Dashboard Card

A typical status dashboard with a card containing a vertical stack of information.

```json
{
  "type": "A2UI_RENDER",
  "payload": {
    "rootId": "dashboard",
    "components": {
      "dashboard": { "component": "Column", "children": ["header", "statusCard", "actions"] },
      "header": { "component": "Text", "variant": "h1", "text": "System Dashboard" },
      "statusCard": { "component": "Card", "child": "cardContent" },
      "cardContent": { "component": "Column", "children": ["metric1", "divider1", "metric2"] },
      "metric1": { "component": "Row", "children": ["m1Label", "m1Value"] },
      "m1Label": { "component": "Text", "variant": "body", "text": "CPU Utilization" },
      "m1Value": { "component": "Text", "variant": "h2", "text": "42%" },
      "divider1": { "component": "Divider" },
      "metric2": { "component": "Row", "children": ["m2Label", "m2Value"] },
      "m2Label": { "component": "Text", "variant": "body", "text": "Memory" },
      "m2Value": { "component": "Text", "variant": "h2", "text": "8.2 GB / 16 GB" },
      "actions": { "component": "Row", "children": ["refreshBtn", "detailsBtn"] },
      "refreshBtn": { "component": "Button", "child": "refreshText", "variant": "primary" },
      "refreshText": { "component": "Text", "text": "Refresh" },
      "detailsBtn": { "component": "Button", "child": "detailsText", "variant": "default" },
      "detailsText": { "component": "Text", "text": "View Details" }
    }
  }
}
```

### 4.2 The Governance Table

A compliance-grade resource table with status indicators, built-in filtering and pagination.

```json
{
  "type": "A2UI_RENDER",
  "payload": {
    "componentName": "Table",
    "headers": ["ResourceId", "Service", "Region", "Compliance", "Status"],
    "rows": [
      { "ResourceId": "arn:aws:s3:::prod-bucket", "Service": "S3", "Region": "us-east-1", "Compliance": "HIPAA", "Status": "Success" },
      { "ResourceId": "arn:aws:ec2:us-west-2:123456:i/abc", "Service": "EC2", "Region": "us-west-2", "Compliance": "SOC2", "Status": "Pending" },
      { "ResourceId": "arn:aws:rds:eu-west-1:123456:db/main", "Service": "RDS", "Region": "eu-west-1", "Compliance": "PCI-DSS", "Status": "Failed" }
    ]
  }
}
```

### 4.3 The Tabbed Detail View

Organize complex output into tabs — each tab can contain any component tree.

```json
{
  "type": "A2UI_RENDER",
  "payload": {
    "rootId": "details",
    "components": {
      "details": { "component": "Column", "children": ["title", "tabGroup"] },
      "title": { "component": "Text", "variant": "h1", "text": "Instance i-0abc123" },
      "tabGroup": { "component": "Tabs", "tabs": [
        { "title": "Overview", "child": "overviewContent" },
        { "title": "Networking", "child": "networkContent" },
        { "title": "Security", "child": "securityContent" }
      ]},
      "overviewContent": { "component": "Column", "children": ["ownerRow", "typeRow"] },
      "ownerRow": { "component": "Row", "children": ["ownerLabel", "ownerVal"] },
      "ownerLabel": { "component": "Text", "variant": "caption", "text": "Owner" },
      "ownerVal": { "component": "Text", "text": "platform-team@corp.com" },
      "typeRow": { "component": "Row", "children": ["typeLabel", "typeVal"] },
      "typeLabel": { "component": "Text", "variant": "caption", "text": "Instance Type" },
      "typeVal": { "component": "Text", "text": "m5.xlarge" },
      "networkContent": { "component": "Column", "children": ["vpcText", "subnetText"] },
      "vpcText": { "component": "Text", "text": "VPC: vpc-0abc123 (10.0.0.0/16)" },
      "subnetText": { "component": "Text", "text": "Subnet: subnet-0def456 (10.0.1.0/24)" },
      "securityContent": { "component": "Card", "child": "sgText" },
      "sgText": { "component": "Text", "text": "Security Group: sg-0xyz789 — Inbound: 443/tcp, 80/tcp" }
    }
  }
}
```

### 4.4 The Confirmation Gate

Use a modal to force an explicit confirmation before proceeding with a destructive action.

```json
{
  "type": "A2UI_RENDER",
  "payload": {
    "rootId": "gate",
    "components": {
      "gate": { "component": "Column", "children": ["warning", "confirmModal"] },
      "warning": { "component": "Text", "variant": "h3", "text": "⚠️ This action will terminate 3 running instances." },
      "confirmModal": { "component": "Modal", "trigger": "triggerBtn", "content": "modalBody" },
      "triggerBtn": { "component": "Button", "child": "triggerLabel", "variant": "primary" },
      "triggerLabel": { "component": "Text", "text": "Proceed with Termination" },
      "modalBody": { "component": "Column", "children": ["modalText", "modalList"] },
      "modalText": { "component": "Text", "text": "The following instances will be terminated:" },
      "modalList": { "component": "List", "children": ["inst1", "inst2", "inst3"] },
      "inst1": { "component": "Text", "text": "• i-0abc123 (t3.micro, us-east-1)" },
      "inst2": { "component": "Text", "text": "• i-0def456 (m5.large, us-west-2)" },
      "inst3": { "component": "Text", "text": "• i-0ghi789 (c5.xlarge, eu-west-1)" }
    }
  }
}
```

### 4.5 The Deployment Pipeline (Live-Bound)

Combine `DATA_MODEL_UPDATE` with catalog components for a real-time updating deployment view. Emit the events as an ordered array.

```json
[
  {
    "type": "DATA_MODEL_UPDATE",
    "payload": {
      "pipeline": {
        "stage": "Building Container Image",
        "progress": "35%",
        "eta": "~2 min remaining"
      }
    }
  },
  {
    "type": "A2UI_RENDER",
    "payload": {
      "rootId": "pipeline",
      "components": {
        "pipeline": { "component": "Card", "child": "stack" },
        "stack": { "component": "Column", "children": ["title", "divider", "stageRow", "progressRow", "etaRow"] },
        "title": { "component": "Text", "variant": "h2", "text": "CI/CD Pipeline — Production" },
        "divider": { "component": "Divider" },
        "stageRow": { "component": "Row", "children": ["stageLabel", "stageVal"] },
        "stageLabel": { "component": "Text", "variant": "caption", "text": "Current Stage" },
        "stageVal": { "component": "Text", "variant": "h3", "text": "$/pipeline/stage" },
        "progressRow": { "component": "Row", "children": ["progressLabel", "progressVal"] },
        "progressLabel": { "component": "Text", "variant": "caption", "text": "Progress" },
        "progressVal": { "component": "Text", "variant": "h1", "text": "$/pipeline/progress" },
        "etaRow": { "component": "Row", "children": ["etaLabel", "etaVal"] },
        "etaLabel": { "component": "Text", "variant": "caption", "text": "ETA" },
        "etaVal": { "component": "Text", "text": "$/pipeline/eta" }
      }
    }
  }
]
```

Then send follow-up `DATA_MODEL_UPDATE` events to animate the UI:

```json
{ "type": "DATA_MODEL_UPDATE", "payload": { "pipeline": { "stage": "Running Integration Tests", "progress": "68%", "eta": "~45s remaining" } } }
```

### 4.6 The Multi-Surface Split

Render the main view to `content` and a sensitive detail panel to the `tools` side panel simultaneously:

```json
[
  {
    "type": "A2UI_RENDER",
    "payload": {
      "surface": "main",
      "rootId": "mainView",
      "components": {
        "mainView": { "component": "Column", "children": ["title", "body"] },
        "title": { "component": "Text", "variant": "h1", "text": "API Key Rotation Complete" },
        "body": { "component": "Text", "text": "Your new API key has been generated. Check the side panel to reveal the key." }
      }
    }
  },
  {
    "type": "A2UI_RENDER",
    "payload": {
      "surface": "tools",
      "componentName": "PropertyRedact",
      "label": "New API Key (click to reveal)",
      "content": "sk-live-Rk9Fj2x8HzQp4N7mBvL3"
    }
  }
]
```

### 4.7 The HITL Approval Form

Use for any operation that requires explicit human approval with validated input.

```json
{
  "type": "ACTION_REQUIRED",
  "payload": {
    "formId": "delete-approval",
    "title": "Approve Resource Deletion",
    "description": "The agent wants to delete the following resources. Please review and confirm.",
    "fields": [
      {
        "type": "string",
        "name": "reason",
        "label": "Deletion Reason",
        "required": true,
        "minLength": 10,
        "maxLength": 500,
        "constraintText": "Provide a detailed reason for audit trail (10-500 characters)."
      },
      {
        "type": "enum",
        "name": "scope",
        "label": "Deletion Scope",
        "options": ["Selected Resources Only", "Selected + Dependents", "Full Stack Teardown"],
        "required": true,
        "defaultValue": "Selected Resources Only"
      },
      {
        "type": "boolean",
        "name": "acknowledge",
        "label": "I understand this action is irreversible and have verified the resource list",
        "required": true,
        "errorMessage": "You must acknowledge the irreversible nature of this action."
      }
    ]
  }
}
```

---

## 5. Best Practices

### 5.1 Component ID Naming
Use short, semantic IDs: `title`, `statusRow`, `m1Label`, `detailsBtn`. Avoid generic names like `c1`, `c2` in production payloads — they make debugging difficult.

### 5.2 Text Variant Hierarchy
- `h1` — Page title (one per view)
- `h2` — Section header
- `h3` — Subsection header
- `caption` — Label for key-value pairs
- `body` (or omit) — Body text

### 5.3 Card Wrapping
Always wrap significant content sections in a `Card`. This maps to Cloudscape `Container` and provides the bordered, shadowed panel that users expect.

### 5.4 Row for Key-Value Pairs
The `caption` + value `Row` pattern is the idiomatic way to show metadata:
```json
{ "component": "Row", "children": ["label", "value"] }
```

### 5.5 Secrets Always Go to PropertyRedact
Never display API keys, tokens, or credentials as plain `Text`. Always use `PropertyRedact` so content is hidden behind a click-to-expand.

### 5.6 Prefer Table for Tabular Data
If you have 3+ rows of structured records, always use the legacy `Table` component. It gives you free filtering, sorting, pagination, and automatic `StatusIndicator` detection.

### 5.7 Surface Routing Guidelines
- **`main`**: Dashboard views, deployment status, tables, tab groups
- **`tools`**: Sensitive data (PropertyRedact), agent trace, secondary details
- Never render `ACTION_REQUIRED` forms to `tools` — they need the full content area

### 5.8 Validation Rules
- Always set `required: true` on fields that the agent cannot proceed without
- Use `pattern` for identifiers, ARNs, or structured strings
- Use `constraintText` to set expectations *before* the user makes a mistake
- Use `errorMessage` only when the default error is too generic

### 5.9 Event Ordering
When emitting multiple events as an array:
1. `DATA_MODEL_UPDATE` events first (seed the state store)
2. `A2UI_RENDER` events second (components can resolve bindings immediately)
3. `ACTION_REQUIRED` last (user sees the complete UI context before being asked for input)
