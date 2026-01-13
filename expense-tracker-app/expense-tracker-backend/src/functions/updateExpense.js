const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("updateExpense", {
  methods: ["PUT"],
  authLevel: "function",
  handler: async (request, context) => {
    try {
      const updatedExpense = await request.json();

      const client = new CosmosClient(process.env.COSMOS_CONNECTION);
      const container = client
        .database("expenseTrackerDB")
        .container("expenses");

      // read existing document
      const { resource: existing } = await container
        .item(updatedExpense.id, updatedExpense.userId)
        .read();

      if (!existing) {
        return { status: 404, jsonBody: { error: "Not found" } };
      }

      // merge new data over existing
      const toSave = { ...existing, ...updatedExpense };

      const { resource: replaced } = await container
        .item(updatedExpense.id, updatedExpense.userId)
        .replace(toSave);

      return { status: 200, jsonBody: replaced };

    } catch (error) {
      return { status: 500, jsonBody: { error: error.message } };
    }
  }
});
