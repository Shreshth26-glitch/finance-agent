import { connectDB } from "./db.js";

const db = await connectDB();

const accountsCollection = db.collection("accounts");
const transactionsCollection = db.collection("transactions");
const budgetsCollection = db.collection("budgets");

// Clear old data
await accountsCollection.deleteMany({});
await transactionsCollection.deleteMany({});
await budgetsCollection.deleteMany({});

// Create account
await accountsCollection.insertOne({
  accountId: "acc_001",
  userId: "user_001",
  accountType: "savings",
  balance: 45000
});

const categories = [
  "food",
  "travel",
  "shopping",
  "bills"
];

const merchants = {
  food: ["Swiggy", "Zomato", "McDonald's"],
  travel: ["Uber", "Ola", "Metro"],
  shopping: ["Amazon", "Flipkart", "Myntra"],
  bills: ["Airtel", "Jio", "Electricity"]
};

const transactionData = [];

for (let i = 1; i <= 200; i++) {

  const category =
    categories[Math.floor(Math.random() * categories.length)];

  const merchantList = merchants[category];

  const merchant =
    merchantList[
      Math.floor(Math.random() * merchantList.length)
    ];

  const amount =
    Math.floor(Math.random() * 3000) + 100;

  const day =
    Math.floor(Math.random() * 30) + 1;

  transactionData.push({
    txnId: `txn_${i}`,
    accountId: "acc_001",
    amount,
    type: "debit",
    category,
    merchant,
    date: new Date(
      `2026-09-${String(day).padStart(2, "0")}`
    )
  });
}

await transactionsCollection.insertMany(transactionData);

console.log("200 transactions added successfully!");

process.exit();