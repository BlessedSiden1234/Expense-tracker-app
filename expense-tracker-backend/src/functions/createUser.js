const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");
const bcrypt = require("bcrypt");

app.http("createUser", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  handler: async (request, context) => {

    // ✅ Handle CORS preflight
    if (request.method === "OPTIONS") {
      return {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      };
    }

    try {
      const body = await request.json();
      const { userId, username, email, password } = body;

      if (!userId || !username || !email || !password) {
        return {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
          jsonBody: { error: "Missing userId, username, email, or password" },
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const client = new CosmosClient(process.env.COSMOS_CONNECTION);
      const container = client
        .database("expenseTrackerDB")
        .container("expenses");

      const userDoc = {
        id: `user-${userId}`,
        userId,
        username,
        email,
        passwordHash: hashedPassword,
        type: "user",
      };

      const { resource: createdUser } = await container.items.create(userDoc);

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

      const { resource: createdSettings } =
        await container.items.create(settingsDoc);

      const expenseDoc = {
        id: `expenseTable-${userId}`,
        userId,
        type: "expenseTable",
        items: [],
      };

      const savingsDoc = {
        id: `savingsTable-${userId}`,
        userId,
        type: "savingsTable",
        items: [],
      };

      const loanDoc = {
        id: `loanTable-${userId}`,
        userId,
        type: "loanTable",
        items: [],
      };

      const { resource: createdExpenseTable } =
        await container.items.create(expenseDoc);
      const { resource: createdSavingsTable } =
        await container.items.create(savingsDoc);
      const { resource: createdLoanTable } =
        await container.items.create(loanDoc);

      delete createdUser.passwordHash;

      return {
        status: 201,
        headers: { "Access-Control-Allow-Origin": "*" },
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
        headers: { "Access-Control-Allow-Origin": "*" },
        jsonBody: { message: error.message },
      };
    }
  },
});
