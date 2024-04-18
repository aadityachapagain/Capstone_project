import { awscdk } from 'projen';
import { NodePackageManager } from 'projen/lib/javascript';


const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.9.0',
  defaultReleaseBranch: 'main',
  name: 'Capstone_project',
  projenrcTs: true,

  deps: [
    'dotenv',
    'aws-cdk-lib',
    'constructs',
    '@aws-cdk/aws-lambda-python-alpha',
    '@aws-cdk/aws-apigatewayv2-alpha',
    '@aws-cdk/aws-apigatewayv2-integrations-alpha',
  ],

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  packageName: NodePackageManager.PNPM, /* The "name" in package.json. */
  gitignore: ['.env', 'build.sh', 'app/.env'], /* Additional entries to .gitignore */
});

project.addTask('deploy-all-dev', {
  exec: 'cdk deploy --context application=commpass --context environment=dev -all --require-approval never --concurrency 6',
});

project.synth();