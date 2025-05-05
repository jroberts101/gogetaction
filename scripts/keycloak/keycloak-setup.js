#!/usr/bin/env node

/**
 * Keycloak Setup Script
 *
 * This script automates the configuration of Keycloak according to
 * the steps defined in keycloak-dev-setup.rest
 *
 * It performs steps 1.1 to 12.2 which include:
 * - Getting admin token
 * - Configuring master realm
 * - Creating and configuring gogetaction realm
 * - Creating clients (frontend and backend)
 * - Creating roles and users
 * - Setting up identity providers
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load environment variables from keycloak.dev.env
const envFilePath = path.join(__dirname, 'keycloak.dev.env');
const envConfig = JSON.parse(fs.readFileSync(envFilePath, 'utf8'));

const { keycloakHost, adminUser, adminPassword, realmName, frontendClientId, backendClientId } =
  envConfig;

// Initialize axios instance with base URL
const api = axios.create({
  baseURL: keycloakHost,
  headers: {
    'Content-Type': 'application/json',
  },
});

// For form-encoded requests
const formApi = axios.create({
  baseURL: keycloakHost,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

/**
 * Helper function to handle errors and display meaningful messages
 */
function handleError(error, step) {
  console.error(`Error in step ${step}:`);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error(`Status: ${error.response.status}`);
    console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received from server');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error setting up request:', error.message);
  }
}

/**
 * Convert object to x-www-form-urlencoded format
 */
function objectToFormData(obj) {
  return Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
}

/**
 * Main function to run the setup steps
 */
