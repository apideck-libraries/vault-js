export enum ConnectionViewType {
  Settings = 'settings',
  ConfigurableResources = 'configurable-resources',
  CustomMapping = 'custom-mapping',
}

export interface ApideckVaultOptions {
  token: string;
  unifiedApi?: string;
  serviceId?: string;
  showAttribution?: boolean;
  showConsumer?: boolean;
  unifyBaseUrl?: string;
  onReady?: () => void;
  onClose?: () => void;
  onConnectionChange?: (connection: Connection) => void;
  onConnectionDelete?: (connection: Connection) => void;
  initialView?: ConnectionViewType;
  locale?: string; // en, fr, nl, de, es
  showLanguageSwitch?: boolean;
  autoStartAuthorization?: boolean;
  showButtonLayout?: boolean;
}

export interface Metadata {
  ecosystem?: {
    name: string;
    id: string;
  };
  account?: {
    name: string;
    id: string;
  };
  accountInfo?: Record<string, unknown>;
}

export interface ResourceConfig {
  resource: string;
  defaults: FormField[];
}

export interface WebhookSubscription {
  downstream_id: string;
  unify_event_types: string[];
  downstream_event_types: string[];
  execute_url: string;
  created_at: string;
}

export interface FormFieldOption {
  label: string;
  value: string | number | boolean | string[] | number[];
}

export interface FormField {
  id: string;
  label: string;
  value: unknown;
  placeholder: string | null;
  mask: boolean;
  type:
    | 'select'
    | 'multi-select'
    | 'text'
    | 'textarea'
    | 'number'
    | 'tel'
    | 'email'
    | 'url'
    | 'checkbox'
    | 'hidden'
    | 'date'
    | 'datetime'
    | 'time'
    | 'password'
    | unknown;
  required: boolean;
  disabled: boolean;
  custom_field: boolean;
  hidden: boolean;
  default_value?: unknown;
  options?: FormFieldOption[];
  description?: string;
  allow_custom_values?: boolean;
  sensitive?: boolean;
  target?: string;
}

export type ConnectionState = 'available' | 'added' | 'authorized' | 'callable';
export type IntegrationState =
  | 'disabled'
  | 'needs_configuration'
  | 'configured';
export type AuthType = 'none' | 'custom' | 'basic' | 'oauth2' | 'apiKey';
export type OauthGrantType =
  | 'authorization_code'
  | 'client_credentials'
  | 'refresh_token'
  | 'password';

export interface Connection {
  id: string;
  service_id: string;
  name: string;
  tag_line?: string;
  unified_api: string;
  website?: string;
  icon?: string;
  logo?: string;
  settings?: Record<string, any>;
  metadata?: Metadata;
  auth_type?: AuthType;
  oauth_grant_type?: OauthGrantType;
  status?: string;
  form_fields: FormField[];
  configuration?: ResourceConfig[];
  configurable_resources?: string[];
  resource_schema_support?: string[];
  resource_settings_support?: string[];
  settings_required_for_authorization?: string[];
  subscriptions?: WebhookSubscription[];
  authorize_url?: string | null;
  revoke_url?: string | null;
  enabled: boolean;
  has_guide: boolean;
  created_at?: number;
  updated_at?: number;
  state: ConnectionState;
  integration_state: IntegrationState;
}
