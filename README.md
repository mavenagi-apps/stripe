This is a Maven App which integrates with the [Stripe API](https://docs.stripe.com/api/balance).

It pulls in a limited amount of Stripe customer data into the Maven [user API](https://developers.mavenagi.com/docs/api-reference/api-reference/users).
This user data is then used by two actions made with the [actions API](https://developers.mavenagi.com/docs/api-reference/api-reference/actions).

This app is not yet production ready as it does not pull in all customer data at this time. To support this amount of data at scale we need to use an async workflow of some kind. The current plan is to integrate with inngest, it's on the todo list! Ping us on [Discord](https://discord.mavenagi.com) with questions!

## Example answer

Inside playground you can pass in user data to test the `executeAction`. This is using the test customer id: 

<img width="1053" alt="Screenshot 2024-11-13 at 5 27 26 PM" src="https://github.com/user-attachments/assets/586d5985-f4a4-45dd-bc90-f32865c03729">


## Learn More

To learn more about Maven, check out our [documentation](http://developers.mavenagi.com).

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.
