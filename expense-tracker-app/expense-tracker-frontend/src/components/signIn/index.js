import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";

import { SignUpLink } from "../signUp/index";
import { auth } from "../../firebase";
import * as routes from "../../constants/routes";
import * as analytics from "./../../analytics/analytics";

import logo from "./../../assets/images/logo.png";
import homeScreen from "./../../assets/images/Home1.png";
import monthScreen from "./../../assets/images/daily.png";
import statisticsScreen from "./../../assets/images/STATISTICS_NIGHT_MODE.png";
import savingsScreen from "./../../assets/images/SAVINGS_NIGHT.png";
import homeMobile from "./../../assets/images/HOME_MOBILE.png";
import monthMobile from "./../../assets/images/MONTH_MOBILE.png";
import statsMobile from "./../../assets/images/STATISTICS_MOBILE.png";
import travel from "./../../assets/images/travel.png";

import firebase from "firebase";

const SignInPage = ({ history, onLoginSuccess }) => (
    <div>
        <SignInForm history={history} onLoginSuccess={onLoginSuccess} />
    </div>
);


const byPropKey = (propertyName, value) => () => ({
    [propertyName]: value
});

const INITIAL_STATE = {
    email: "",
    password: "",
    error: null
};

class SignInForm extends Component {
    constructor(props) {
        super(props);

        this.state = { ...INITIAL_STATE };
    }

    componentDidMount() {
        analytics.initGA();
        analytics.logPageView();
    }

    callGoogleSignIn = () => {
        const { history } = this.props;

        let provider = new firebase.auth.GoogleAuthProvider();

        firebase
            .auth()
            .signInWithPopup(provider)
            .then(result => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                let token = result.credential.accessToken;

                // The signed-in user info.
                let user = result.user;

                history.push(routes.HOME);
            })
            .catch(error => {
                // Handle Errors here.
                let errorCode = error.code;
                let errorMessage = error.message;

                // The email of the user's account used.
                let email = error.email;

                // The firebase.auth.AuthCredential type that was used.
                let credential = error.credential;

                alert(errorMessage, "Retry !!!");
                // ...
            });
    };

    onSubmit = async event => {
        event.preventDefault();

        const { email, password } = this.state;
        const { history } = this.props;

        this.setState({ error: null });

        try {
            const response = await fetch(
                "http://localhost:7071/api/loginUser", // your Azure Function login endpoint
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email.trim(), password })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                // show backend error message
                throw new Error(data.error || "Failed to sign in");
            }

            // Save logged‑in user info (adjust key as you like)
            localStorage.setItem("user", JSON.stringify(data));

            // Notify App that login succeeded
            if (this.props.onLoginSuccess) {
                this.props.onLoginSuccess(data);
            }

            // clear state & redirect
            this.setState(() => ({ ...INITIAL_STATE }));
            history.push(routes.HOME);

        } catch (error) {
            this.setState(byPropKey("error", error));
        }
    };


    render() {
        const { email, password, error } = this.state;

        const imgStyle = {
            margin: "25px 35%"
        };

        const isInvalid = password === "" || email === "";

        const fullHeight = {
            minHeight: "100vh"
        };

        const areaPadding = {
            padding: "7%"
        };

        const areaMonthPadding = {
            padding: "5% 7%"
        };

        const homeImgStyle = {
            verticaAlign: "middle",
            borderRadius: "10px",
            boxShadow: "100px solid red",
            boxShadow: "20px 20px rgba(0,0,0,0.4)",
            borderStyle: "none",
            width: "100%",
            height: "auto"
        };

        return (
            <div className="container-fluid">
                <div className="row" style={{ minHeight: "88vh" }}>
                    <div className="col-sm-12 col-md-6" style={areaPadding}>
                        <div className="landing">
                            <img src={logo} style={imgStyle} width="auto" height="100" />
                            <span>Expense Tracker which takes note of all your daily expenses</span>
                            <hr />
                            <p> Sign up to create an account - and start tracking your expenses </p>
                            <hr />
                        </div>
                    </div>
                    <div className="col-sm-12 col-md-6 ">
                        <div className="login-page">
                            <form onSubmit={this.onSubmit} className="form">
                                <input
                                    value={email}
                                    onChange={event => this.setState(byPropKey("email", event.target.value))}
                                    type="text"
                                    placeholder="Email Address"
                                />
                                <input
                                    value={password}
                                    onChange={event => this.setState(byPropKey("password", event.target.value))}
                                    type="password"
                                    placeholder="Password"
                                />
                                <button disabled={isInvalid} type="submit">
                                    Sign In
                                </button>

                                <p>
                                    {" "}
                                    <Link to={routes.PASSWORD_FORGET}>Forgot password?</Link>
                                </p>

                              

                                {error && <p>{error.message}</p>}
                            </form>
                            <SignUpLink />
                        </div>
                    </div>
                </div>
                <div className="row landing-home-section" style={fullHeight}>
                    <div className="col-sm-12 col-md-8" style={areaPadding}>
                        {window.screen.width > 720 ? (
                            <img src={homeScreen} style={homeImgStyle} />
                        ) : (
                            <img src={homeMobile} style={homeImgStyle} width="auto" height="auto" />
                        )}
                    </div>
                    <div className="col-sm-12 col-md-4">
                        <div className="landing-home-section-title">
                            Simplest way to manage personal finances. <hr />
                            Yes your money matters.
                        </div>
                    </div>
                </div>
                <div className="row landing-month-section" style={fullHeight}>
                    <div className="col-sm-12 col-md-4" style={areaPadding}>
                        <div className="landing-home-section-title">Peek View Of your daily Spendings</div>
                    </div>
                    <div className="col-sm-12 col-md-8" style={areaMonthPadding}>
                        {window.screen.width > 720 ? (
                            <img src={monthScreen} style={homeImgStyle} />
                        ) : (
                            <img src={monthMobile} style={homeImgStyle} width="auto" height="auto" />
                        )}
                    </div>
                </div>
               
            </div>
        );
    }
}

export default withRouter(SignInPage);

export { SignInForm };
