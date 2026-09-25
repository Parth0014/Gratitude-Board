import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { describe, it } from 'vitest';
import { FoundationStack } from '../lib/foundation-stack';

describe('foundation privacy and durability', () => {
  const template = Template.fromStack(
    new FoundationStack(new App(), 'test-foundation', { stage: 'dev' }),
  );
  it('blocks public media and retains stored data', () => {
    template.hasResource('AWS::S3::Bucket', {
      DeletionPolicy: 'Retain',
      Properties: Match.objectLike({
        VersioningConfiguration: { Status: 'Enabled' },
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      }),
    });
    template.resourceCountIs('AWS::CloudFront::Distribution', 0);
  });
  it('uses encrypted queues with bounded retry and a dead-letter queue', () => {
    template.resourceCountIs('AWS::SQS::Queue', 2);
    template.hasResourceProperties('AWS::SQS::Queue', {
      SqsManagedSseEnabled: true,
      RedrivePolicy: {
        deadLetterTargetArn: Match.anyValue(),
        maxReceiveCount: 3,
      },
    });
    template.resourceCountIs('AWS::CloudWatch::Alarm', 1);
  });
  it('protects identities and uses a browser client without a secret', () => {
    template.hasResourceProperties('AWS::Cognito::UserPool', {
      DeletionProtection: 'ACTIVE',
    });
    template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
      GenerateSecret: false,
      PreventUserExistenceErrors: 'ENABLED',
      EnableTokenRevocation: true,
    });
  });
});
