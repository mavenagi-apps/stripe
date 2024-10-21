import { MavenAGIClient } from 'mavenagi';

export default {
  async preInstall({
    organizationId,
    agentId,
    settings,
  }: {
    organizationId: string;
    agentId: string;
    settings: AppSettings;
  }) {},

  async postInstall({
    organizationId,
    agentId,
    settings,
  }: {
    organizationId: string;
    agentId: string;
    settings: AppSettings;
  }) {
    const mavenAgi = new MavenAGIClient({
      organizationId: organizationId,
      agentId: agentId,
    });

    mavenAgi.actions.createOrUpdate({
      actionId: { referenceId: 'get-balance' },
      name: 'Get Stripe Balance',
      description: 'Gets the users Stripe balance',
      userInteractionRequired: false,
      userFormParameters: [],
    });

    mavenAgi.actions.createOrUpdate({
      actionId: { referenceId: 'get-all-charges' },
      name: 'Get Stripe Charges',
      description: 'Gets all of the users Stripe charges',
      userInteractionRequired: false,
      userFormParameters: [],
    });
  },

  async executeAction({
    organizationId,
    agentId,
    settings,
    actionId,
    parameters,
    user,
  }: {
    organizationId: string;
    agentId: string;
    settings: AppSettings;
    actionId: string;
    parameters: Record<string, any>;
    user: any;
  }) {
    const stripe = require('stripe')(
      settings.apiKey ||
        'sk_test_4eC39HqLyjWDarjtT1zdp7dc' /* stripe test key */
    );
    // TODO: Get from user object
    const stripeCustomerId = 'cus_NffrFeUfNV2Hib'; /* stripe test customer id */

    if (actionId === 'get-all-charges') {
      // TODO: need customer id
      return JSON.stringify(
        await stripe.charges.list({
          customer: stripeCustomerId,
          limit: 3,
        })
      );
    } else if (actionId === 'get-balance') {
      // The customer object has balance info on it
      return JSON.stringify(
        await stripe.customers.retrieve('cus_NffrFeUfNV2Hib')
      );
    }
  },
};
