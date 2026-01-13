const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");
const bcrypt = require("bcrypt");

app.http("createUser", {
  methods: ["POST"],
  authLevel: "function",
  handler: async (request, context) => {
    context.log("createUser called with body:", request.body);

    try {
      const body = await request.json();
      const { userId, username, email, password } = body;

      if (!userId || !username || !email || !password) {
        context.log("createUser - missing fields:", body);
        return {
          status: 400,
          jsonBody: { error: "Missing userId, username, email, or password" },
        };
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const client = new CosmosClient(process.env.COSMOS_CONNECTION);
      const container = client.database("expenseTrackerDB").container("expenses");

      // --- Create User Document ---
      const userDoc = {
        id: `user-${userId}`, // unique ID for user
        userId,
        username,
        email,
        passwordHash: hashedPassword,
        type: "user",
      };
      const { resource: createdUser } = await container.items.create(userDoc);
      context.log("User created:", createdUser);

      // --- Create Default Settings Document ---
      const settingsDoc = {
        id: `settings-${userId}`,
        userId,
        font: "sans-serif",
        mode: "day",
        currency: "US Dollars",
        travelMode: "off",
        fromCurrency: "US Dollars",
        monthLimit: 15000,
        editedCategories: {
          Food: "",
          Automobile: "",
          Entertainment: "",
          Clothing: "",
          Healthcare: "",
          Travel: "",
          Shopping: "",
          "Personal Care": "",
          Investment: "",
          "Gifts & Donations": "",
          "Bills & Utilities": "",
          Others: "",
        },
        type: "settings",
      };
      const { resource: createdSettings } = await container.items.create(settingsDoc);
      context.log("Default settings created:", createdSettings);

      // --- Create Empty Expense Table ---
      const expenseDoc = {
        id: `expenseTable-${userId}`,
        userId,
        type: "expenseTable",
        items: [], // starts empty
      };
      const { resource: createdExpenseTable } = await container.items.create(expenseDoc);
      context.log("Expense table created:", createdExpenseTable);

      // --- Create Empty Savings Table ---
      const savingsDoc = {
        id: `savingsTable-${userId}`,
        userId,
        type: "savingsTable",
        items: [], // starts empty
      };
      const { resource: createdSavingsTable } = await container.items.create(savingsDoc);
      context.log("Savings table created:", createdSavingsTable);

      // --- Create Empty Loan Table ---
      const loanDoc = {
        id: `loanTable-${userId}`,
        userId,
        type: "loanTable",
        items: [], // starts empty
      };
      const { resource: createdLoanTable } = await container.items.create(loanDoc);
      context.log("Loan table created:", createdLoanTable);

      // Remove sensitive info
      delete createdUser.passwordHash;

      return {
        status: 201,
        jsonBody: {
          user: createdUser,
          settings: createdSettings,
          tables: {
            expenses: createdExpenseTable,
            savings: createdSavingsTable,
            loans: createdLoanTable,
          },
        },
      };
    } catch (error) {
      context.log("❌ createUser error:", error);
      return {
        status: 500,
        jsonBody: {
          message: error.message,
          details: error.response?.body || null,
        },
      };
    }
  },
});
