import { MavenAGIClient } from 'mavenagi';
import Stripe from 'stripe';

// Stripe-provided test key. Enables this app to work as a demo even if you don't have a real Stripe account.
// To use, leave the API key blank on install within Agent Designer
const STRIPE_TEST_KEY = 'sk_test_4eC39HqLyjWDarjtT1zdp7dc';

// Stripe-provided test customer id. This is a valid customer for the above key.
// However, because the Stripe test data is shared, this customer may be deleted at any time.
// This value is not used in code, its only provided here so that you, the reader, can try this value in Playground :)
const STRIPE_TEST_CUSTOMER_ID = 'cus_R4dnq4Cifq7N2D';

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
    const stripe = new Stripe(settings.apiKey || STRIPE_TEST_KEY);
    // Make sure basic balance call returns to test the apiKey validity
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
    const stripe = new Stripe(settings.apiKey || STRIPE_TEST_KEY);

    // Stripe actions
    await mavenAgi.actions.createOrUpdate({
      actionId: { referenceId: 'get-balance' },
      name: 'Get Stripe Balance',
      description: 'Gets the users Stripe balance',
      userInteractionRequired: false,
      userFormParameters: [],
      precondition: {
        preconditionType: 'user',
        key: 'stripeId',
      },
    });

    await mavenAgi.actions.createOrUpdate({
      actionId: { referenceId: 'get-all-charges' },
      name: 'Get Stripe Charges',
      description: 'Gets all of the users Stripe charges',
      userInteractionRequired: false,
      userFormParameters: [],
      precondition: {
        preconditionType: 'user',
        key: 'stripeId',
      },
    });

    // Stripe users
    // This is a demo app right now, so limit to just a couple customers
    // TODO(Maven): Demonstrate how to pull in all customer data at scale with a solution like inngest
    const customers = await stripe.customers.list({ limit: 3 });
    console.log('adding ' + customers.data.length + ' users from stripe');

    for (let i = 0; i < customers.data.length; i++) {
      const customer = customers.data[i];

      if (customer.email) {
        try {
          await mavenAgi.users.createOrUpdate({
            userId: { referenceId: customer.id },
            identifiers: [{ type: 'EMAIL', value: customer.email }],
            data: {
              name: { value: customer.name || '', visibility: 'VISIBLE' },
              stripeId: { value: customer.id, visibility: 'PARTIALLY_VISIBLE' },
            },
          });
        } catch (error) {
          // Note: Maven does not currently allow an email to have more than one associated referenceId
          // This restriction exists so that customers can be dereferenced by email (e.g. if you ask a question in Slack, Maven knows what your stripeId is)
          // Stripe does not have this limitation, and the test key data is messy, so we may encounter merge errors
          // TODO(Maven): If this is an issue in real production data, handle user merges
          console.log(error);
        }
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
    const stripe = new Stripe(settings.apiKey || STRIPE_TEST_KEY);

    // Because our actions have preconditions requiring the stripeId to exist, this field will always be present
    const stripeCustomerId = user.defaultUserData.stripeId;

    if (actionId === 'get-all-charges') {
      return JSON.stringify(
        await stripe.charges.list({
          customer: stripeCustomerId,
          limit: 3,
        })
      );
    } else if (actionId === 'get-balance') {
      // The customer object has balance info on it. The LLM can handle extra information, no need to filter.
      return JSON.stringify(await stripe.customers.retrieve(stripeCustomerId));
    }
  },
};
