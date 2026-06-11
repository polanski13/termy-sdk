export const termyApiVersion = "1" as const;

export type PluginCapability = "hosts.read" | "snippets.read" | "terminal.write";

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

export type PluginActionHandler = () => MaybePromise<PluginResult>;

export type PluginPaneHandler = () => MaybePromise<PluginResult>;

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
  hosts: {
    list(): Promise<HostSummary[]>;
  };
  snippets: {
    list(): Promise<SnippetSummary[]>;
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
}

export interface PluginEffects {
  toast(message: string, severity?: ToastSeverity | null): void;
  openPane(viewId: string): void;
}

export interface PluginTableColumn {
  id: string;
  title: string;
}

export interface PluginFormField {
  id: string;
  title: string;
  value?: string | null;
  placeholder?: string | null;
}

export interface PluginSchemaAction {
  id: string;
  title: string;
  icon?: string | null;
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
  title?: string | null;
  fields: PluginFormField[];
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

export type PluginViewSchema =
  | MarkdownViewSchema
  | TableViewSchema
  | FormViewSchema
  | StackViewSchema
  | EmptyViewSchema;

export interface TerminalWriteResponse {
  effects: Array<Extract<PluginEffect, { type: "terminalWrite" }>>;
}

export function definePlugin(plugin: TermyPlugin): TermyPlugin {
  return plugin;
}
