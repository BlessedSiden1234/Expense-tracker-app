import React from "react";
import ExpenseRow from "../Common/ExpenseRow";
import Loader from "../Common/Loader";
import * as utils from "../Util";

const Expense = ({ expenses, authUser, month, year, settings, convertedCurrency }) => {
  console.log("🔥 Expense props:", { expenses, authUser, month, year });

  // Guard against null/undefined
  if (!expenses || !authUser || month == null || year == null) {
    console.warn("⏳ Waiting for required data...");
    return (
      <tr>
        <td colSpan="7">
          <Loader />
        </td>
      </tr>
    );
  }

  const selectedMonth = Number(month);
  const selectedYear = Number(year);

  // Normalize expenses
  const normalizedExpenses = utils.eachExpense(expenses);
  console.log("🧾 Normalized expenses:", normalizedExpenses);

  // Add logs for each expense
  normalizedExpenses.forEach((item, index) => {
    console.log(
      `📌 Expense[${index}] key=${item.key}, value keys=${Object.keys(item.value).join(
        ", "
      )}, full value=`,
      item.value
    );
  });

  // Filter by month/year only (ignore userId for now)
  const filteredExpenses = normalizedExpenses.filter((item) => {
    const dateStr = item.value.createdAt || item.value.date;
    const expenseDate = new Date(dateStr);
    const matchMonthYear =
      expenseDate.getMonth() === selectedMonth &&
      expenseDate.getFullYear() === selectedYear;

    if (!matchMonthYear) {
      console.log(`❌ Skipping expense ${item.key}: date mismatch (${expenseDate})`);
    } else {
      console.log(`✅ Including expense ${item.key}: date matches (${expenseDate})`);
    }

    return matchMonthYear;
  });

  console.log("📅 Expenses after month/year filter:", filteredExpenses);

  if (!filteredExpenses.length) {
    console.warn("⚠️ No expenses found for this month/year");
    return (
      <tr>
        <td colSpan="7">
          <div className="alert alert-info" role="alert">
            You haven't spent a penny this month
          </div>
        </td>
      </tr>
    );
  }

  return filteredExpenses.map((expense, index) => {
    console.log(`➡️ Rendering ExpenseRow ${index}`, expense);

    return (
      <ExpenseRow
        key={expense.key}
        expense={expense}
        user={authUser} // pass current user for display
        num={index}
        expenseId={expense.key}
        settings={settings}
        convertedCurrency={convertedCurrency}
      />
    );
  });
};

export default Expense;
