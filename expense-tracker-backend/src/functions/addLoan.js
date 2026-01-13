const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("addLoan", {
  methods: ["POST"],
  authLevel: "function",
  handler: async (request, context) => {
    context.log("addLoan called");

    try {
      const body = await request.json();
      const {
        userId,
        lender,
        amount,
        loanType = "Given",        // ✅ Added loanType with default
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
        loanType,                 // ✅ Include loanType here
        interestRate,
        startDate,
        endDate,
        status,                   // active | paid | overdue
        notes,
        day: new Date(startDate).getDay(), // optional, useful for frontend
        createdAt: new Date().toISOString()
      };

      loanTable.items.push(newLoan);
      loanTable.updatedAt = new Date().toISOString();

      // ---- Save to Cosmos ----
      await container.items.upsert(loanTable, { partitionKey: userId });

      // ---- Return JSON response ----
      return {
        status: 201,
        jsonBody: {
          message: "Loan saved successfully",
          loan: newLoan
        }
      };

    } catch (error) {
      context.log("❌ addLoan error:", error);
      return {
        status: 500,
        jsonBody: { error: error.message }
      };
    }
  }
});
