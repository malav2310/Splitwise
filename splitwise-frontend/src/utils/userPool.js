import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'us-east-1_MdjixzzSO',
  ClientId: '2ol8ejrqc3vqngds5me1l6rk1a'      
};

export default new CognitoUserPool(poolData);