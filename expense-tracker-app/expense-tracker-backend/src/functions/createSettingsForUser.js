const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("createSettingsForUser", {
  methods: ["POST"],
  authLevel: "function",
  handler: async (request, context) => {
    context.log("createSettingsForUser called with body:", request.body);

    try {
      const body = await request.json();
      const {
        userId,
        font = "sans-serif",
        mode = "day",
        currency = "Indian Rupees",
        travelMode = "off",
        fromCurrency = "Indian Rupees",
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
        jsonBody: resource,
      };
    } catch (error) {
      context.log("❌ createSettingsForUser error:", error);

      return {
        status: 500,
        jsonBody: {
          message: error.message,
          details: error.response?.body || null,
        },
      };
    }
  },
});
