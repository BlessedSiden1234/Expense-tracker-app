import React, { Component } from "react";
import { withRouter } from "react-router-dom";

class SignOutButton extends Component {
  handleSignOut = () => {
    try {
      // 1️⃣ Remove stored user info from localStorage
      localStorage.removeItem("user");

      // 2️⃣ Optionally, call a backend logout endpoint if you create one
      // fetch("http://localhost:7071/api/signOut", { method: "POST" }).catch(console.error);

      // 3️⃣ Call parent callback to update app state if provided
      if (this.props.onSignOut) {
        this.props.onSignOut();
      }

      // 4️⃣ Redirect to SignIn page
      this.props.history.push("/signin");
    } catch (err) {
      console.error("Sign out failed:", err);
      alert("Failed to sign out, please try again!");
    }
  };

  render() {
    return (
      <div
        className="nav-item"
        onClick={this.handleSignOut}
        style={{ cursor: "pointer" }}
      >
        Sign Out
      </div>
    );
  }
}

// withRouter ensures we can use this.props.history for redirection
export default withRouter(SignOutButton);
