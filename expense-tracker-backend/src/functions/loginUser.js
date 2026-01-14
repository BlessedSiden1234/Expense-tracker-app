const { app } = require("@azure/functions");

app.http("loginUser", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    // Lazy imports to prevent startup crashes
    const { CosmosClient } = require("@azure/cosmos");
    const bcrypt = require("bcryptjs");

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      };
    }

    try {
      const { email, password } = await request.json();

      if (!email || !password) {
        return {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
          jsonBody: { error: "Missing email or password" },
        };
      }

      const connectionString = process.env.COSMOS_CONNECTION;
      if (!connectionString) {
        context.log("❌ COSMOS_CONNECTION not set in environment");
        return {
          status: 500,
          headers: { "Access-Control-Allow-Origin": "*" },
          jsonBody: { error: "Database connection not configured" },
        };
      }

      // Initialize Cosmos client lazily
      const client = new CosmosClient(connectionString);
      const container = client
        .database("expenseTrackerDB")
        .container("expenses");

      // Query user by email
      const querySpec = {
        query: "SELECT * FROM c WHERE c.email = @email AND c.type = @type",
        parameters: [
          { name: "@email", value: email },
          { name: "@type", value: "user" },
        ],
      };

      const { resources: results } = await container.items.query(querySpec).fetchAll();

      if (results.length === 0) {
        return {
          status: 401,
          headers: { "Access-Control-Allow-Origin": "*" },
          jsonBody: { error: "Invalid credentials" },
        };
      }

      const user = results[0];

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return {
          status: 401,
          headers: { "Access-Control-Allow-Origin": "*" },
          jsonBody: { error: "Invalid credentials" },
        };
      }

      delete user.passwordHash;

      return {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        jsonBody: user,
      };
    } catch (error) {
      context.log("❌ loginUser error", error);
      return {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        jsonBody: { error: "Internal server error" },
      };
    }
  },
});
