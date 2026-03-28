export type AgUiEvent = ToolCallStartEvent | ToolCallEndEvent | StateDeltaEvent | A2UIRenderEvent | ActionRequiredEvent | DataModelUpdateEvent;

export interface ToolCallStartEvent {
  type: 'TOOL_CALL_START';
  payload: {
    toolName: string;
    description?: string;
  };
}

export interface ToolCallEndEvent {
  type: 'TOOL_CALL_END';
  payload: {
    toolName: string;
    resultStatus: 'success' | 'error';
  };
}

export interface StateDeltaEvent {
  type: 'STATE_DELTA';
  payload: {
    state: string;
    message?: string;
  };
}

export interface DataModelUpdateEvent {
  type: 'DATA_MODEL_UPDATE';
  payload: Record<string, unknown>;
}

export interface A2UITablePayload {
  surface?: string;
  componentName: 'Table';
  headers: string[];
  rows: Record<string, string | number | boolean | null>[];
}

export interface A2UIPropertyRedactPayload {
  surface?: string;
  componentName: 'PropertyRedact';
  label?: string;
  content: string;
}

export interface A2UIRenderEvent {
  type: 'A2UI_RENDER';
  payload: A2UITablePayload | A2UIPropertyRedactPayload | A2UICatalogPayload;
}

export interface A2UICatalogPayload {
  surface?: string;
  rootId: string;
  components: Record<string, AnyCatalogComponent>;
}

export interface A2UIText {
  component: 'Text';
  text: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'caption' | 'body';
}

export interface A2UIImage {
  component: 'Image';
  url: string;
  description?: string;
  fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scaleDown';
  variant?: 'icon' | 'avatar' | 'smallFeature' | 'mediumFeature' | 'largeFeature' | 'header';
}

export interface A2UIIcon {
  component: 'Icon';
  name: string | { path: string };
}

export interface A2UIRow {
  component: 'Row';
  children: string[];
  justify?: 'center' | 'end' | 'spaceAround' | 'spaceBetween' | 'spaceEvenly' | 'start' | 'stretch';
  align?: 'start' | 'center' | 'end' | 'stretch';
}

export interface A2UIColumn {
  component: 'Column';
  children: string[];
  justify?: 'start' | 'center' | 'end' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly' | 'stretch';
  align?: 'center' | 'end' | 'start' | 'stretch';
}

export interface A2UIList {
  component: 'List';
  children: string[];
  direction?: 'vertical' | 'horizontal';
  align?: 'start' | 'center' | 'end' | 'stretch';
}

export interface A2UICard {
  component: 'Card';
  child: string;
}

export interface A2UITabs {
  component: 'Tabs';
  tabs: { title: string; child: string }[];
}

export interface A2UIModal {
  component: 'Modal';
  trigger: string;
  content: string;
}

export interface A2UIDivider {
  component: 'Divider';
  axis?: 'horizontal' | 'vertical';
}

export interface A2UIButton {
  component: 'Button';
  child: string;
  variant?: 'default' | 'primary' | 'borderless';
  action?: unknown;
}

export interface A2UITextField {
  component: 'TextField';
  label: string;
  value?: string;
  variant?: 'longText' | 'number' | 'shortText' | 'obscured';
  validationRegexp?: string;
}

export interface A2UICheckBox {
  component: 'CheckBox';
  label: string;
  value: boolean;
}

export interface A2UIChoicePicker {
  component: 'ChoicePicker';
  label: string;
  variant?: 'multipleSelection' | 'mutuallyExclusive';
  options: { label: string; value: string }[];
  value: string[];
  displayStyle?: 'checkbox' | 'chips';
  filterable?: boolean;
}

export interface A2UIDateTimeInput {
  component: 'DateTimeInput';
  value: string;
  enableDate?: boolean;
  enableTime?: boolean;
  min?: string;
  max?: string;
  label?: string;
}

export type AnyCatalogComponent =
  | A2UIText
  | A2UIImage
  | A2UIIcon
  | A2UIRow
  | A2UIColumn
  | A2UIList
  | A2UICard
  | A2UITabs
  | A2UIModal
  | A2UIDivider
  | A2UIButton
  | A2UITextField
  | A2UICheckBox
  | A2UIChoicePicker
  | A2UIDateTimeInput;

interface FieldValidationBase {
  /** Custom error message override. If omitted, a sensible default is generated. */
  errorMessage?: string;
  /** Hint text shown below the field before any error, e.g. "Must be 3-64 characters" */
  constraintText?: string;
}

export type FieldDefinition =
  | FieldValidationBase & {
      type: 'string';
      name: string;
      label: string;
      required?: boolean;
      defaultValue?: string;
      /** Regex pattern the value must match (tested via new RegExp) */
      pattern?: string;
      /** Minimum character length */
      minLength?: number;
      /** Maximum character length */
      maxLength?: number;
    }
  | FieldValidationBase & {
      type: 'boolean';
      name: string;
      label: string;
      defaultValue?: boolean;
      /** If true, the checkbox must be checked to submit */
      required?: boolean;
    }
  | FieldValidationBase & {
      type: 'enum';
      name: string;
      label: string;
      options: string[];
      required?: boolean;
      defaultValue?: string;
    };

export interface ActionRequiredEvent {
  type: 'ACTION_REQUIRED';
  payload: {
    surface?: string;
    formId: string;
    title: string;
    description?: string;
    fields: FieldDefinition[];
  };
}

export interface UserResponseEvent {
  type: 'USER_RESPONSE';
  payload: {
    formId: string;
    data: Record<string, unknown>;
  };
}

export type OutboundClientEvent = UserResponseEvent;
