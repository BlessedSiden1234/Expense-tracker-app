const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("createSettingsForUser", {
  methods: ["POST", "OPTIONS"], // ✅ include OPTIONS for preflight
  authLevel: "anonymous",
  handler: async (request, context) => {
    context.log("createSettingsForUser called");

    // ✅ Handle CORS preflight
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
      const body = await request.json();
      const {
        userId,
        font = "sans-serif",
        mode = "day",
        currency = "US Dollars",
        travelMode = "off",
        fromCurrency = "US Dollars",
        monthLimit = 15000,
        editedCategories = {
          Food: "",
          Automobile: "",
          Entertainment: "",
          Clothing: "",
          Healthcare: "",
          Travel: "",
          Shopping: "",
          "Personal Care": "",
          Investment: "",
          "Gifts & Donations": "",
          "Bills & Utilities": "",
          Others: "",
        },
      } = body;

      if (!userId) {
        return {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
          jsonBody: { error: "Missing userId" },
        };
      }

      const client = new CosmosClient(process.env.COSMOS_CONNECTION);
      const container = client
        .database("expenseTrackerDB")
        .container("expenses");

      const settingsDoc = {
        id: userId, // Use userId as the document ID
        userId,
        font,
        mode,
        currency,
        travelMode,
        fromCurrency,
        monthLimit,
        editedCategories,
        type: "settings",
      };

      const { resource } = await container.items.upsert(settingsDoc);

      context.log("Settings created for user:", resource);

      return {
        status: 201,
        headers: { "Access-Control-Allow-Origin": "*" },
        jsonBody: resource,
      };
    } catch (error) {
      context.log("❌ createSettingsForUser error:", error);

      return {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        jsonBody: {
          message: error.message,
          details: error.response?.body || null,
        },
      };
    }
  },
});
