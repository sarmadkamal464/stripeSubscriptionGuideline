const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(400).json({ message: "Invalid request method" });
    }

    const { name, email, paymentMethod } = req.body;

    if (!name || !email || !paymentMethod) {
      return res.status(400).json({ message: "Missing required data" });
    }

    // Create a customer
    const customer = await stripe.customers.create({
      email,
      name,
      payment_method: paymentMethod,
      invoice_settings: { default_payment_method: paymentMethod },
    });

    // Create a product
    const product = await stripe.products.create({
      name: "Monthly subscription",
    });
    console.log("customerID", customer.id);
    // Create a price
    const price = await stripe.prices.create({
      currency: "USD",
      unit_amount: 500,
      recurring: { interval: "month" },
      product: product.id,
    });

    // Create a subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    });

    // Send back the client secret for payment
    res.json({
      message: "Subscription successfully initiated",
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
