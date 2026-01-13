const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("getUser", {
  methods: ["GET", "POST"],
  authLevel: "function",
  handler: async (request, context) => {
    try {
      // Get userId from query or JSON body
      const userId = request.query.get("userId") || (await request.json()).userId;

      if (!userId) {
        return {
          status: 400,
          jsonBody: { error: "Missing userId parameter" }
        };
      }

      // Connect to Cosmos DB
      const client = new CosmosClient(process.env.COSMOS_CONNECTION);
      const container = client
        .database("expenseTrackerDB")
        .container("expenses");

      // Query for the user document
      const querySpec = {
        query: "SELECT * FROM c WHERE c.userId = @userId AND c.type = @type",
        parameters: [
          { name: "@userId", value: userId },
          { name: "@type", value: "user" }
        ]
      };

      const { resources: results } = await container.items
        .query(querySpec)
        .fetchAll();

      if (results.length === 0) {
        return {
          status: 404,
          jsonBody: { error: "User not found" }
        };
      }

      // Return the first match
      return {
        status: 200,
        jsonBody: results[0]
      };
    } catch (error) {
      context.log("❌ getUser error:", error);
      return {
        status: 500,
        jsonBody: {
          message: error.message,
          details: error.response?.body || null
        }
      };
    }
  }
});
