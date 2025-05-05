#!/usr/bin/env node

/**
 * Keycloak Rollback Script
 *
 * This script undoes all the configurations performed by the keycloak-setup.js script.
 * It follows the reverse order of operations to ensure proper cleanup:
 * 1. Delete identity providers (Instagram, Facebook)
 * 2. Delete users (campaigner, testuser)
 * 3. Delete roles (Campaigner)
 * 4. Delete clients (frontend, backend)
 * 5. Delete the realm itself
 *
 * The script is idempotent, meaning it checks if resources exist before attempting to delete them.
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
 * Checks if a resource exists
 * @param {string} url - URL to check
 * @returns {Promise<boolean>} - True if resource exists, false otherwise
 */
async function resourceExists(url) {
  try {
    await api.get(url);
    return true;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Main function to run the rollback steps
 */
async function rollbackKeycloak() {
  try {
    console.log('Starting Keycloak rollback...');

    // STEP 1: Get Admin Access Token
    console.log('\nSTEP 1: Getting admin access token...');
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

    // Check if realm exists before proceeding
    console.log(`\nChecking if realm "${realmName}" exists...`);
    const realmExists = await resourceExists(`/admin/realms/${realmName}`);

    if (!realmExists) {
      console.log(`Realm "${realmName}" does not exist. Nothing to rollback.`);
      return;
    }

    console.log(`Realm "${realmName}" exists. Proceeding with rollback...`);

    // STEP 2: Delete Identity Providers
    console.log('\nSTEP 2: Deleting Identity Providers...');

    // Delete Instagram Identity Provider
    console.log('Checking Instagram Identity Provider...');
    const instagramIdpExists = await resourceExists(
      `/admin/realms/${realmName}/identity-provider/instances/instagram`
    );
    if (instagramIdpExists) {
      await api.delete(`/admin/realms/${realmName}/identity-provider/instances/instagram`);
      console.log('Instagram Identity Provider deleted successfully');
    } else {
      console.log('Instagram Identity Provider does not exist');
    }

    // Delete Facebook Identity Provider
    console.log('Checking Facebook Identity Provider...');
    const facebookIdpExists = await resourceExists(
      `/admin/realms/${realmName}/identity-provider/instances/facebook`
    );
    if (facebookIdpExists) {
      await api.delete(`/admin/realms/${realmName}/identity-provider/instances/facebook`);
      console.log('Facebook Identity Provider deleted successfully');
    } else {
      console.log('Facebook Identity Provider does not exist');
    }

    // STEP 3: Get and Delete Users
    console.log('\nSTEP 3: Deleting Users...');

    // Get all users to find IDs
    const usersResponse = await api.get(`/admin/realms/${realmName}/users`);
    const users = usersResponse.data;

    // Find and delete testuser
    const testUser = users.find(user => user.username === 'testuser');
    if (testUser) {
      await api.delete(`/admin/realms/${realmName}/users/${testUser.id}`);
      console.log('Test User deleted successfully');
    } else {
      console.log('Test User does not exist');
    }

    // Find and delete campaigner user
    const campaignerUser = users.find(user => user.username === 'campaigner');
    if (campaignerUser) {
      await api.delete(`/admin/realms/${realmName}/users/${campaignerUser.id}`);
      console.log('Campaigner User deleted successfully');
    } else {
      console.log('Campaigner User does not exist');
    }

    // STEP 4: Delete Campaigner Role
    console.log('\nSTEP 4: Deleting Campaigner Role...');

    // Check if role exists
    const campaignerRoleExists = await resourceExists(
      `/admin/realms/${realmName}/roles/Campaigner`
    );
    if (campaignerRoleExists) {
      await api.delete(`/admin/realms/${realmName}/roles/Campaigner`);
      console.log('Campaigner Role deleted successfully');
    } else {
      console.log('Campaigner Role does not exist');
    }

    // STEP 5: Get and Delete Clients
    console.log('\nSTEP 5: Deleting Clients...');

    // Get all clients to find IDs
    const clientsResponse = await api.get(`/admin/realms/${realmName}/clients`);
    const clients = clientsResponse.data;

    // Find and delete frontend client
    const frontendClient = clients.find(client => client.clientId === frontendClientId);
    if (frontendClient) {
      await api.delete(`/admin/realms/${realmName}/clients/${frontendClient.id}`);
      console.log('Frontend Client deleted successfully');
    } else {
      console.log('Frontend Client does not exist');
    }

    // Find and delete backend client
    const backendClient = clients.find(client => client.clientId === backendClientId);
    if (backendClient) {
      await api.delete(`/admin/realms/${realmName}/clients/${backendClient.id}`);
      console.log('Backend Client deleted successfully');
    } else {
      console.log('Backend Client does not exist');
    }

    // STEP 6: Delete the Realm
    console.log(`\nSTEP 6: Deleting Realm "${realmName}"...`);
    await api.delete(`/admin/realms/${realmName}`);
    console.log(`Realm "${realmName}" deleted successfully`);

    console.log('\nKeycloak rollback completed successfully!');
  } catch (error) {
    handleError(error, 'unknown');
    process.exit(1);
  }
}

// Run the rollback
rollbackKeycloak();
