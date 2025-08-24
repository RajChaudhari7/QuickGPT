import Stripe from "stripe";
import { Transaction } from "../models/Transaction.js";
import { User } from "../models/User.js";

// function for stripe webhooks
export const stripeWebhooks = async (request, response) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const sig = request.headers["stripe-signature"]

    let event;

    try {

        event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOKS_SECRET)

    } catch (error) {
        return response.status(404).send(`Webhook error : ${error.message}`)
    }
    try {

        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;
                const sessionList = await stripe.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                })

                const session = sessionList.data[0];
                const { transactionId, appId } = session.metadata;

                if (appId === 'QuickGPT') {
                    const transaction = await Transaction.findOne({ _id: transactionId, isPaid: false })

                    // update credits in user account
                    await User.updateOne({ _id: transaction.userId }, {
                        $inc: {
                            credits: transaction.credits
                        }
                    })

                    //update credit payment status
                    transaction.isPaid = true
                    await transaction.save()
                } else {
                    return response.json({ received: true, message: "Ignored event: Invalid app" })
                }
                break;
            }


            default:
                console.log("Unhandled event type:", event.type);

                break;
        }

        response.json({ received: true })

    } catch (error) {
        console.error("Webhook processing error:", error);
        response.status(500).send("Internal server error")
    }
}