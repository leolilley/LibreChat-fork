const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { requireJwtAuth, requireLocalAuth } = require('~/server/middleware');
const { logger } = require('~/config');
const {
  getUserIntegrations,
  getIntegrationByService,
  saveIntegration,
  deleteIntegration,
  updateIntegrationStatus,
  refreshIntegrationToken,
} = require('~/models');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Service configurations for OAuth
const SERVICE_CONFIGS = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope:
      'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/calendar.readonly',
  },
  slack: {
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    scope: 'channels:read,chat:write,files:read,users:read',
  },
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scope: 'repo,user:email',
  },
  notion: {
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token',
    scope: 'read_content,update_content',
  },
  // Add more service configurations as needed
};

/**
 * GET /api/integrations
 * Get all integrations for the authenticated user
 */
router.get('/', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const integrations = await getUserIntegrations(userId);

    // Don't send sensitive credentials to client
    const sanitizedIntegrations = integrations.map((integration) => ({
      ...integration,
      credentials: integration.credentials
        ? {
            tokenType: integration.credentials.tokenType,
            expiresAt: integration.credentials.expiresAt,
            scope: integration.credentials.scope,
            // Don't send actual tokens/keys
          }
        : null,
    }));

    res.json(sanitizedIntegrations);
  } catch (error) {
    logger.error('Error fetching user integrations:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

/**
 * GET /api/integrations/:service
 * Get a specific integration by service
 */
router.get('/:service', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { service } = req.params;

    const integration = await getIntegrationByService(userId, service);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Don't send sensitive credentials to client
    const sanitizedIntegration = {
      ...integration,
      credentials: integration.credentials
        ? {
            tokenType: integration.credentials.tokenType,
            expiresAt: integration.credentials.expiresAt,
            scope: integration.credentials.scope,
          }
        : null,
    };

    res.json(sanitizedIntegration);
  } catch (error) {
    logger.error('Error fetching integration:', error);
    res.status(500).json({ error: 'Failed to fetch integration' });
  }
});

/**
 * POST /api/integrations/:service/connect
 * Initiate OAuth flow for a service
 */
router.post('/:service/connect', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { service } = req.params;
    const { name, description } = req.body;

    const serviceConfig = SERVICE_CONFIGS[service];
    if (!serviceConfig) {
      return res.status(400).json({ error: 'Unsupported service' });
    }

    // Create a state token for OAuth security
    const state = jwt.sign(
      {
        userId,
        service,
        timestamp: Date.now(),
      },
      JWT_SECRET,
      { expiresIn: '10m' },
    );

    // Store pending integration
    await saveIntegration(userId, {
      service,
      name: name || service,
      description,
      status: 'disconnected',
      oauthConfig: {
        ...serviceConfig,
        redirectUri: `${process.env.DOMAIN_SERVER}/api/integrations/${service}/callback`,
      },
    });

    // Build OAuth URL
    const authUrl = new URL(serviceConfig.authUrl);
    authUrl.searchParams.append('client_id', process.env[`${service.toUpperCase()}_CLIENT_ID`]);
    authUrl.searchParams.append(
      'redirect_uri',
      `${process.env.DOMAIN_SERVER}/api/integrations/${service}/callback`,
    );
    authUrl.searchParams.append('scope', serviceConfig.scope);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('access_type', 'offline'); // For refresh tokens

    res.json({ authUrl: authUrl.toString() });
  } catch (error) {
    logger.error('Error initiating OAuth flow:', error);
    res.status(500).json({ error: 'Failed to initiate connection' });
  }
});

/**
 * GET /api/integrations/:service/callback
 * Handle OAuth callback
 */
