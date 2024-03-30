import { Device } from "../models/devices.mjs";

export const updateDevice = async (device, count, amount) =>
  await Device.findOneAndUpdate(
    { _id: device._id },
    { $set: { ...device, Count: +count, Amount: device.Amount + +amount } }
  );
