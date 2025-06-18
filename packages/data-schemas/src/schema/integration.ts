import { Schema } from 'mongoose';
import { IIntegration } from '~/types';

const integrationSchema: Schema<IIntegration> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
  service: {
    type: String,
    required: true,
    enum: [
      'google',
      'slack',
      'notion',
      'airtable',
      'github',
      'gmail',
      'sheets',
      'drive',
      'calendar',
      'hubspot',
      'salesforce',
      'linkedin',
      'twitter',
      'facebook',
      'instagram',
      'youtube',
      'discord',
      'trello',
      'asana',
      'monday',
      'zapier',
      'mailchimp',
      'stripe',
      'paypal',
      'shopify',
      'woocommerce',
      'wordpress',
      'dropbox',
      'onedrive',
      'box',
      'aws',
      'gcp',
      'azure',
      'twilio',
      'sendgrid',
      'intercom',
      'zendesk',
      'freshdesk',
      'typeform',
      'calendly',
      'zoom',
      'teams',
      'webex',
    ],
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    required: true,
    enum: ['connected', 'disconnected', 'error', 'expired'],
    default: 'disconnected',
  },
  credentials: {
    // Encrypted OAuth tokens and other sensitive data
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    tokenType: {
      type: String,
      default: 'Bearer',
    },
    expiresAt: {
      type: Date,
    },
    scope: {
      type: String,
    },
    // For API key based integrations
    apiKey: {
      type: String,
    },
    // Additional service-specific credentials
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  // OAuth configuration for this integration
  oauthConfig: {
    clientId: {
      type: String,
    },
    clientSecret: {
      type: String,
    },
    authUrl: {
      type: String,
    },
    tokenUrl: {
      type: String,
    },
    scope: {
      type: String,
    },
    redirectUri: {
      type: String,
    },
  },
  // n8n workflow mapping
  workflowMappings: [
    {
      automationId: {
        type: String,
        required: true,
      },
      workflowId: {
        type: String,
        required: true,
      },
      webhookUrl: {
        type: String,
        required: true,
      },
      enabled: {
        type: Boolean,
        default: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  lastUsed: {
    type: Date,
  },
});

// Indexes for efficient queries
integrationSchema.index({ userId: 1, service: 1 }, { unique: true });
integrationSchema.index({ userId: 1, status: 1 });
integrationSchema.index({ 'credentials.expiresAt': 1 });

// Update the updatedAt field on save
integrationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default integrationSchema;
