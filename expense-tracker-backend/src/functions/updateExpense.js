const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("updateExpense", {
  methods: ["PUT", "OPTIONS"], // ✅ include OPTIONS for preflight
  authLevel: "anonymous",
  handler: async (request, context) => {

    // ✅ Handle CORS preflight
    if (request.method === "OPTIONS") {
      return {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      };
    }

    try {
      const updatedExpense = await request.json();

      if (!updatedExpense.id || !updatedExpense.userId) {
        return {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
          jsonBody: { error: "Missing expense id or userId" }
        };
      }

      const client = new CosmosClient(process.env.COSMOS_CONNECTION);
      const container = client
        .database("expenseTrackerDB")
        .container("expenses");

      // read existing document
      const { resource: existing } = await container
        .item(updatedExpense.id, updatedExpense.userId)
        .read();

      if (!existing) {
        return {
          status: 404,
          headers: { "Access-Control-Allow-Origin": "*" },
          jsonBody: { error: "Expense not found" }
        };
      }

      // merge new data over existing
      const toSave = { ...existing, ...updatedExpense };

      const { resource: replaced } = await container
        .item(updatedExpense.id, updatedExpense.userId)
        .replace(toSave);

      return {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        jsonBody: replaced
      };

    } catch (error) {
      context.log("❌ updateExpense error:", error);
      return {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        jsonBody: { error: error.message }
      };
    }
  }
});
