const { encryptV2, decryptV2 } = require('~/server/utils/crypto');
const { logger } = require('~/config');

/**
 * Get all integrations for a user
 * @param {string} userId - The user's ID
 * @param {object} [query={}] - Additional query filters
 * @returns {Promise<Array>} Array of user integrations
 */
async function getUserIntegrations(userId, query = {}) {
  const { Integration } = require('~/models');

  try {
    const integrations = await Integration.find({
      userId,
      ...query,
    }).sort({ updatedAt: -1 });

    // Decrypt sensitive credentials for client use
    const decryptedIntegrations = await Promise.all(
      integrations.map(async (integration) => {
        const decrypted = integration.toObject();

        if (decrypted.credentials?.accessToken) {
          try {
            decrypted.credentials.accessToken = await decryptV2(decrypted.credentials.accessToken);
          } catch (error) {
            logger.error('Failed to decrypt access token:', error);
            decrypted.credentials.accessToken = null;
          }
        }

        if (decrypted.credentials?.refreshToken) {
          try {
            decrypted.credentials.refreshToken = await decryptV2(
              decrypted.credentials.refreshToken,
            );
          } catch (error) {
            logger.error('Failed to decrypt refresh token:', error);
            decrypted.credentials.refreshToken = null;
          }
        }

        if (decrypted.credentials?.apiKey) {
          try {
            decrypted.credentials.apiKey = await decryptV2(decrypted.credentials.apiKey);
          } catch (error) {
            logger.error('Failed to decrypt API key:', error);
            decrypted.credentials.apiKey = null;
          }
        }

        return decrypted;
      }),
    );

    return decryptedIntegrations;
  } catch (error) {
    logger.error('Error fetching user integrations:', error);
    throw error;
  }
}

/**
 * Get a specific integration by service
 * @param {string} userId - The user's ID
 * @param {string} service - The service name
 * @returns {Promise<object|null>} The integration or null if not found
 */
async function getIntegrationByService(userId, service) {
  const { Integration } = require('~/models');

  try {
    const integration = await Integration.findOne({ userId, service });

    if (!integration) {
      return null;
    }

    const decrypted = integration.toObject();

    // Decrypt credentials
    if (decrypted.credentials?.accessToken) {
      decrypted.credentials.accessToken = await decryptV2(decrypted.credentials.accessToken);
    }
    if (decrypted.credentials?.refreshToken) {
      decrypted.credentials.refreshToken = await decryptV2(decrypted.credentials.refreshToken);
    }
    if (decrypted.credentials?.apiKey) {
      decrypted.credentials.apiKey = await decryptV2(decrypted.credentials.apiKey);
    }

    return decrypted;
  } catch (error) {
    logger.error('Error fetching integration by service:', error);
    throw error;
  }
}

/**
 * Create or update an integration
 * @param {string} userId - The user's ID
 * @param {object} integrationData - The integration data
 * @returns {Promise<object>} The created/updated integration
 */
async function saveIntegration(userId, integrationData) {
  const { Integration } = require('~/models');

  try {
    // Encrypt sensitive credentials
    const encryptedData = { ...integrationData, userId };

    if (encryptedData.credentials?.accessToken) {
      encryptedData.credentials.accessToken = await encryptV2(
        encryptedData.credentials.accessToken,
      );
    }
    if (encryptedData.credentials?.refreshToken) {
      encryptedData.credentials.refreshToken = await encryptV2(
        encryptedData.credentials.refreshToken,
      );
    }
    if (encryptedData.credentials?.apiKey) {
      encryptedData.credentials.apiKey = await encryptV2(encryptedData.credentials.apiKey);
    }

    const integration = await Integration.findOneAndUpdate(
      { userId, service: integrationData.service },
      encryptedData,
      { upsert: true, new: true, runValidators: true },
    );

    return integration;
  } catch (error) {
    logger.error('Error saving integration:', error);
    throw error;
  }
}

/**
 * Delete an integration
 * @param {string} userId - The user's ID
 * @param {string} service - The service name
 * @returns {Promise<boolean>} True if deleted successfully
 */
async function deleteIntegration(userId, service) {
  const { Integration } = require('~/models');

  try {
    const result = await Integration.deleteOne({ userId, service });
    return result.deletedCount > 0;
  } catch (error) {
    logger.error('Error deleting integration:', error);
    throw error;
  }
}

/**
 * Update integration status
 * @param {string} userId - The user's ID
 * @param {string} service - The service name
 * @param {string} status - The new status
 * @returns {Promise<object|null>} The updated integration
 */
async function updateIntegrationStatus(userId, service, status) {
  const { Integration } = require('~/models');

  try {
    const integration = await Integration.findOneAndUpdate(
      { userId, service },
      { status, lastUsed: new Date() },
      { new: true },
    );

    return integration;
  } catch (error) {
    logger.error('Error updating integration status:', error);
    throw error;
  }
}

/**
 * Refresh OAuth token for an integration
 * @param {string} userId - The user's ID
 * @param {string} service - The service name
 * @param {object} tokenData - New token data
 * @returns {Promise<object|null>} The updated integration
 */
async function refreshIntegrationToken(userId, service, tokenData) {
  const { Integration } = require('~/models');

  try {
    const updateData = {
      'credentials.accessToken': tokenData.accessToken
        ? await encryptV2(tokenData.accessToken)
        : undefined,
      'credentials.refreshToken': tokenData.refreshToken
        ? await encryptV2(tokenData.refreshToken)
        : undefined,
      'credentials.expiresAt': tokenData.expiresAt,
      status: 'connected',
      lastUsed: new Date(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const integration = await Integration.findOneAndUpdate({ userId, service }, updateData, {
      new: true,
    });

    return integration;
  } catch (error) {
    logger.error('Error refreshing integration token:', error);
    throw error;
  }
}

/**
 * Get integrations that are about to expire (within 24 hours)
 * @returns {Promise<Array>} Array of expiring integrations
 */
async function getExpiringIntegrations() {
  const { Integration } = require('~/models');

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const integrations = await Integration.find({
      'credentials.expiresAt': { $lte: tomorrow },
      status: 'connected',
    });

    return integrations;
  } catch (error) {
    logger.error('Error fetching expiring integrations:', error);
    throw error;
  }
}

module.exports = {
  getUserIntegrations,
  getIntegrationByService,
  saveIntegration,
  deleteIntegration,
  updateIntegrationStatus,
  refreshIntegrationToken,
  getExpiringIntegrations,
};