async function setupKeycloak() {
  try {
    console.log('Starting Keycloak setup...');

    // STEP 1.1: Get Admin Access Token
    console.log('\nSTEP 1.1: Getting admin access token...');
    const tokenResponse = await formApi.post(
      `/realms/master/protocol/openid-connect/token`,
      objectToFormData({
        grant_type: 'password',
        client_id: 'admin-cli',
        username: adminUser,
        password: adminPassword,
      })
    );

    const adminToken = tokenResponse.data.access_token;
    console.log('Admin token obtained successfully');

    // Set authorization header for subsequent requests
    api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

    // STEP 1.2: Verify Master Realm Token Settings
    console.log('\nSTEP 1.3: Verifying master realm token settings...');
    const masterRealmSettings = await api.get('/admin/realms/master');
    console.log(
      'Master realm settings retrieved:',
      masterRealmSettings.data ? 'success' : 'failed'
    );
    console.log('Master realm settings verified');

    // STEP 2.1: Check if realm exists
    console.log(`\nSTEP 2.1: Checking if realm "${realmName}" exists...`);
    let realmExists = false;
    try {
      await api.get(`/admin/realms/${realmName}`);
      realmExists = true;
      console.log(`Realm "${realmName}" already exists`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`Realm "${realmName}" does not exist`);
      } else {
        throw error;
      }
    }

    // STEP 2.2: Create New Realm if it doesn't exist
    if (!realmExists) {
      console.log(`\nSTEP 2.2: Creating new realm "${realmName}"...`);
      await api.post('/admin/realms', {
        realm: realmName,
        enabled: true,
        displayName: 'Go Get Action',
        displayNameHtml: '<div class="kc-logo-text">Go Get Action</div>',
      });
      console.log(`Realm "${realmName}" created successfully`);
    }

    // STEP 2.3: Configure Realm Email Settings
    console.log('\nSTEP 2.3: Configuring realm email settings...');
    // First, check current email settings
    const realmEmailSettingsResponse = await api.get(`/admin/realms/${realmName}`);
    const currentEmailSettings = realmEmailSettingsResponse.data.smtpServer || {};
    const expectedEmailSettings = {
      from: 'no-reply@gogetaction.com',
      fromDisplayName: 'Go Get Action',
      host: 'mailpit',
      port: '1025',
    };

    // Only update if email settings are different
    if (JSON.stringify(currentEmailSettings) !== JSON.stringify(expectedEmailSettings)) {
      console.log('Email settings need updating...');
      await api.put(`/admin/realms/${realmName}`, {
        realm: realmName,
        smtpServer: expectedEmailSettings,
      });
      console.log('Email settings configured successfully');
    } else {
      console.log('Email settings are already correctly configured');
    }

    // STEP 3: Configure Realm Settings
    console.log('\nSTEP 3: Configuring realm settings...');

    // Define the expected realm settings
    const expectedRealmSettings = {
      realm: realmName,
      enabled: true,
      sslRequired: 'external',
      registrationAllowed: false,
      editUsernameAllowed: false,
      resetPasswordAllowed: true,
      bruteForceProtected: true,
      failureFactor: 3,
      refreshTokenMaxReuse: 0,
      accessTokenLifespan: 300,
      accessTokenLifespanForImplicitFlow: 900,
      ssoSessionIdleTimeout: 1800,
      ssoSessionMaxLifespan: 36000,
      offlineSessionIdleTimeout: 2592000,
      accessCodeLifespan: 60,
      accessCodeLifespanLogin: 1800,
      accessCodeLifespanUserAction: 300,
      attributes: {
        pkceCodeChallengeMethod: 'S256',
      },
    };

    // Get current realm settings
    const realmSettingsResponse = await api.get(`/admin/realms/${realmName}`);
    const currentRealmSettings = realmSettingsResponse.data;

    // Check if settings need to be updated
    let needsUpdate = false;
    for (const key in expectedRealmSettings) {
      if (key === 'attributes') {
        if (
          !currentRealmSettings.attributes ||
          currentRealmSettings.attributes.pkceCodeChallengeMethod !== 'S256'
        ) {
          needsUpdate = true;
          break;
        }
      } else if (currentRealmSettings[key] !== expectedRealmSettings[key]) {
        needsUpdate = true;
        break;
      }
    }

    if (needsUpdate) {
      console.log('Realm settings need updating...');
      await api.put(`/admin/realms/${realmName}`, expectedRealmSettings);
      console.log('Realm settings configured successfully');
    } else {
      console.log('Realm settings are already correctly configured');
    }

    // STEP 4.1: Check if frontend client exists
    console.log(`\nSTEP 4.1: Checking if frontend client "${frontendClientId}" exists...`);
    const frontendClientResponse = await api.get(
      `/admin/realms/${realmName}/clients?clientId=${frontendClientId}`
    );
    const frontendClientExists = frontendClientResponse.data.length > 0;

    // STEP 4.2: Create Frontend Client if it doesn't exist
    if (!frontendClientExists) {
      console.log(`\nSTEP 4.2: Creating frontend client "${frontendClientId}"...`);
      await api.post(`/admin/realms/${realmName}/clients`, {
        clientId: frontendClientId,
        enabled: true,
        publicClient: true,
        redirectUris: ['https://localhost/*'],
        webOrigins: ['+'],
        standardFlowEnabled: true,
        directAccessGrantsEnabled: false,
        attributes: {
          'pkce.code.challenge.method': 'S256',
        },
      });
      console.log('Frontend client created successfully');
    } else {
      console.log('Frontend client already exists');
    }

    // STEP 5.1: Check if backend client exists
    console.log(`\nSTEP 5.1: Checking if backend client "${backendClientId}" exists...`);
    const backendClientResponse = await api.get(
      `/admin/realms/${realmName}/clients?clientId=${backendClientId}`
    );
    const backendClientExists = backendClientResponse.data.length > 0;

    // STEP 5.2: Create Backend Client if it doesn't exist
    if (!backendClientExists) {
      console.log(`\nSTEP 5.2: Creating backend client "${backendClientId}"...`);
      await api.post(`/admin/realms/${realmName}/clients`, {
        clientId: backendClientId,
        enabled: true,
        bearerOnly: true,
        publicClient: false,
      });
      console.log('Backend client created successfully');
    } else {
      console.log('Backend client already exists');
    }

    // STEP 6.1: Check if Campaigner role exists
    console.log('\nSTEP 6.1: Checking if Campaigner role exists...');
    let campaignerRoleExists = false;
    let campaignerRoleId = null;
    try {
      const campaignerRoleResponse = await api.get(`/admin/realms/${realmName}/roles/Campaigner`);
      campaignerRoleExists = true;
      campaignerRoleId = campaignerRoleResponse.data.id;
      console.log('Campaigner role already exists');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('Campaigner role does not exist');
      } else {
        throw error;
      }
    }

    // STEP 6.2: Create Campaigner Role if it doesn't exist
    if (!campaignerRoleExists) {
      console.log('\nSTEP 6.2: Creating Campaigner role...');
      await api.post(`/admin/realms/${realmName}/roles`, {
        name: 'Campaigner',
        description: 'Can create and manage campaigns',
      });
      console.log('Campaigner role created successfully');

      // Get the role ID after creation
      const campaignerRoleResponse = await api.get(`/admin/realms/${realmName}/roles/Campaigner`);
      campaignerRoleId = campaignerRoleResponse.data.id;
    }

    // STEP 7.1: Check if regular test user exists
    console.log('\nSTEP 7.1: Checking if regular test user exists...');
    const regularUserResponse = await api.get(
      `/admin/realms/${realmName}/users?username=testuser&exact=true`
    );
    const regularUserExists = regularUserResponse.data.length > 0;

    // STEP 7.2: Create Regular Test User if it doesn't exist
    if (!regularUserExists) {
      console.log('\nSTEP 7.2: Creating regular test user...');
      await api.post(`/admin/realms/${realmName}/users`, {
        username: 'testuser',
        email: 'testuser@example.com',
        enabled: true,
        emailVerified: true,
        credentials: [
          {
            type: 'password',
            value: 'password123',
            temporary: false,
          },
        ],
      });
      console.log('Regular test user created successfully');
    } else {
      console.log('Regular test user already exists');
    }

    // STEP 8.1: Check if campaigner test user exists
    console.log('\nSTEP 8.1: Checking if campaigner test user exists...');
    const campaignerUserResponse = await api.get(
      `/admin/realms/${realmName}/users?username=campaigner&exact=true`
    );
    const campaignerUserExists = campaignerUserResponse.data.length > 0;
    let campaignerUserId = campaignerUserExists ? campaignerUserResponse.data[0].id : null;

    // STEP 8.2: Create Campaigner Test User if it doesn't exist
    if (!campaignerUserExists) {
      console.log('\nSTEP 8.2: Creating campaigner test user...');
      await api.post(`/admin/realms/${realmName}/users`, {
        username: 'campaigner',
        email: 'campaigner@example.com',
        enabled: true,
        emailVerified: true,
        credentials: [
          {
            type: 'password',
            value: 'password123',
            temporary: false,
          },
        ],
      });
      console.log('Campaigner test user created successfully');

      // Get the user ID after creation
      const newCampaignerUserResponse = await api.get(
        `/admin/realms/${realmName}/users?username=campaigner&exact=true`
      );
      campaignerUserId = newCampaignerUserResponse.data[0].id;
    }

    // STEP 9 & 10: Get Campaigner Role and User ID, then assign role to user
    console.log('\nSTEP 10: Assigning Campaigner role to campaigner user...');
    // Get updated role info if needed
    if (!campaignerRoleId) {
      const campaignerRoleResponse = await api.get(`/admin/realms/${realmName}/roles/Campaigner`);
      campaignerRoleId = campaignerRoleResponse.data.id;
    }

    // Check if role is already assigned to the user
    const userRolesResponse = await api.get(
      `/admin/realms/${realmName}/users/${campaignerUserId}/role-mappings/realm`
    );
    const userHasCampaignerRole = userRolesResponse.data.some(role => role.name === 'Campaigner');

    // Assign role to user only if not already assigned
    if (!userHasCampaignerRole) {
      console.log('Assigning Campaigner role to user...');
      await api.post(`/admin/realms/${realmName}/users/${campaignerUserId}/role-mappings/realm`, [
        {
          id: campaignerRoleId,
          name: 'Campaigner',
        },
      ]);
      console.log('Campaigner role assigned to user successfully');
    } else {
      console.log('Campaigner role is already assigned to user');
    }

    // STEP 11.1: Check if Facebook Identity Provider exists
    console.log('\nSTEP 11.1: Checking if Facebook Identity Provider exists...');
    let facebookIdpExists = false;
    let currentFacebookConfig = null;
    try {
      const facebookIdpResponse = await api.get(
        `/admin/realms/${realmName}/identity-provider/instances/facebook`
      );
      facebookIdpExists = true;
      currentFacebookConfig = facebookIdpResponse.data;
      console.log('Facebook Identity Provider already exists');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('Facebook Identity Provider does not exist');
      } else {
        throw error;
      }
    }

    // Expected Facebook IDP configuration
    const expectedFacebookIdpConfig = {
      alias: 'facebook',
      displayName: 'Facebook',
      providerId: 'facebook',
      enabled: true,
      storeToken: false,
      addReadTokenRoleOnCreate: false,
      authenticateByDefault: false,
      firstBrokerLoginFlowAlias: 'first broker login',
      config: {
        clientId: 'YOUR_FACEBOOK_APP_ID',
        clientSecret: 'YOUR_FACEBOOK_APP_SECRET',
      },
    };

    // STEP 11.2: Configure Facebook Identity Provider if it doesn't exist or needs updating
    if (!facebookIdpExists) {
      console.log('\nSTEP 11.2: Creating Facebook Identity Provider...');
      await api.post(
        `/admin/realms/${realmName}/identity-provider/instances`,
        expectedFacebookIdpConfig
      );
      console.log('Facebook Identity Provider configured successfully');
    } else {
      // Check if configuration needs updating
      let needsUpdate = false;

      // Compare the essential properties (excluding fields like internalId that Keycloak adds)
      const essentialProps = [
        'alias',
        'displayName',
        'providerId',
        'enabled',
        'storeToken',
        'addReadTokenRoleOnCreate',
        'authenticateByDefault',
        'firstBrokerLoginFlowAlias',
      ];

      for (const prop of essentialProps) {
        if (currentFacebookConfig[prop] !== expectedFacebookIdpConfig[prop]) {
          needsUpdate = true;
          break;
        }
      }

      // Check clientId (clientSecret won't be returned in GET requests)
      if (
        currentFacebookConfig.config &&
        currentFacebookConfig.config.clientId !== expectedFacebookIdpConfig.config.clientId
      ) {
        needsUpdate = true;
      }

      if (needsUpdate) {
        console.log('Facebook Identity Provider needs updating...');
        await api.put(`/admin/realms/${realmName}/identity-provider/instances/facebook`, {
          ...currentFacebookConfig,
          ...expectedFacebookIdpConfig,
        });
        console.log('Facebook Identity Provider updated successfully');
      } else {
        console.log('Facebook Identity Provider is already correctly configured');
      }
    }

    // STEP 12.1: Check if Instagram Identity Provider exists
    console.log('\nSTEP 12.1: Checking if Instagram Identity Provider exists...');
    let instagramIdpExists = false;
    let currentInstagramConfig = null;
    try {
      const instagramIdpResponse = await api.get(
        `/admin/realms/${realmName}/identity-provider/instances/instagram`
      );
      instagramIdpExists = true;
      currentInstagramConfig = instagramIdpResponse.data;
      console.log('Instagram Identity Provider already exists');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('Instagram Identity Provider does not exist');
      } else {
        throw error;
      }
    }

    // Expected Instagram IDP configuration
    const expectedInstagramIdpConfig = {
      alias: 'instagram',
      displayName: 'Instagram',
      providerId: 'instagram',
      enabled: true,
      storeToken: false,
      addReadTokenRoleOnCreate: false,
      authenticateByDefault: false,
      firstBrokerLoginFlowAlias: 'first broker login',
      config: {
        clientId: 'YOUR_INSTAGRAM_APP_ID',
        clientSecret: 'YOUR_INSTAGRAM_APP_SECRET',
      },
    };

    // STEP 12.2: Configure Instagram Identity Provider if it doesn't exist or needs updating
    if (!instagramIdpExists) {
      console.log('\nSTEP 12.2: Creating Instagram Identity Provider...');
      await api.post(
        `/admin/realms/${realmName}/identity-provider/instances`,
        expectedInstagramIdpConfig
      );
      console.log('Instagram Identity Provider configured successfully');
    } else {
      // Check if configuration needs updating
      let needsUpdate = false;

      // Compare the essential properties (excluding fields like internalId that Keycloak adds)
      const essentialProps = [
        'alias',
        'displayName',
        'providerId',
        'enabled',
        'storeToken',
        'addReadTokenRoleOnCreate',
        'authenticateByDefault',
        'firstBrokerLoginFlowAlias',
      ];

      for (const prop of essentialProps) {
        if (currentInstagramConfig[prop] !== expectedInstagramIdpConfig[prop]) {
          needsUpdate = true;
          break;
        }
      }

      // Check clientId (clientSecret won't be returned in GET requests)
      if (
        currentInstagramConfig.config &&
        currentInstagramConfig.config.clientId !== expectedInstagramIdpConfig.config.clientId
      ) {
        needsUpdate = true;
      }

      if (needsUpdate) {
        console.log('Instagram Identity Provider needs updating...');
        await api.put(`/admin/realms/${realmName}/identity-provider/instances/instagram`, {
          ...currentInstagramConfig,
          ...expectedInstagramIdpConfig,
        });
        console.log('Instagram Identity Provider updated successfully');
      } else {
        console.log('Instagram Identity Provider is already correctly configured');
      }
    }

    console.log('\nKeycloak setup completed successfully!');
    console.log('Access Keycloak Admin: ' + keycloakHost);
    console.log(
      `Realm "${realmName}" is now configured with clients, roles, users, and identity providers.`
    );
  } catch (error) {
    handleError(error, 'unknown');
    process.exit(1);
  }
}

// Run the setup
setupKeycloak();
