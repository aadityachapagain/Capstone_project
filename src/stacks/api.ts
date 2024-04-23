import path from 'path';
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from '@aws-cdk/aws-apigatewayv2-alpha';
import {
  HttpLambdaIntegration,
} from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

import {
  App,
  Stack,
  StackProps,
  aws_iam as iam,
  aws_lambda as lambda,
  Duration,
  CfnOutput,
  Size,
} from 'aws-cdk-lib';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { DeploymentVars } from '../lib/build-config';

export class ApiStack extends Stack {
  constructor(
    scope: App,
    id: string,
    props: StackProps,
    deploymentVars: DeploymentVars,
  ) {
    super(scope, id, props);

    const appname = deploymentVars.Application;
    const environment = deploymentVars.Environment;

    const baseName = `${appname}-${environment}`;

    const apiName = `${baseName}-api`;
    const lambdaName = `${baseName}-back`;
    const lambdaRoleName = `${baseName}-lambda-role`;

    const corsOrigin = [
      'http://localhost:3000',
      'https://commpass-graph-visual.vercel.app',
    ];

    const httpAPI = new HttpApi(this, apiName, {
      description: `API for ${appname}`,
      corsPreflight: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.DELETE,
          CorsHttpMethod.OPTIONS,
        ],
        allowOrigins: corsOrigin,
        allowCredentials: true,
      },
    });

    const apigatewayRole = new iam.Role(this, lambdaRoleName, {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      roleName: lambdaRoleName,
      description: 'Role for Lambda to access API Gateway',
    });

    apigatewayRole.attachInlinePolicy(
      new iam.Policy(this, `${lambdaRoleName}-allow-logs`, {
        statements: [
          new iam.PolicyStatement({
            actions: [
              'logs:CreateLogGroup',
              'logs:CreateLogStream',
              'logs:PutLogEvents',
            ],
            resources: ['*'],
          }),
        ],
      }),
    );

    const lambdaFunction = new lambda.DockerImageFunction(this, lambdaName, {
      code: lambda.DockerImageCode.fromImageAsset(
        path.join(__dirname, '../../app/'), {
          platform: Platform.LINUX_AMD64,
        },
      ),
      environment: {
        db_username: deploymentVars.dbusername,
        db_password: deploymentVars.dbpassword,
        azurellm_key: deploymentVars.llmapikey,
        claude_token: deploymentVars.claudeToken,
      },
      role: apigatewayRole,
      timeout: Duration.minutes(10),
      ephemeralStorageSize: Size.mebibytes(1024),
      memorySize: 1024,
    });

    const integration = new HttpLambdaIntegration('compasslambdaintegration', lambdaFunction);

    httpAPI.addRoutes({
      path: '/{proxy+}',
      methods: [
        HttpMethod.POST,
        HttpMethod.PUT,
        HttpMethod.PATCH,
        HttpMethod.GET,
      ],
      integration: integration,
    });

    new CfnOutput(this, 'APIURL', {
      value: httpAPI.url!,
    });
  }
}