import { Document, Types } from 'mongoose';

export interface IIntegrationCredentials {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresAt?: Date;
  scope?: string;
  apiKey?: string;
  metadata?: Map<string, unknown>;
}

export interface IIntegrationOAuthConfig {
  clientId?: string;
  clientSecret?: string;
  authUrl?: string;
  tokenUrl?: string;
  scope?: string;
  redirectUri?: string;
}

export interface IIntegrationWorkflowMapping {
  automationId: string;
  workflowId: string;
  webhookUrl: string;
  enabled?: boolean;
}

export type IntegrationService =
  | 'google'
  | 'slack'
  | 'notion'
  | 'airtable'
  | 'github'
  | 'gmail'
  | 'sheets'
  | 'drive'
  | 'calendar'
  | 'hubspot'
  | 'salesforce'
  | 'linkedin'
  | 'twitter'
  | 'facebook'
  | 'instagram'
  | 'youtube'
  | 'discord'
  | 'trello'
  | 'asana'
  | 'monday'
  | 'zapier'
  | 'mailchimp'
  | 'stripe'
  | 'paypal'
  | 'shopify'
  | 'woocommerce'
  | 'wordpress'
  | 'dropbox'
  | 'onedrive'
  | 'box'
  | 'aws'
  | 'gcp'
  | 'azure'
  | 'twilio'
  | 'sendgrid'
  | 'intercom'
  | 'zendesk'
  | 'freshdesk'
  | 'typeform'
  | 'calendly'
  | 'zoom'
  | 'teams'
  | 'webex';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'expired';

export interface IIntegration extends Document {
  userId: Types.ObjectId;
  service: IntegrationService;
  name: string;
  description?: string;
  status: IntegrationStatus;
  credentials?: IIntegrationCredentials;
  oauthConfig?: IIntegrationOAuthConfig;
  workflowMappings?: IIntegrationWorkflowMapping[];
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
}

export interface IntegrationCreateData {
  userId: Types.ObjectId | string;
  service: IntegrationService;
  name: string;
  description?: string;
  status?: IntegrationStatus;
  credentials?: IIntegrationCredentials;
  oauthConfig?: IIntegrationOAuthConfig;
  workflowMappings?: IIntegrationWorkflowMapping[];
}

export interface IntegrationUpdateData {
  name?: string;
  description?: string;
  status?: IntegrationStatus;
  credentials?: IIntegrationCredentials;
  oauthConfig?: IIntegrationOAuthConfig;
  workflowMappings?: IIntegrationWorkflowMapping[];
  lastUsed?: Date;
}

export interface IntegrationQuery {
  userId?: Types.ObjectId | string;
  service?: IntegrationService;
  status?: IntegrationStatus;
}

export interface IntegrationDeleteResult {
  deletedCount?: number;
}
