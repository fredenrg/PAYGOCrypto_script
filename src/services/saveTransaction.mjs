import { v4 as uuidV4 } from "uuid";
import { Transaction } from "../models/transaction.mjs";
import { parsePlanAmount } from "./parsePlanAmount.mjs";

export const saveTransaction = async (
  { amount, transaction_hash, hash, asset_code, asset_type },
  memo,
  device,
  status,
  token
) => {
  try {
    const fraction = status === "successful" ? parsePlanAmount(device) : 0;
    const fee = status === "successful" ? +amount - fraction * +amount : 0;

    const transactionObj = {
      transactionId: uuidV4(),
      amount: `${parseFloat(amount).toFixed(2)} ${
        asset_type === "native" ? "XLM" : asset_code
      }`,
      fee: fee.toFixed(2),
      memo,
      token,
      status,
      description: `transaction ${status}. ${memo}`,
      tranxHash: `https://stellar.expert/explorer/public/tx/${
        transaction_hash ? transaction_hash : hash
      }`,
      device: device?._id,
      customer: device?.Customer?._id,
      date: Date.now(),
    };

    const transaction = new Transaction(transactionObj);
    await transaction.save();
  } catch (err) {
    throw err;
  }
};
