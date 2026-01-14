const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("addLoan", {
  methods: ["POST", "OPTIONS"], // ✅ include OPTIONS for preflight
  authLevel: "anonymous",
  handler: async (request, context) => {
    context.log("addLoan called");

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
        lender,
        amount,
        loanType = "Given",
        interestRate = 0,
        startDate,
        endDate = null,
        status = "active",
        notes = ""
      } = body;

      // ---- Validation ----
      if (!userId || !lender || amount == null || !startDate) {
        return {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
          jsonBody: {
            error: "Missing fields (userId, lender, amount, or startDate)"
          }
        };
      }

      const client = new CosmosClient(process.env.COSMOS_CONNECTION);
      const container = client
        .database("expenseTrackerDB")
        .container("expenses");

      const loanTableId = `loanTable-${userId}`;
      let loanTable;

      // ---- Read or Create Loan Table ----
      try {
        const response = await container.item(loanTableId, userId).read();
        loanTable = response.resource;
      } catch {
        loanTable = {
          id: loanTableId,
          userId,
          type: "loanTable",
          items: [],
          createdAt: new Date().toISOString()
        };
      }

      // ---- New Loan Object ----
      const newLoan = {
        id: `loan-${Date.now()}`,
        lender,
        amount,
        loanType,
        interestRate,
        startDate,
        endDate,
        status,
        notes,
        day: new Date(startDate).getDay(), // optional
        createdAt: new Date().toISOString()
      };

      loanTable.items.push(newLoan);
      loanTable.updatedAt = new Date().toISOString();

      // ---- Save to Cosmos ----
      await container.items.upsert(loanTable, { partitionKey: userId });

      // ---- Return JSON response ----
      return {
        status: 201,
        headers: { "Access-Control-Allow-Origin": "*" },
        jsonBody: {
          message: "Loan saved successfully",
          loan: newLoan
        }
      };

    } catch (error) {
      context.log("❌ addLoan error:", error);
      return {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        jsonBody: { error: error.message }
      };
    }
  }
});
