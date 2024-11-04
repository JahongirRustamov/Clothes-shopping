import Stripe from "stripe";
import { config } from "dotenv";

config();
export const stripe = new Stripe(process.env.Stripe_Secret_Key);
