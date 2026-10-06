# Personal Finance Agent

A simple AI-powered personal finance assistant built with Node.js, MongoDB, and Groq.

The agent can understand natural-language finance questions and use tools to fetch data from MongoDB.

## Features

* Check account balance
* View latest transactions
* Filter transactions by category and date
* Get monthly spending summaries
* Find the highest spending category
* Set monthly budgets
* Check budget status
* Natural-language interaction through a terminal

## Tech Stack

* Node.js
* MongoDB
* MongoDB Aggregation
* Groq API
* JavaScript
* dotenv

## How It Works

```text
User
  ↓
Groq
  ↓
Tool Selection
  ↓
Node.js Function
  ↓
MongoDB
  ↓
Tool Result
  ↓
Groq
  ↓
Final Answer
```

## Available Tools

### getBalance

Returns the user's current account balance.

### getTransactions

Returns the latest 10 transactions and can filter them by category or date.

### getSpendingSummary

Uses MongoDB aggregation to calculate monthly spending by category.

### setBudget

Creates or updates a monthly budget for a category.

### checkBudgetStatus

Shows the budget limit, amount spent, and remaining amount.

## Example Questions

```text
What is my current balance?

Show me my latest transactions.

How much did I spend in September?

Which category did I spend the most on?

Set my shopping budget to ₹10,000.

Check my shopping budget.
```

## Setup

Clone the repository and install the dependencies:

```bash
npm install
```

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/personalFinance
GROQ_API_KEY=your_groq_api_key
```

Make sure MongoDB is running.

Seed the database:

```bash
node seed.js
```

Start the application:

```bash
node server.js
```

## Note

This project uses sample transaction data for demonstration purposes.

The `.env` file is ignored by Git and should never be committed because it contains API credentials.
