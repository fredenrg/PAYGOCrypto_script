export const generateInputObject = (device, days) =>
  JSON.stringify({ ...device, days });
