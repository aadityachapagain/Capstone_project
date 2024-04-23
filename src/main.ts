import { App } from 'aws-cdk-lib';
import { DeploymentVars } from './lib/build-config';
import { ApiStack } from './stacks/api';
import dotenv from 'dotenv';

dotenv.config();

const app = new App();

const DB_USERNAME = process.env.db_username || '';
const DB_PASSWORD = process.env.db_password || '';
const LLM_APIKEY = process.env.azurellm_key || '';
const CALUDE_TOKEN = process.env.claude_token || '';

const environment = app.node.tryGetContext('environment') || 'dev';
const application = app.node.tryGetContext('application') || 'commpass';

const deploymentVars: DeploymentVars = {
  Application: application,
  Environment: environment,
  dbusername: DB_USERNAME,
  dbpassword: DB_PASSWORD,
  llmapikey: LLM_APIKEY,
  claudeToken: CALUDE_TOKEN,
};

const deploymentEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT || '123456789012',
  region: process.env.CDK_DEFAULT_REGION || 'ap-southeast-2',
};

new ApiStack(app, 'CommpassApiStack', {
  env: deploymentEnv,
  stackName: `${application}-${environment}-api-stack`,
}, deploymentVars);

app.synth();