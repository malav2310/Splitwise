import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || 'us-east-1_NWqtzkGlh',
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID || '4veposppde8naju4fk4931k925',
};

// Add validation
if (!poolData.UserPoolId || !poolData.ClientId) {
  console.error('Missing required Cognito configuration');
  console.error('UserPoolId:', poolData.UserPoolId);
  console.error('ClientId:', poolData.ClientId);
  throw new Error('Missing required Cognito configuration');
}

let userPool;

try {
  userPool = new CognitoUserPool(poolData);
} catch (error) {
  console.error('Error creating CognitoUserPool:', error);
  throw error; // Rethrow or handle as needed
}

export default userPool;
