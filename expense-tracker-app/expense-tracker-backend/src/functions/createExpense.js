const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("createExpense", {
  methods: ["POST"],
  authLevel: "function",
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const {
        userId,
        date,
        expense,
        category,
        comments,
        day
      } = body;

      // Basic validation
      if (!userId || !date || expense == null || !category) {
        return {
          status: 400,
          jsonBody: { error: "Missing fields (userId, date, expense, or category)" }
        };
      }

      // Connect to Cosmos DB
      const client = new CosmosClient(process.env.COSMOS_CONNECTION);
      const container = client
        .database("expenseTrackerDB")
        .container("expenses");

      // Create a unique ID for this expense (could be timestamp or UUID)
      const itemId = `${userId}-${Date.now()}`;

      // Build the document
      const expenseDoc = {
        id: itemId,
        userId,
        date,
        expense,
        category,
        comments: comments || "",
        day,
        type: "expense"
      };

      // Insert into Cosmos DB
      const { resource } = await container.items.create(expenseDoc);

      return {
        status: 201,
        jsonBody: resource
      };
    } catch (error) {
      context.log("❌ createExpense error:", error);
      return {
        status: 500,
        jsonBody: { error: "Internal server error" }
      };
    }
  }
});
