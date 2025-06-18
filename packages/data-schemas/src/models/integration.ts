import integrationSchema from '~/schema/integration';
import type * as t from '~/types';

/**
 * Creates or returns the Integration model using the provided mongoose instance and schema
 */
export function createIntegrationModel(mongoose: typeof import('mongoose')) {
  return (
    mongoose.models.Integration || mongoose.model<t.IIntegration>('Integration', integrationSchema)
  );
}
