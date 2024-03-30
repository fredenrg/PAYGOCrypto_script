export const parsePlanAmount = (device) => {
  if (device.Plan === "free") {
    return 0.94;
  } else if (device.Plan === "standard") {
    return 0.95;
  } else if (device.Plan === "premium") {
    return 0.96;
  }
};
