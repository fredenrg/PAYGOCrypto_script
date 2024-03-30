export const isSubValid = (usdc, device, days, memo) => {
  if (!usdc) {
    return [false, "Failed, send USDC only!"];
  }

  if (!memo[0] || !memo[1]) {
    return [false, "Failed, Invalid memo format!"];
  }

  if (!device) {
    return [false, "Failed, Wrong device info!"];
  }

  if (!device.Wallet) {
    return [false, "Failed, Distributor No KYC!"];
  }

  if (!device.Customer) {
    return [false, "Failed, Device not assigned!"];
  }

  if (days <= 0) {
    return [false, "Amount not valid!"];
  }

  return [true, ""];
};
