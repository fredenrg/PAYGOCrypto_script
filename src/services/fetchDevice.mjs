import { Device } from "../models/devices.mjs";

export const fetchDevice = async (memo) => {
  if (memo[0] && memo[1]) {
    const device = await Device.findOne({
      PaymentId: memo[0],
      SerialNumber: memo[1],
    })
      .populate("Customer")
      .exec();

    if (device) {
      return device.toJSON();
    }
  }
};
