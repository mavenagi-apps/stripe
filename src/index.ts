import { MavenAGIClient } from 'mavenagi';
import Stripe from 'stripe';

export default {
  async preInstall({
    organizationId,
    agentId,
    settings,
  }: {
    organizationId: string;
    agentId: string;
    settings: AppSettings;
  }) {
    const stripe = new Stripe(
      settings.apiKey ||
        'sk_test_4eC39HqLyjWDarjtT1zdp7dc' /* stripe test key */
    );
    // Make sure basic balance call returns
    await stripe.balance.retrieve();
  },

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
    const stripe = new Stripe(
      settings.apiKey ||
        'sk_test_4eC39HqLyjWDarjtT1zdp7dc' /* stripe test key */
    );

    // Stripe actions
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

    // Stripe users
    // Limit to one page during debugging
    const customers = await stripe.customers.list();
    for (let i = 0; i < customers.data.length; i++) {
      const customer = customers.data[i];

      if (customer.email) {
        mavenAgi.users.createOrUpdate({
          userId: { referenceId: customer.id },
          identifiers: [{ type: 'EMAIL', value: customer.email }],
          data: {
            name: { value: customer.name || '', visibility: 'VISIBLE' },
            stripeId: { value: customer.id, visibility: 'PARTIALLY_VISIBLE' },
          },
        });
      }
    }
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
    const stripe = new Stripe(
      settings.apiKey ||
        'sk_test_4eC39HqLyjWDarjtT1zdp7dc' /* stripe test key */
    );
    // TODO: Get from user object
    const stripeCustomerId = 'cus_NffrFeUfNV2Hib'; /* stripe test customer id */

    if (actionId === 'get-all-charges') {
      return JSON.stringify(
        await stripe.charges.list({
          customer: stripeCustomerId,
          limit: 3,
        })
      );
    } else if (actionId === 'get-balance') {
      // The customer object has balance info on it
      return JSON.stringify(await stripe.customers.retrieve(stripeCustomerId));
    }
  },
};
