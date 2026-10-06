import { getDB } from "./db.js";

// 1. Get account balance
export async function getBalance(accountId) {
  const db = await getDB();

  const account = await db.collection("accounts").findOne({
    accountId
  });

  if (!account) {
    return { error: "Account not found" };
  }

  return {
    balance: account.balance,
    accountType: account.accountType
  };
}


// 2. Get latest transactions
export async function getTransactions(
  accountId,
  category,
  fromDate,
  toDate
) {
  const db = await getDB();

  const query = {
    accountId
  };

  if (category) {
    query.category = category;
  }

  if (fromDate || toDate) {
    query.date = {};

    if (fromDate) {
      query.date.$gte = new Date(fromDate);
    }

    if (toDate) {
      query.date.$lte = new Date(toDate);
    }
  }

  return await db
    .collection("transactions")
    .find(query)
    .sort({ date: -1 })
    .limit(10)
    .toArray();
}


// 3. Get spending summary
export async function getSpendingSummary(accountId, month) {
  const db = await getDB();

  const startDate = new Date(`${month}-01`);

  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const result = await db.collection("transactions").aggregate([
    {
      $match: {
        accountId,
        type: "debit",
        date: {
          $gte: startDate,
          $lt: endDate
        }
      }
    },

    {
      $group: {
        _id: "$category",
        total: {
          $sum: "$amount"
        }
      }
    },

    {
      $sort: {
        total: -1
      }
    }
  ]).toArray();

  return result.map(item => ({
    category: item._id,
    total: item.total
  }));
}


// 4. Set budget
export async function setBudget(userId, category, limit) {
  const db = await getDB();

  const month = new Date()
    .toISOString()
    .slice(0, 7);

  await db.collection("budgets").updateOne(
    {
      userId,
      category,
      month
    },
    {
      $set: {
        userId,
        category,
        monthlyLimit: limit,
        month
      }
    },
    {
      upsert: true
    }
  );

  return {
    message: `Budget set to ₹${limit} for ${category}`,
    category,
    limit,
    month
  };
}


// 5. Check budget status
export async function checkBudgetStatus(userId, category) {
  const db = await getDB();

  const month = new Date()
    .toISOString()
    .slice(0, 7);

  const budget = await db.collection("budgets").findOne({
    userId,
    category,
    month
  });

  if (!budget) {
    return {
      error: `No budget found for ${category}`
    };
  }

  const startDate = new Date(`${month}-01`);

  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const result = await db.collection("transactions").aggregate([
    {
      $match: {
        accountId: "acc_001",
        category,
        type: "debit",
        date: {
          $gte: startDate,
          $lt: endDate
        }
      }
    },

    {
      $group: {
        _id: null,
        total: {
          $sum: "$amount"
        }
      }
    }
  ]).toArray();

  const spent = result[0]?.total || 0;

  return {
    category,
    spent,
    limit: budget.monthlyLimit,
    remaining: budget.monthlyLimit - spent
  };
}