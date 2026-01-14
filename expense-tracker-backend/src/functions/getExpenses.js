const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("getExpenses", {
  methods: ["GET", "POST", "OPTIONS"], // ✅ include OPTIONS for preflight
  authLevel: "anonymous",
  handler: async (request, context) => {
    context.log("getExpenses called");

    // ✅ Handle CORS preflight
    if (request.method === "OPTIONS") {
      return {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      };
    }

    try {
      // Get userId from query or POST body
      const userId =
        request.query.get("userId") ||
        (await request.json()).userId;

      if (!userId) {
        return {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
          jsonBody: { error: "Missing userId parameter" },
        };
      }

      const client = new CosmosClient(process.env.COSMOS_CONNECTION);
      const container = client
        .database("expenseTrackerDB")
        .container("expenses");

      const expenseTableId = `expenseTable-${userId}`;

      let expenseTable;

      try {
        const response = await container
          .item(expenseTableId, userId)
          .read();
        expenseTable = response.resource;
      } catch {
        // No expense table exists yet
        return {
          status: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          jsonBody: [],
        };
      }

      // Sort expenses by date descending
      const sortedExpenses = expenseTable.items.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split("/").map(Number);
        const [dayB, monthB, yearB] = b.date.split("/").map(Number);
        return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
      });

      return {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        jsonBody: sortedExpenses,
      };
    } catch (error) {
      context.log("❌ getExpenses error:", error);
      return {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        jsonBody: { error: error.message },
      };
    }
  },
});
