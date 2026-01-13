import React from "react";
import { Link } from "react-router-dom";

import SignOutButton from "../SignOut/index";
import * as routes from "../../constants/routes";

const NavigationAuth = props => {
    const burgerToggle = () => {
        const linksEl = document.querySelector(".narrowLinks");
        if (linksEl.style.display === "block") {
            linksEl.style.display = "none";
        } else {
            linksEl.style.display = "block";
        }
    };

const nightMode = { background: "#1B263B", color: "#FFD166" };       // dark blue background, warm yellow text
const nightModeHeader = {
    background: "#1B263B",
    color: "#FFEE93",    // softer header text
    fontSize: "23px!important"
};
const mightModeToggle = { background: "#1B263B", color: "#FFD166" };  // matches nightMode

const daymode = { background: "#FFFFFF", color: "#333333" };          // pure white background, dark gray text
const dayModeLink = { color: "#1A73E8" };                             // blue links for day mode
const nightModeLink = { background: "#1B263B", color: "#FFD166" };    // warm yellow links for night


    return (
        <nav style={props.settings.mode === "night" ? nightModeHeader : daymode}>
            <div className="navWide">
                <ul className="navbar-nav">
                    <h2 className="navbar-brand">Expense Tracker</h2>
                </ul>
                <div className="wideDiv">
                    <Link
                        className={`nav-link ${window.location.pathname === "/home" ? "active" : "inactive"}`}
                        to={routes.HOME}
                        style={props.settings.mode === "night" ? nightModeLink : dayModeLink}
                    >
                        Home
                    </Link>
                    <Link
                        className={`nav-link ${window.location.pathname === "/month-view" ? "active" : "inactive"}`}
                        to={routes.MONTH_VIEW}
                        style={props.settings.mode === "night" ? nightModeLink : dayModeLink}
                    >
                        Monthly
                    </Link>
                    <Link
                        className={`nav-link ${window.location.pathname === "/daily-view" ? "active" : "inactive"}`}
                        to={routes.DAILY_VIEW}
                        style={props.settings.mode === "night" ? nightModeLink : dayModeLink}
                    >
                        Daily
                    </Link>
                    <Link
                        className={`nav-link ${window.location.pathname === "/filter-view" ? "active" : "inactive"}`}
                        to={routes.FILTER_VIEW}
                        style={props.settings.mode === "night" ? nightModeLink : dayModeLink}
                    >
                        filter
                    </Link>
                    <Link
                        className={`nav-link ${window.location.pathname === "/statistics" ? "active" : "inactive"}`}
                        to={routes.STATISTICS_VIEW}
                        style={props.settings.mode === "night" ? nightModeLink : dayModeLink}
                    >
                        Stats
                    </Link>
            
                   
                    <Link
                        className={`nav-link ${window.location.pathname === "/settings" ? "active" : "inactive"}`}
                        to={routes.SETTINGS_VIEW}
                        style={props.settings.mode === "night" ? nightModeLink : dayModeLink}
                    >
                        Settings
                    </Link>
                    <Link className="nav-link" to={routes.SIGN_IN}>
                       <SignOutButton onSignOut={() => props.onSignOut && props.onSignOut()} />
                    </Link>
                </div>
            </div>
            <div className="navNarrow">
                <i
                    className="fa fa-bars fa-2x"
                    onClick={burgerToggle}
                    style={props.settings.mode === "night" ? mightModeToggle : daymode}
                />
                <ul className="navbar-nav">
                    <h2 className="navbar-brand" style={props.settings.mode === "night" ? nightModeHeader : daymode}>
                        Expense Tracker
                    </h2>
                </ul>
                <div className="narrowLinks">
                    <Link
                        className={`nav-link ${window.location.pathname === "/home" ? "active" : "inactive"}`}
                        to={routes.HOME}
                        onClick={burgerToggle}
                        style={props.settings.mode === "night" ? nightModeLink : dayModeLink}
                    >
                        Home
                    </Link>
                    <Link
                        className={`nav-link ${window.location.pathname === "/month-view" ? "active" : "inactive"}`}
                        to={routes.MONTH_VIEW}
                        onClick={burgerToggle}
                        style={props.settings.mode === "night" ? nightModeLink : dayModeLink}
                    >
                        Monthly
                    </Link>
                    <Link
                        className={`nav-link ${window.location.pathname === "/daily-view" ? "active" : "inactive"}`}
                        to={routes.DAILY_VIEW}
                        onClick={burgerToggle}
                        style={props.settings.mode === "night" ? nightModeLink : dayModeLink}
                    >
                        Daily
                    </Link>
                    <Link
                        className={`nav-link ${window.location.pathname === "/filter-view" ? "active" : "inactive"}`}
                        to={routes.FILTER_VIEW}
                        onClick={burgerToggle}
                        style={props.settings.mode === "night" ? nightModeLink : dayModeLink}
                    >
                        filter
                    </Link>
                    <Link
                        className={`nav-link ${window.location.pathname === "/statistics" ? "active" : "inactive"}`}
                        to={routes.STATISTICS_VIEW}
                        onClick={burgerToggle}
                        style={props.settings.mode === "night" ? nightModeLink : dayModeLink}
                    >
                        Stats
                    </Link>
                 
                    <Link
                        className={`nav-link ${window.location.pathname === "/settings" ? "active" : "inactive"}`}
                        to={routes.SETTINGS_VIEW}
                        onClick={burgerToggle}
                        style={props.settings.mode === "night" ? nightModeLink : dayModeLink}
                    >
                        Settings
                    </Link>
                    <Link className="nav-link" to={routes.SIGN_IN} onClick={burgerToggle}>
                        <SignOutButton />
                    </Link>
                </div>
            </div>
        </nav>
    );
};

