const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("deleteExpense", {
  methods: ["DELETE"],
  authLevel: "function",
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const { expenseId, userId } = body;

      if (!expenseId || !userId) {
        return {
          status: 400,
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
        jsonBody: { success: true }
      };
    } catch (error) {
      context.log("❌ deleteExpense error:", error);
      return {
        status: 500,
        jsonBody: { error: "Internal server error" }
      };
    }
  }
});
