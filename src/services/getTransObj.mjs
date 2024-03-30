import { parsePlanAmount } from "./parsePlanAmount.mjs";

export const getTransObj = (result, type, device) => {
  if (type === "script<->refund") {
    return result;
  } else if (type === "sript->customer") {
    return { ...result, from: device.Customer.wallet, amount: "0.0000001" };
  } else if (type === "sript->sender") {
    return { ...result, amount: "0.0000001" };
  } else if (type === "sript->distributor") {
    const fraction = parsePlanAmount(device);
    const amount = (fraction * +result.amount).toFixed(2);
    return { ...result, amount, from: device.Wallet };
  }
};
