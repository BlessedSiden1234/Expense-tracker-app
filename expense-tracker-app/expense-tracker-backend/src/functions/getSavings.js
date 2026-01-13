const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("getSavings", {
  methods: ["GET", "POST"],
  authLevel: "function",
  handler: async (request, context) => {
    try {
      const userId =
        request.query.get("userId") ||
        (await request.json()).userId;

      if (!userId) {
        return {
          status: 400,
          jsonBody: { error: "Missing userId parameter" },
        };
      }

      const client = new CosmosClient(process.env.COSMOS_CONNECTION);
      const container = client
        .database("expenseTrackerDB")
        .container("expenses");

      const querySpec = {
        query: "SELECT * FROM c WHERE c.userId = @userId AND c.type = @type ORDER BY c.date DESC",
        parameters: [
          { name: "@userId", value: userId },
          { name: "@type", value: "saving" },
        ],
      };

      const { resources: results } = await container.items
        .query(querySpec)
        .fetchAll();

      return {
        status: 200,
        jsonBody: results,
      };
    } catch (error) {
      context.log("❌ getSavings error:", error);
      return {
        status: 500,
        jsonBody: { error: "Internal server error" },
      };
    }
  },
});
