import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { firebase } from "../firebase/index";
import { defaults } from "react-chartjs-2";
import Trianglify from "trianglify";

import "font-awesome/css/font-awesome.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/index.css";
import "../assets/css/signin.css";

import Navigation from "./Navigation/index";
//import LandingPage from "./Landing/index";
import SignUpPage from "./signUp/index";
import SignInPage from "./signIn/index";
import PasswordForgetPage from "./forgotPassword/index";
import HomePage from "./Home/index";
import UpdatePassword from "./Settings/UpdatePassword";
import MonthViewPage from "./MonthView/index";
import DailyViewPage from "./DailyView/index";
import FilterViewPage from "./FilterView/index";
import UserVerification from "./UserVerification/index";
import StatisticsPage from "./Statistics/index";
import LoanPage from "./Loan/index";
import SettingsPage from "./Settings/index";
import SavingsPage from "./Savings/index";
import ErrorPage from "./Error/index";

import * as routes from "../constants/routes";
import * as db from "../firebase/db";
import * as utils from "./Util";
import * as analytics from "./../analytics/analytics";
const baseUrl = process.env.REACT_APP_API_BASE_URL;


class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            authUser: null,
            settings: null,
            expenses: {},
            loans: {},
            savings: {}
        };
    }

   


    async componentDidMount() {
        document.title = "Expense Tracker";

        analytics.initGA();
        analytics.logPageView();

        // Load authUser from localStorage
        const stored = localStorage.getItem("user");
        if (stored) {
            const authUser = JSON.parse(stored);
            this.setState({ authUser }, () => {
                this.loadUserData();
            });
        }
    }

    loadUserData = async () => {
        const { authUser } = this.state;
        if (!authUser) {
            console.log("No authUser found, aborting loadUserData");
            return;
        }

        console.log("Starting to load user data for:", authUser.userId);

        try {
            // Fetch user settings
            console.log("Fetching settings...");
            const settingsRes = await fetch(
                `${baseUrl}/api/getSettingsForUser?userId=${authUser.userId}`
            );
            const settingsData = await settingsRes.json();
            if (settingsRes.ok) {
                this.setState({ settings: settingsData });
                console.log("Settings fetched successfully:", settingsData);
            } else {
                console.error("Failed to fetch settings:", settingsData);
            }

            // Fetch expenses
            console.log("Fetching expenses...");
            // Fetch expenses
            const expensesRes = await fetch(`${baseUrl}/api/getExpenses?userId=${authUser.userId}`);
            const expensesData = await expensesRes.json();
            if (expensesRes.ok) {
                const normalizedExpenses = utils.normalizeExpenses(expensesData); // <-- use helper here
                this.setState({ expenses: normalizedExpenses });
            }

            // Fetch loanss
            console.log("Fetching loans...");
            const loansRes = await fetch(
                `${baseUrl}/api/getLoans?userId=${authUser.userId}`
            );
            const loansData = await loansRes.json();
            if (loansRes.ok) {
                this.setState({ loans: loansData });
                console.log("Loans fetched successfully:", loansData);
            } else {
                console.error("Failed to fetch loans:", loansData);
            }

            // Fetch savings
            console.log("Fetching savings...");
            const savingsRes = await fetch(
                `${baseUrl}/api/getSavings?userId=${authUser.userId}`
            );
            const savingsData = await savingsRes.json();
            if (savingsRes.ok) {
                this.setState({ savings: savingsData });
                console.log("Savings fetched successfully:", savingsData);
            } else {
                console.error("Failed to fetch savings:", savingsData);
            }

            console.log("All user data load attempts finished.");
        } catch (error) {
            console.error("Error occurred while loading user data:", error);
        }
    };

    render() {
        const bodyStyle = {
            backgroundColor: this.state.settings
                ? this.state.settings.mode === "night"
                    ? "#484842 !important"
                    : "auto"
                : "auto",
            height: "100vh"
        };

        var patternconfig = { height: 300, width: 500, cell_size: 35 }; // palette: Trianglify.colorbrewer,
        var pattern = Trianglify({ ...patternconfig });
        var pattern2 = Trianglify({ ...patternconfig });
        var pattern3 = Trianglify({ ...patternconfig });
        var pattern4 = Trianglify({ ...patternconfig });
        var pattern5 = Trianglify({ ...patternconfig });
        var pattern6 = Trianglify({ ...patternconfig });
        var pattern7 = Trianglify({ ...patternconfig });
        var pattern8 = Trianglify({ ...patternconfig });

        const cards = {
            card8: { backgroundImage: `url(${pattern8.png()})` },
            card7: { backgroundImage: `url(${pattern7.png()})` },
            card6: { backgroundImage: `url(${pattern6.png()})` },
            card5: { backgroundImage: `url(${pattern5.png()})` },
            card4: { backgroundImage: `url(${pattern4.png()})` },
            card3: { backgroundImage: `url(${pattern3.png()})` },
            card2: { backgroundImage: `url(${pattern2.png()})` },
            card1: { backgroundImage: `url(${pattern.png()})` }
        };

        return (
            <Router>
                <div style={bodyStyle}>
                    <Navigation authUser={this.state.authUser} settings={this.state.settings} />
                    <Switch>
                        {/* <Route exact path={routes.LANDING} component={() => <SignInPage />} /> */}
                        <Route exact path={routes.SIGN_UP} component={() => <SignUpPage />} />
                        <Route
                            exact
                            path={routes.SIGN_IN}
                            component={() => (
                                <SignInPage
                                    onLoginSuccess={(user) => {
                                        this.setState({ authUser: user }, () => {
                                            this.loadUserData();
                                        });
                                    }}
                                />
                            )}
                        />
                       

                        <Route exact path={routes.PASSWORD_FORGET} component={() => <PasswordForgetPage />} />
                        <Route
                            exact
                            path={routes.UPDATE_PASSWORD}
                            component={() => <UpdatePassword user={this.state.authUser} />}
                        />
                        <Route exact path={routes.USER_VERIFICATION} component={() => <UserVerification />} />
                        <Route
                            exact
                            path={routes.HOME}
                            component={() => (
                                <HomePage
                                    user={this.state.authUser}
                                    expenses={this.state.expenses}
                                    settings={this.state.settings}
                                    cards={cards}
                                />
                            )}
                        />
                        <Route
                            exact
                            path={routes.MONTH_VIEW}
                            component={() => (
                                <MonthViewPage
                                    user={this.state.authUser}
                                    expenses={this.state.expenses}
                                    settings={this.state.settings}
                                    cards={cards}
                                />
                            )}
                        />

                        <Route
                            exact
                            path={routes.DAILY_VIEW}
                            component={() => (
                                <DailyViewPage
                                    user={this.state.authUser}
                                    expenses={this.state.expenses}
                                    settings={this.state.settings}
                                    cards={cards}
                                />
                            )}
                        />

                        <Route
                            exact
                            path={routes.FILTER_VIEW}
                            component={() => (
                                <FilterViewPage
                                    user={this.state.authUser}
                                    expenses={this.state.expenses}
                                    settings={this.state.settings}
                                    cards={cards}
                                />
                            )}
                        />
                        <Route
                            exact
                            path={routes.STATISTICS_VIEW}
                            component={() => (
                                <StatisticsPage
                                    user={this.state.authUser}
                                    expenses={this.state.expenses}
                                    settings={this.state.settings}
                                    cards={cards}
                                />
                            )}
                        />
                        <Route
                            exact
                            path={routes.LOAN_VIEW}
                            component={() => (
                                <LoanPage
                                    user={this.state.authUser}
                                    loans={this.state.loans}
                                    settings={this.state.settings}
                                    cards={cards}
                                />
                            )}
                        />

                        <Route
                            exact
                            path={routes.SETTINGS_VIEW}
                            component={() => (
                                <SettingsPage user={this.state.authUser} settings={this.state.settings} cards={cards} />
                            )}
                        />

                        <Route
                            exact
                            path={routes.SAVINGS_VIEW}
                            component={() => (
                                <SavingsPage
                                    user={this.state.authUser}
                                    savings={this.state.savings}
                                    settings={this.state.settings}
                                />
                            )}
                        />

                        <Route
                            component={() => (
                                <ErrorPage />
                            )}
                        />
                    </Switch>
                </div>
            </Router>
        );
    }
}

export default App;