const NavigationNonAuth = () => {
    const burgerToggle = () => {
        let linksEl = document.querySelector(".narrowLinks");
        if (linksEl.style.display === "block") {
            linksEl.style.display = "none";
        } else {
            linksEl.style.display = "block";
        }
    };

    return (
        <nav>
            <div className="navWide">
                <ul className="navbar-nav">
                    <h2 className="navbar-brand">Expense Tracker</h2>
                </ul>
                <div className="wideDiv">
                    {/* <Link
                        className={`nav-link ${window.location.pathname === "/signin" ? "active" : "inactive"}`}
                        to={routes.SIGN_IN}
                    >
                        Sign In
                    </Link> */}

                  

                    <Link
                        className={`nav-link ${window.location.pathname === "/" ? "active" : "inactive"}`}
                        to={routes.SIGN_IN}
                    >
                        Sign In
                    </Link>
                </div>
            </div>
            <div className="navNarrow">
                <i className="fa fa-bars fa-2x" onClick={burgerToggle} />
                <ul className="navbar-nav">
                    <h2 className="navbar-brand">Expense Tracker</h2>
                </ul>
                <div className="narrowLinks">
                    {/* <Link
                        className={`nav-link ${window.location.pathname === "/signin" ? "active" : "inactive"}`}
                        to={routes.SIGN_IN}
                        onClick={burgerToggle}
                    >
                        Sign In
                    </Link> */}


                    <Link
                        className={`nav-link ${window.location.pathname === "/" ? "active" : "inactive"}`}
                        to={routes.SIGN_IN}
                        onClick={burgerToggle}
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        </nav>
    );
};

const Navigation = ({ authUser, settings }) => {
    console.log("Navigation render:", { authUser, settings }); // debug

    return (
        <div>
            {authUser ? (
                <NavigationAuth
                    authUser={authUser}
                    settings={settings || { mode: "day" }} // fallback
                />
            ) : (
                <NavigationNonAuth />
            )}
        </div>
    );
};


export default Navigation;
