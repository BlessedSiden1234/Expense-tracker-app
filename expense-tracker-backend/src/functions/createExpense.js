const { app } = require("@azure/functions");

app.http("createUser", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    // ✅ Lazy imports to prevent startup crash
    const { CosmosClient } = require("@azure/cosmos");
    const bcrypt = require("bcryptjs");

    // Handle CORS preflight
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

      const connectionString = process.env.COSMOS_CONNECTION;
      if (!connectionString) {
        context.log("❌ COSMOS_CONNECTION not set in environment");
        return {
          status: 500,
          headers: { "Access-Control-Allow-Origin": "*" },
          jsonBody: { error: "Database connection not configured" },
        };
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Initialize Cosmos client lazily
      const client = new CosmosClient(connectionString);
      const container = client.database("expenseTrackerDB").container("expenses");

      // Create user document
      const userDoc = {
        id: `user-${userId}`,
        userId,
        username,
        email,
        passwordHash: hashedPassword,
        type: "user",
      };
      const { resource: createdUser } = await container.items.create(userDoc);

      // Create settings document
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

      // Create empty tables
      const tableDocs = [
        { id: `expenseTable-${userId}`, type: "expenseTable", items: [] },
        { id: `savingsTable-${userId}`, type: "savingsTable", items: [] },
        { id: `loanTable-${userId}`, type: "loanTable", items: [] },
      ];

      const [createdExpenseTable, createdSavingsTable, createdLoanTable] =
        await Promise.all(tableDocs.map(doc => container.items.create({ ...doc, userId })));

      // Remove password hash from response
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
        jsonBody: { error: "Internal server error", message: error.message },
      };
    }
  },
});
