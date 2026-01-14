const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("deleteExpense", {
  methods: ["DELETE", "OPTIONS"], // ✅ include OPTIONS for preflight
  authLevel: "anonymous",
  handler: async (request, context) => {

    // ✅ Handle CORS preflight
    if (request.method === "OPTIONS") {
      return {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      };
    }

    try {
      const body = await request.json();
      const { expenseId, userId } = body;

      if (!expenseId || !userId) {
        return {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
          jsonBody: { error: "Missing expenseId or userId" }
        };
      }

      const client = new CosmosClient(process.env.COSMOS_CONNECTION);
      const container = client
        .database("expenseTrackerDB")
        .container("expenses");

      // Delete the item by ID + partitionKey
      await container
        .item(expenseId, userId)
        .delete();

      return {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        jsonBody: { success: true }
      };

    } catch (error) {
      context.log("❌ deleteExpense error:", error);
      return {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        jsonBody: { error: "Internal server error" }
      };
    }
  }
});
