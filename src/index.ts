export const termyApiVersion = "1" as const;

export type PluginCapability =
  | "hosts.read"
  | "snippets.read"
  | "terminal.write"
  | "workspace.read"
  | "storage.read"
  | "storage.write";

export type PluginJSONValue =
  | null
  | boolean
  | number
  | string
  | PluginJSONValue[]
  | { [key: string]: PluginJSONValue };

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  termyApiVersion: typeof termyApiVersion;
  entry: string;
  capabilities: PluginCapability[];
  contributes: PluginContributions;
}

export interface PluginContributions {
  actions: PluginActionContribution[];
  panes: PluginPaneContribution[];
  settings?: PluginSettingsContribution[];
}

export interface PluginActionContribution {
  id: string;
  title: string;
  icon?: string;
}

export interface PluginPaneContribution {
  id: string;
  title: string;
  icon?: string;
}

export interface PluginSettingsContribution {
  id: string;
  title: string;
  icon?: string;
}

export interface HostSummary {
  id: string;
  name: string;
  hostname: string;
  username: string;
  port: number;
  osKind: string;
}

export interface SnippetSummary {
  id: string;
  name: string;
  command: string;
  tags: string[];
}

export interface WorkspaceContext {
  focusedPaneKind: string | null;
  focusedPaneHasTerminal: boolean;
  focusedHost?: HostSummary | null;
}

export type TerminalWriteMode = "insert" | "run";

export type ToastSeverity = "info" | "success" | "warning" | "error" | string;

export type PluginEffect =
  | { type: "toast"; message: string; severity?: ToastSeverity | null }
  | { type: "openPane"; viewId: string }
  | { type: "terminalWrite"; text: string; mode: TerminalWriteMode };

export interface PluginHostResponse {
  view?: PluginViewSchema | null;
  effects?: PluginEffect[];
}

export type PluginResult = PluginViewSchema | PluginHostResponse | TerminalWriteResponse | void | null;

export type MaybePromise<T> = T | Promise<T>;

export type PluginRefreshReason = "initial" | "manual" | "action" | string;

export interface PluginActionEvent {
  actionId: string;
  source?: "command" | "schema" | "settings" | string;
  viewId?: string | null;
  formValues?: Record<string, PluginJSONValue>;
  row?: Record<string, PluginJSONValue>;
  refreshReason?: PluginRefreshReason;
}

export interface PluginPaneEvent {
  viewId: string;
  refreshReason?: PluginRefreshReason;
  formValues?: Record<string, PluginJSONValue>;
  row?: Record<string, PluginJSONValue>;
}

export interface PluginSettingsEvent {
  settingsId: string;
  formValues?: Record<string, PluginJSONValue>;
}

export type PluginActionHandler = (event?: PluginActionEvent) => MaybePromise<PluginResult>;

export type PluginPaneHandler = (event?: PluginPaneEvent) => MaybePromise<PluginResult>;

export type PluginSettingsHandler = (event?: PluginSettingsEvent) => MaybePromise<PluginResult>;

export interface TermyPlugin {
  activate(ctx: PluginContext): MaybePromise<void>;
}

export interface PluginContext {
  plugin: {
    id: string;
    version: string;
  };
  registerAction(id: string, handler: PluginActionHandler): void;
  registerPane(id: string, handler: PluginPaneHandler): void;
  registerSettings(id: string, handler: PluginSettingsHandler): void;
  hosts: {
    list(): Promise<HostSummary[]>;
  };
  snippets: {
    list(): Promise<SnippetSummary[]>;
  };
  workspace: {
    current(): Promise<WorkspaceContext>;
  };
  storage: {
    get<T extends PluginJSONValue = PluginJSONValue>(key: string): Promise<T | null>;
    set(key: string, value: PluginJSONValue): Promise<void>;
    remove(key: string): Promise<void>;
    keys(): Promise<string[]>;
  };
  terminal: {
    insert(text: string): TerminalWriteResponse;
    run(text: string): TerminalWriteResponse;
  };
  ui: PluginUI;
  effects: PluginEffects;
}

