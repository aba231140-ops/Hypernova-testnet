
export const XP_RULES = {
  walletConnected: 10,
  firstSwap: 50,
  swap: 10,
  deposit: 15,
  withdrawal: 15
};

export function calculateXP(activity, isFirst = false) {
  if (activity === "walletConnected") {
    return isFirst ? XP_RULES.walletConnected : 0;
  }

  if (activity === "swap") {
    return isFirst
      ? XP_RULES.firstSwap
      : XP_RULES.swap;
  }

  if (activity === "deposit") {
    return XP_RULES.deposit;
  }

  if (activity === "withdrawal") {
    return XP_RULES.withdrawal;
  }

  return 0;
}

export function createXPRecord(
  activity,
  points,
  transactionHash = null
) {
  return {
    id: `${activity}-${Date.now()}`,
    activity,
    points,
    transactionHash,
    createdAt: new Date().toISOString(),
    status: transactionHash ? "pending" : "preview"
  };
}

export function getTotalXP(records = []) {
  return records
    .filter(record => record.status === "confirmed")
    .reduce((total, record) => total + record.points, 0);
}