router.get('/:service/callback', async (req, res) => {
  try {
    const { service } = req.params;
    const { code, state, error } = req.query;

    if (error) {
      logger.error('OAuth error:', error);
      return res.redirect(
        `${process.env.DOMAIN_CLIENT}/settings?integration_error=${encodeURIComponent(error)}`,
      );
    }

    if (!code || !state) {
      return res.redirect(
        `${process.env.DOMAIN_CLIENT}/settings?integration_error=missing_parameters`,
      );
    }

    // Verify state token
    let decodedState;
    try {
      decodedState = jwt.verify(state, JWT_SECRET);
    } catch (err) {
      logger.error('Invalid state token:', err);
      return res.redirect(`${process.env.DOMAIN_CLIENT}/settings?integration_error=invalid_state`);
    }

    const { userId } = decodedState;
    const serviceConfig = SERVICE_CONFIGS[service];

    // Exchange code for tokens
    const tokenResponse = await axios.post(
      serviceConfig.tokenUrl,
      {
        client_id: process.env[`${service.toUpperCase()}_CLIENT_ID`],
        client_secret: process.env[`${service.toUpperCase()}_CLIENT_SECRET`],
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.DOMAIN_SERVER}/api/integrations/${service}/callback`,
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const tokenData = tokenResponse.data;

    // Calculate expiration time
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : null;

    // Update integration with credentials
    await saveIntegration(userId, {
      service,
      name: service,
      status: 'connected',
      credentials: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenType: tokenData.token_type || 'Bearer',
        expiresAt,
        scope: tokenData.scope || serviceConfig.scope,
      },
      lastUsed: new Date(),
    });

    logger.info(`Successfully connected ${service} integration for user ${userId}`);
    res.redirect(`${process.env.DOMAIN_CLIENT}/settings?integration_success=${service}`);
  } catch (error) {
    logger.error('Error handling OAuth callback:', error);
    res.redirect(`${process.env.DOMAIN_CLIENT}/settings?integration_error=callback_failed`);
  }
});

/**
 * DELETE /api/integrations/:service
 * Disconnect an integration
 */
router.delete('/:service', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { service } = req.params;

    const success = await deleteIntegration(userId, service);

    if (!success) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    logger.info(`Disconnected ${service} integration for user ${userId}`);
    res.json({ message: 'Integration disconnected successfully' });
  } catch (error) {
    logger.error('Error disconnecting integration:', error);
    res.status(500).json({ error: 'Failed to disconnect integration' });
  }
});

/**
 * POST /api/integrations/:service/test
 * Test an integration connection
 */
router.post('/:service/test', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { service } = req.params;

    const integration = await getIntegrationByService(userId, service);

    if (!integration || integration.status !== 'connected') {
      return res.status(404).json({ error: 'Integration not connected' });
    }

    // Test the connection based on service type
    let testResult = false;
    let testMessage = 'Connection test failed';

    try {
      switch (service) {
        case 'google':
          // Test Google API access
          const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              Authorization: `${integration.credentials.tokenType} ${integration.credentials.accessToken}`,
            },
          });
          testResult = googleResponse.status === 200;
          testMessage = testResult ? 'Google connection successful' : 'Google connection failed';
          break;

        case 'slack':
          // Test Slack API access
          const slackResponse = await axios.get('https://slack.com/api/auth.test', {
            headers: {
              Authorization: `${integration.credentials.tokenType} ${integration.credentials.accessToken}`,
            },
          });
          testResult = slackResponse.data.ok;
          testMessage = testResult ? 'Slack connection successful' : 'Slack connection failed';
          break;

        default:
          testMessage = 'Test not implemented for this service';
      }
    } catch (testError) {
      logger.error(`Integration test failed for ${service}:`, testError);
      testResult = false;
      testMessage = 'Connection test failed - invalid credentials';

      // Update integration status if test fails
      await updateIntegrationStatus(userId, service, 'error');
    }

    if (testResult) {
      await updateIntegrationStatus(userId, service, 'connected');
    }

    res.json({
      success: testResult,
      message: testMessage,
      service,
    });
  } catch (error) {
    logger.error('Error testing integration:', error);
    res.status(500).json({ error: 'Failed to test integration' });
  }
});

/**
 * GET /api/integrations/services/available
 * Get list of available services for integration
 */
router.get('/services/available', requireJwtAuth, (req, res) => {
  const availableServices = Object.keys(SERVICE_CONFIGS).map((service) => ({
    id: service,
    name: service.charAt(0).toUpperCase() + service.slice(1),
    description: `Connect your ${service.charAt(0).toUpperCase() + service.slice(1)} account`,
    icon: service, // You can map this to actual icon names
    category: getServiceCategory(service),
    requiresClientCredentials: true,
  }));

  res.json(availableServices);
});

function getServiceCategory(service) {
  const categories = {
    google: 'productivity',
    gmail: 'email',
    sheets: 'productivity',
    drive: 'storage',
    calendar: 'productivity',
    slack: 'communication',
    github: 'development',
    notion: 'productivity',
    // Add more categorizations
  };

  return categories[service] || 'other';
}

module.exports = router;
