export const getNumOfDays = (amount, plan) => {
  if (amount && plan) {
    const planMatch = plan.plans.find(
      (item) =>
        parseFloat(amount).toFixed(2) === parseFloat(item.usdc).toFixed(2)
    );

    if (!planMatch) {
      return 0;
    }
    return +planMatch.days;
  } else {
    return 0;
  }
};
