// Core renderer components
export { default as ProtocolBridge } from './components/ProtocolBridge';
export { default as A2UIRenderer } from './components/A2UIRenderer';
export { default as A2UITableRenderer } from './components/A2UITableRenderer';
export { default as A2UIPropertyRedact } from './components/A2UIPropertyRedact';
export { default as SurfaceRenderer } from './components/SurfaceRenderer';
export { A2UIStateProvider } from './components/A2UIStateProvider';
export { default as ErrorBoundary } from './components/ErrorBoundary';

// Hooks
export { useA2UIStore, useA2UIStateProperty } from './hooks/useA2UIState';
export { useLayout, LayoutContext } from './hooks/useLayout';
export type { LayoutContextType } from './hooks/useLayout';

// Store
export { A2UIStore } from './stores/A2UIStore';

// Utilities
export { deepMerge, resolvePointer } from './utils/stateUtils';

// Types
export type {
  AgUiEvent,
  ToolCallStartEvent,
  ToolCallEndEvent,
  StateDeltaEvent,
  DataModelUpdateEvent,
  A2UIRenderEvent,
  A2UICatalogPayload,
  A2UITablePayload,
  A2UIPropertyRedactPayload,
  ActionRequiredEvent,
  UserResponseEvent,
  OutboundClientEvent,
  FieldDefinition,
  AnyCatalogComponent,
  A2UIText,
  A2UIImage,
  A2UIIcon,
  A2UIRow,
  A2UIColumn,
  A2UIList,
  A2UICard,
  A2UITabs,
  A2UIModal,
  A2UIDivider,
  A2UIButton,
  A2UITextField,
  A2UICheckBox,
  A2UIChoicePicker,
  A2UIDateTimeInput,
} from './types/agui';
