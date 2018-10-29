import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import io from "socket.io-client";

import ChatTable from "./ChatTable";
import ChatUsers from "./ChatUsers";
import { addMessage } from "../../actions/chatActions";

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newMessage: "",
      usersTyping: {},
      users: []
    };
    this.socket = io.connect("/chat", {
      transports: ["polling", "websocket"],
      query: { token: localStorage.jwtToken }
    });

    this.setNewMessage = this.setNewMessage.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentCleanup() {
    this.socket.emit("user typing", {
      name: this.props.auth.user.name,
      isTyping: false
    });
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.componentCleanup);

    this.socket.on("chat", message => {
      this.props.addMessage(message);
    });

    this.socket.on("user typing", user => {
      let name = user.name;
      let text = user.text;
      let oldState = this.state.usersTyping;
      let newState;
      if (!oldState[name] && user.isTyping) {
        newState = { ...oldState, [name]: text };
      } else if (oldState[name] && user.isTyping) {
        newState = { ...oldState, [name]: text };
      } else if (oldState[name] && !user.isTyping) {
        let { [name]: omit, ...state } = oldState;
        newState = state;
      } else {
        newState = oldState;
      }
      this.setState({ usersTyping: newState });
    });

    this.socket.on("users", users => {
      this.setState({ users: users });
      window.scrollTo(0, document.body.scrollHeight);
    });

    this.socket.emit("get users");

    this.socket.on("user joined", user => {
      this.setState({ users: this.state.users.concat(user) });
    });

    this.socket.on("user left", userData => {
      let users = this.state.users.filter(user => user.id !== userData.id);
      this.setState({ users: users });
    });

    this.socket.on("private", data => {
      this.setState({ privateMsg: data.msg });
    });
  }

  componentWillUnmount() {
    this.socket.emit("user typing", {
      name: this.props.auth.user.name,
      isTyping: false
    });
    this.socket.close();
  }

  render() {
    return (
      <div className="container">
        <div>
          <div className="chat-wrapper">
            <ChatUsers users={this.state.users} />
            <ChatTable />
            <div className="shadow-messages">
              {Object.keys(this.state.usersTyping).map((user, index) => (
                <div key={index} className="shadow-message">
                  <div className="message-name">
                    {user} is writing a message...
                  </div>
                  <div
                    style={{ backgroundColor: "white" }}
                    className="shadow-message-text blurry-text"
                  >
                    {this.state.usersTyping[user]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <input
              className="chat-input form-control"
              id="message"
              type="text"
              label="Message"
              placeholder="Type your message ..."
              onChange={this.setNewMessage}
              value={this.state.newMessage}
              autoComplete="off"
              autoFocus
            />
          </div>
        </form>
      </div>
    );
  }

  setNewMessage(event) {
    this.setState({
      newMessage: event.target.value
    });
    if (event.target.value !== "") {
      this.socket.emit("user typing", {
        name: this.props.auth.user.name,
        text: event.target.value,
        isTyping: true
      });
    } else {
      this.socket.emit("user typing", {
        name: this.props.auth.user.name,
        text: event.target.value,
        isTyping: false
      });
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    this.socket.emit("chat", {
      author: this.props.auth.user,
      text: this.state.newMessage,
      timestamp: new Date().toISOString()
    });
    this.setState({
      newMessage: ""
    });
    this.socket.emit("user typing", {
      name: this.props.auth.user.name,
      isTyping: false
    });
  }
}

ChatRoom.propTypes = {
  auth: PropTypes.object.isRequired,
  addMessage: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { addMessage })(ChatRoom);
