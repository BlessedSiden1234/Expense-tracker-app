const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("getSettingsForUser", {
  methods: ["GET"],
  authLevel: "function",
  handler: async (request, context) => {
    context.log("getSettingsForUser called"); // log function call

    try {
      const userId = request.query.get("userId");
      context.log("Received userId:", userId);

      if (!userId) {
        context.log("No userId provided");
        return {
          status: 400,
          jsonBody: { error: "Missing userId" },
        };
      }

      const client = new CosmosClient(process.env.COSMOS_CONNECTION);
      const container = client
        .database("expenseTrackerDB")
        .container("expenses");

      // Query the document where userId matches and type is 'settings'
      const querySpec = {
        query: "SELECT * FROM c WHERE c.userId = @userId AND c.type = 'settings'",
        parameters: [{ name: "@userId", value: userId }],
      };

      const { resources: results } = await container.items.query(querySpec).fetchAll();
      context.log("Query results:", results);

      if (results.length === 0) {
        context.log("No settings found for userId:", userId);
        return {
          status: 404,
          jsonBody: { message: "Settings not found" },
        };
      }

      context.log("Settings found:", results[0]);
      return {
        status: 200,
        jsonBody: results[0],
      };
    } catch (error) {
      context.log("❌ getSettingsForUser error", error);
      return {
        status: 500,
        jsonBody: { error: "Internal server error" },
      };
    }
  },
});
