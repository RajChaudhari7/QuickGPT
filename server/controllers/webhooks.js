import Stripe from "stripe";
import { Transaction } from "../models/Transaction.js";
import { User } from "../models/User.js";

export const stripeWebhooks = async (request, response) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOKS_SECRET);
        console.log("Received Stripe event:", event.type);
    } catch (error) {
        console.error("Webhook signature verification failed:", error.message);
        return response.status(400).send(`Webhook error: ${error.message}`);
    }

    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;
                const sessionList = await stripe.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                });
                const session = sessionList.data[0];
                const { transactionId, appId } = session.metadata;

                console.log("Session metadata:", session.metadata);

                if (appId !== 'QuickGPT') {
                    console.log("Ignored event: Invalid app");
                    return response.json({ received: true, message: "Ignored event: Invalid app" });
                }

                const transaction = await Transaction.findOne({ _id: transactionId, isPaid: false });
                console.log("Fetched transaction:", transaction);

                if (!transaction) {
                    console.log("Transaction not found or already paid");
                    return response.json({ received: true, message: "Transaction not found or already paid" });
                }

                // Update user credits
                await User.updateOne(
                    { _id: transaction.userId },
                    { $inc: { credits: transaction.credits } }
                );
                console.log(`Updated credits for user ${transaction.userId} by ${transaction.credits}`);

                // Update transaction payment status
                transaction.isPaid = true;
                await transaction.save();
                console.log("Updated transaction isPaid to true:", transaction);

                break;
            }
            default:
                console.log("Unhandled event type:", event.type);
                break;
        }
        response.json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        response.status(500).send("Internal server error");
    }
};

