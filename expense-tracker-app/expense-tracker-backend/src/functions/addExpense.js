const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("addExpense", {
  methods: ["POST"],
  authLevel: "function",
  handler: async (request, context) => {
    context.log("addExpense called");

    try {
      const body = await request.json();
      const {
        userId,
        date,
        expense,
        category,
        comments = "",
        day
      } = body;

      if (!userId || !date || expense == null || !category) {
        return {
          status: 400,
          jsonBody: {
            error: "Missing fields (userId, date, expense, or category)"
          }
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
        expenseTable = {
          id: expenseTableId,
          userId,
          type: "expenseTable",
          items: [],
          createdAt: new Date().toISOString()
        };
      }

      const newExpense = {
        id: `expense-${Date.now()}`,
        date,
        expense,
        category,
        comments,
        day,
        createdAt: new Date().toISOString()
      };

      expenseTable.items.push(newExpense);
      expenseTable.updatedAt = new Date().toISOString();

      await container.items.upsert(expenseTable, {
        partitionKey: userId
      });

      return {
        status: 201,
        jsonBody: newExpense
      };

    } catch (error) {
      context.log("❌ addExpense error:", error);
      return {
        status: 500,
        jsonBody: { error: error.message }
      };
    }
  }
});
