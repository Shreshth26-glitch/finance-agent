import Groq from "groq-sdk";
import readline from "readline";
import dotenv from "dotenv";

import { connectDB } from "./db.js";
import {
  getBalance,
  getTransactions,
  getSpendingSummary,
  setBudget,
  checkBudgetStatus
} from "./tools.js";

dotenv.config();

await connectDB();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const tools = [
  {
    type: "function",
    function: {
      name: "getBalance",
      description: "Get the user's account balance.",
      parameters: {
        type: "object",
        properties: {
          accountId: {
            type: "string"
          }
        },
        required: ["accountId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getTransactions",
      description: "Get the latest 10 transactions, optionally filtered by category and date.",
      parameters: {
        type: "object",
        properties: {
          accountId: {
            type: "string"
          },
          category: {
            type: "string"
          },
          fromDate: {
            type: "string"
          },
          toDate: {
            type: "string"
          }
        },
        required: ["accountId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getSpendingSummary",
      description: "Get total spending grouped by category for a specific month.",
      parameters: {
        type: "object",
        properties: {
          accountId: {
            type: "string"
          },
          month: {
            type: "string",
            description: "Month in YYYY-MM format"
          }
        },
        required: ["accountId", "month"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "setBudget",
      description: "Set a monthly spending budget for a category.",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "string"
          },
          category: {
            type: "string"
          },
          limit: {
            type: "number"
          }
        },
        required: ["userId", "category", "limit"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "checkBudgetStatus",
      description: "Check spending and remaining budget for a category.",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "string"
          },
          category: {
            type: "string"
          }
        },
        required: ["userId", "category"]
      }
    }
  }
];

async function executeTool(name, args) {
  if (name === "getBalance") {
    return await getBalance(args.accountId);
  }

  if (name === "getTransactions") {
    return await getTransactions(
      args.accountId,
      args.category,
      args.fromDate,
      args.toDate
    );
  }

  if (name === "getSpendingSummary") {
    return await getSpendingSummary(
      args.accountId,
      args.month
    );
  }

  if (name === "setBudget") {
    return await setBudget(
      args.userId,
      args.category,
      args.limit
    );
  }

  if (name === "checkBudgetStatus") {
    return await checkBudgetStatus(
      args.userId,
      args.category
    );
  }

  return {
    error: "Unknown tool"
  };
}

async function askAgent(question) {
  const messages = [
    {
      role: "system",
      content: `
You are a simple personal finance assistant.

The user's accountId is acc_001.
The user's userId is user_001.

Use the available tools whenever the user asks about:

- account balance
- transactions
- spending
- spending categories
- budgets

Never invent financial information.

Always use the database tools for financial data.

Keep your answers short and easy to understand.

All amounts are in Indian Rupees (₹).
Always use ₹ instead of $.

If the user asks for all transactions, explain that the system only returns the latest 10 transactions.

If the user mentions a month without a year, assume 2026.

For example:
"September" means "2026-09".
"October" means "2026-10".

If the user asks "this month", use 2026-10.

If the user asks which category they spent the most on,
use getSpendingSummary and find the category with the highest total.
`
    },
    {
      role: "user",
      content: question
    }
  ];

  let response = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages,
    tools,
    tool_choice: "auto"
  });

  const assistantMessage = response.choices[0].message;

  messages.push(assistantMessage);

  if (assistantMessage.tool_calls) {
    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      console.log(`Using tool: ${toolName}`);

      const result = await executeTool(toolName, args);

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result)
      });
    }

    messages.push({
      role: "system",
      content: "Give the final answer using only the tool results above. Do not call any tools."
    });

    response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages,
      tool_choice: "none"
    });
  }

  return response.choices[0].message.content;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("\nPersonal Finance Agent");
console.log("Type 'exit' to quit.\n");

function askQuestion() {
  rl.question("You: ", async question => {
    if (question.toLowerCase() === "exit") {
      rl.close();
      process.exit(0);
    }

    try {
      const answer = await askAgent(question);

      console.log(`\nAgent: ${answer}\n`);
    } catch (error) {
      console.error("\nError:", error.message);
    }

    askQuestion();
  });
}

askQuestion();