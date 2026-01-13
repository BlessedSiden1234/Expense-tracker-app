import React, { Component } from "react";
import * as utils from "../Util";
import moment from "moment";

import EditExpensePopup from "./EditExpensePopup";

class ExpenseRow extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showEditPopup: false
        };

        this.handleClick = this.handleClick.bind(this);
    }

    // deleting the expense using Azure function
    async handleClick(e) {
        const message =
            "Once deleted you cannot get back this record. Are you sure you want to delete?";
        if (!window.confirm(message)) return;

        try {
            const res = await fetch(
                `http://localhost:7071/api/deleteExpense?userId=${this.props.user.userId}&expenseId=${this.props.expense.id}`,
                { method: "DELETE" }
            );
            if (!res.ok) {
                const data = await res.json();
                console.error("Failed to delete expense:", data.error);
                alert("Failed to delete expense: " + data.error);
            }
        } catch (err) {
            console.error("Error deleting expense:", err);
            alert("Error deleting expense: " + err.message);
        }
    }

    toggleEditPopup(e) {
        this.setState({
            showEditPopup: !this.state.showEditPopup
        });
    }

    render() {
   // unwrap expense.value if it exists, otherwise use the object itself
        const expense = this.props.expense.value || this.props.expense || {}; // now date, expense, category exists // Azure object
        const settings = this.props.settings;

        // calculate day
     const conditionForDay =
    expense.day !== undefined && expense.day !== null
        ? expense.day
        : expense.date
        ? moment(expense.date, "DD/MM/YYYY").day()
        : 0; // fallback to Sunday if date missing


        let day;
        switch (conditionForDay) {
            case 0:
                day = "Sunday";
                break;
            case 1:
                day = "Monday";
                break;
            case 2:
                day = "Tuesday";
                break;
            case 3:
                day = "Wednesday";
                break;
            case 4:
                day = "Thursday";
                break;
            case 5:
                day = "Friday";
                break;
            case 6:
                day = "Saturday";
                break;
            default:
                day = "Sunday";
        }

        const lessFont = {
            fontSize: "15px",
            float: "right",
            marginTop: "5px",
            color: "rgba(255,255,255,.45)"
        };

    const catName =
  (settings && settings.editedCategories && settings.editedCategories[expense.category]) 
  || expense.category;



        return (
            <tr
                key={expense.id}
                id={expense.id}
                style={utils.categoryName(expense.category, "row")}
            >
                <td data-th="No">
                    {this.props.num + 1}
                    {this.state.showEditPopup && (
                        <EditExpensePopup
                            user={this.props.user}
                            expense={expense}
                            closePopup={this.toggleEditPopup.bind(this)}
                            settings={settings}
                            convertedCurrency={this.props.convertedCurrency}
                        />
                    )}
                </td>
                <td data-th="Date">
                    {expense.date} <span className="expense-day"> {day}</span>
                </td>
                <td data-th="Expense">
                    <i
                        className={`fa ${utils.setCurrencyIcon(settings && settings.currency)}`}
                        aria-hidden="true"
                    />{" "}
                  {expense.expense != null
    ? expense.expense.toString().replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")
    : "0"}

                </td>
                <td data-th="Category">
                    {catName}{" "}
                    <i
                        className={`fa fa-${utils.categoryIcon(expense.category)}`}
                        style={lessFont}
                        aria-hidden="true"
                    />
                </td>
                <td data-th="Comments">{expense.comments}</td>
                <td data-th="Edit">
                    <button className="edit-btn" onClick={this.toggleEditPopup.bind(this)}>
                        <i className="fa fa-edit" aria-hidden="true" /> edit
                    </button>
                </td>
                <td data-th="Delete">
                    <button className="delete-btn" onClick={this.handleClick}>
                        <i className="fa fa-trash-o" aria-hidden="true" /> delete
                    </button>
                </td>
            </tr>
        );
    }
}

export default ExpenseRow;
