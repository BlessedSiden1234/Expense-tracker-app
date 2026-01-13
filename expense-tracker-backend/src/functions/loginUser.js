const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");
const bcrypt = require("bcrypt");

app.http("loginUser", {
  methods: ["POST"],
  authLevel: "function",
  handler: async (request, context) => {
    try {
      const { email, password } = await request.json();

      if (!email || !password) {
        return {
          status: 400,
          jsonBody: { error: "Missing email or password" },
        };
      }

      const client = new CosmosClient(process.env.COSMOS_CONNECTION);
      const container = client
        .database("expenseTrackerDB")
        .container("expenses");

      // Find user by email
      const querySpec = {
        query: "SELECT * FROM c WHERE c.email = @email AND c.type = @type",
        parameters: [
          { name: "@email", value: email },
          { name: "@type", value: "user" },
        ],
      };

      const { resources: results } = await container.items
        .query(querySpec)
        .fetchAll();

      if (results.length === 0) {
        return {
          status: 401,
          jsonBody: { error: "Invalid credentials" }
        };
      }

      const user = results[0];

      // Compare the plain password with the stored bcrypt hash
      const isMatch = await bcrypt.compare(password, user.passwordHash);

      if (!isMatch) {
        return {
          status: 401,
          jsonBody: { error: "Invalid credentials" }
        };
      }

      // Remove the hashed password before returning
      delete user.passwordHash;

      return {
        status: 200,
        jsonBody: user
      };
    } catch (error) {
      context.log("❌ loginUser error", error);
      return {
        status: 500,
        jsonBody: { error: "Internal server error" }
      };
    }
  }
});
