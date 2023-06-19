import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const customerId = "cus_O51FtutapcZXht";
    // const { customerId } = req.query;

    const charges = await stripe.charges.list({
      customer: customerId,
      limit: 10, // Adjust the limit as per your requirements
    });

    res.status(200).json(charges.data);
  } catch (error) {
    console.error("Error listing customer transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
