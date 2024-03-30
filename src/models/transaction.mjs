import { Schema, model } from "mongoose";

const transactionSchema = Schema({
  transactionId: { type: String, required: true },
  amount: { type: String, required: true },
  fee: { type: String, required: false },
  memo: { type: String, default: "N/A" },
  token: { type: String, default: "N/A" },
  status: { type: String, required: true },
  description: { type: String, required: true },
  tranxHash: { type: String, required: true },
  date: { type: Number },
  device: { type: Schema.Types.ObjectId, ref: "Device", required: false },
  customer: { type: Schema.Types.ObjectId, ref: "Customer", required: false },
});

export const Transaction = model("Transaction", transactionSchema);
