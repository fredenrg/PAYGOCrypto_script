import { PaymentPlan } from "../models/paymentPlan.mjs";

export const fetchPaymentPlan = async (planId) => {
  const paymentPlan = await PaymentPlan.findOne({ _id: planId });

  return paymentPlan;
};
