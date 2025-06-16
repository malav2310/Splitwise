import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'YOUR_USER_POOL_ID', // Replace after deployment
  ClientId: 'YOUR_CLIENT_ID'       // Replace after deployment
};

export default new CognitoUserPool(poolData);