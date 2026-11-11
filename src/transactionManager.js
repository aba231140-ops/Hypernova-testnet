
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@hypernova_transactions";

export async function getTransactions() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    throw new Error("Impossible de lire l'historique.");
  }
}

export async function addTransaction(transaction) {
  if (!transaction || !transaction.type) {
    throw new Error("Informations de transaction manquantes.");
  }

  const transactions = await getTransactions();

  const newTransaction = {
    id: `${Date.now()}-${Math.random()}`,
    type: transaction.type,
    network: transaction.network,
    token: transaction.token || "",
    amount: transaction.amount || "0",
    hash: transaction.hash || "",
    status: "pending",
    createdAt: new Date().toISOString()
  };

  const updated = [newTransaction, ...transactions];

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );

  return newTransaction;
}

export async function updateTransactionStatus(id, status) {
  const allowedStatuses = [
    "pending",
    "confirmed",
    "failed"
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Statut invalide.");
  }

  const transactions = await getTransactions();

  const updated = transactions.map(transaction =>
    transaction.id === id
      ? { ...transaction, status }
      : transaction
  );

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );

  return updated;
}
