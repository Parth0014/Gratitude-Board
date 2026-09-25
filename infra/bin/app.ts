import { App, Tags } from 'aws-cdk-lib';
import { FoundationStack } from '../lib/foundation-stack';

const app = new App();
const stage: unknown = app.node.tryGetContext('stage');
if (stage !== 'dev' && stage !== 'staging' && stage !== 'prod')
  throw new Error('stage must be dev, staging, or prod');

new FoundationStack(app, `vision-board-${stage}-foundation`, { stage });
Tags.of(app).add('Project', 'vision-board');
Tags.of(app).add('Environment', stage);
Tags.of(app).add('ManagedBy', 'cdk');
app.synth();
