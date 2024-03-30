import { Schema, model } from "mongoose";

const deviceSchema = Schema({
  SerialNumber: { type: Number, required: true },
  StartingCode: { type: Number, required: true },
  Key: { type: String, required: true },
  Count: { type: Number, required: true },
  Amount: { type: Number, required: true },
  Owner: { type: Number, required: true },
  Wallet: { type: String, required: false },
  Customer: { type: Schema.Types.ObjectId, ref: "Customer" },
});

deviceSchema.methods.toJSON = function () {
  const device = this;

  const deviceObject = device.toObject();

  return deviceObject;
};

export const Device = model("Device", deviceSchema);