export interface PluginUI {
  markdown(spec: MarkdownViewInput): MarkdownViewSchema;
  table(spec: TableViewInput): TableViewSchema;
  form(spec: FormViewInput): FormViewSchema;
  stack(children: PluginViewSchema[], title?: string | null): StackViewSchema;
  empty(title?: string | null, body?: string | null): EmptyViewSchema;
  statGrid(spec: StatGridViewInput): StatGridViewSchema;
  list(spec: ListViewInput): ListViewSchema;
  divider(title?: string | null): DividerViewSchema;
}

export interface PluginEffects {
  toast(message: string, severity?: ToastSeverity | null): void;
  openPane(viewId: string): void;
}

export interface PluginTableColumn {
  id: string;
  title: string;
}

export type PluginFormFieldType = "text" | "textarea" | "number" | "checkbox" | "select";

export interface PluginSelectOption {
  value: string;
  title: string;
}

export interface PluginFormField {
  id: string;
  title: string;
  type?: PluginFormFieldType;
  value?: PluginJSONValue;
  placeholder?: string | null;
  options?: PluginSelectOption[];
  required?: boolean;
  disabled?: boolean;
  help?: string | null;
}

export type PluginSchemaActionRole = "default" | "cancel" | "destructive" | string;

export type PluginSchemaActionStyle = "plain" | "bordered" | "prominent" | string;

export interface PluginSchemaAction {
  id: string;
  title: string;
  icon?: string | null;
  role?: PluginSchemaActionRole | null;
  style?: PluginSchemaActionStyle | null;
  submitFormId?: string | null;
  rowAction?: boolean;
  refreshPane?: boolean;
}

export interface PluginStatItem {
  id: string;
  title: string;
  value: PluginJSONValue;
  subtitle?: string | null;
  tone?: "neutral" | "success" | "warning" | "danger" | "accent" | string | null;
}

export interface PluginListItem {
  id: string;
  title: string;
  subtitle?: string | null;
  detail?: string | null;
  icon?: string | null;
  value?: PluginJSONValue;
  actions?: PluginSchemaAction[];
}

export interface MarkdownViewInput {
  title?: string | null;
  body?: string | null;
  actions?: PluginSchemaAction[];
}

export interface TableViewInput {
  title?: string | null;
  columns: PluginTableColumn[];
  rows: Array<Record<string, PluginJSONValue>>;
  actions?: PluginSchemaAction[];
}

export interface FormViewInput {
  id?: string | null;
  title?: string | null;
  fields: PluginFormField[];
  actions?: PluginSchemaAction[];
}

export interface StatGridViewInput {
  title?: string | null;
  stats: PluginStatItem[];
  actions?: PluginSchemaAction[];
}

export interface ListViewInput {
  title?: string | null;
  items: PluginListItem[];
  actions?: PluginSchemaAction[];
}

export interface MarkdownViewSchema extends MarkdownViewInput {
  type: "markdown";
}

export interface TableViewSchema extends TableViewInput {
  type: "table";
}

export interface FormViewSchema extends FormViewInput {
  type: "form";
}

export interface StackViewSchema {
  type: "stack";
  title?: string | null;
  children: PluginViewSchema[];
  actions?: PluginSchemaAction[];
}

export interface EmptyViewSchema {
  type: "empty";
  title?: string | null;
  body?: string | null;
  actions?: PluginSchemaAction[];
}

export interface StatGridViewSchema extends StatGridViewInput {
  type: "statGrid";
}

export interface ListViewSchema extends ListViewInput {
  type: "list";
}

export interface DividerViewSchema {
  type: "divider";
  title?: string | null;
}

export type PluginViewSchema =
  | MarkdownViewSchema
  | TableViewSchema
  | FormViewSchema
  | StackViewSchema
  | EmptyViewSchema
  | StatGridViewSchema
  | ListViewSchema
  | DividerViewSchema;

export interface TerminalWriteResponse {
  effects: Array<Extract<PluginEffect, { type: "terminalWrite" }>>;
}

export function definePlugin(plugin: TermyPlugin): TermyPlugin {
  return plugin;
}
