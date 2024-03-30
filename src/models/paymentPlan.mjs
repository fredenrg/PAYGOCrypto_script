import { Schema, model } from "mongoose";

const paymentPlanSchema = Schema({
  distributorId: { type: Number, required: true },
  name: { type: String, required: true },
  total: { type: String, required: true },
  devices: { type: String, required: true },
  plans: [
    {
      usdc: { type: String, required: true },
      days: { type: String, required: true },
    },
  ],
});

export const PaymentPlan = model("PaymentPlan", paymentPlanSchema);
