import { Schema, model } from "mongoose";

const customerSchema = Schema({
  fullName: { type: String },
  email: { type: String },
  address: { type: String },
  country: { type: String },
  phone: { type: String },
  gender: { type: String },
  avatar: { type: String },
  devices: [{ type: Schema.Types.ObjectId, ref: "Device" }],
  transactions: [{ type: Schema.Types.ObjectId, ref: "Transaction" }],
});

export const Customer = model("Customer", customerSchema);
