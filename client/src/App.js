import React, { Component } from "react";
import { connect } from "react-redux";
import store from "./store";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from "react-router-dom";
import jwt_decode from "jwt-decode";
import setAuthToken from "./helper/setAuthToken";

import { setCurrentUser } from "./actions/authActions";

import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import Dashboard from "./components/layout/Dashboard";
import Amoeba from "./components/amoeba/Amoeba";
import Pong from "./components/pong/Pong";
import SecretRoute from "./components/SecretRoute";

import "./style/App.css";
import "./style/Spinner.css";
import "./style/Spinner-small.css";
import "./style/nav.css";
import "./style/usersbar.css";
import "./style/chat.css";
import "./style/auth.css";
import "./style/games.css";
import "./style/amoeba.css";

if (localStorage.jwtToken) {
  setAuthToken(localStorage.jwtToken);
  const decoded = jwt_decode(localStorage.jwtToken);
  store.dispatch(setCurrentUser(decoded));
}

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Switch>
            <Route exact path="/" component={Login} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
            <SecretRoute exact path="/dashboard" component={Dashboard} />
            <SecretRoute exact path="/tictactoe/:id" component={Amoeba} />
            <SecretRoute exact path="/pong/:id" component={Pong} />
            <Route render={() => <Redirect to="/dashboard" />} />
          </Switch>
        </div>
      </Router>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(App);
