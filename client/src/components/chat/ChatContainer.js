import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import Messages from "./Messages";
import ChatUsers from "./ChatUsers";
import {
  loadMessages,
  addMessage,
  clearMessages
} from "../../actions/chatActions";

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newMessage: "",
      usersTyping: {},
      users: []
    };

    this.height = null;
    this.chat = React.createRef();
    this.messagesEnd = React.createRef();
    this.setNewMessage = this.setNewMessage.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onScroll = this.onScroll.bind(this);
  }

  scrollToBottom() {
    this.messagesEnd.current.scrollIntoView({ behavior: "instant" });
  }

  onScroll(e) {
    if (e.target.scrollTop === 0) {
      const messagesCount = this.props.chat.messages.length;
      this.props.loadMessages(messagesCount);
    }
  }

  componentCleanup() {
    this.props.socket.emit("user typing", {
      name: this.props.auth.user.name,
      isTyping: false
    });
  }

  componentDidMount() {
    window.addEventListener("beforeunload", this.componentCleanup);

    this.props.loadMessages(0);

    this.props.socket.on("chat", message => {
      this.props.addMessage(message);
      this.scrollToBottom();
    });

    this.props.socket.on("user typing", user => {
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

    this.props.socket.on("users", users => {
      this.setState({ users: users });
      window.scrollTo(0, document.body.scrollHeight);
    });

    this.props.socket.emit("get users");

    this.props.socket.on("user joined", user => {
      this.setState({ users: this.state.users.concat(user) });
    });

    this.props.socket.on("user left", userData => {
      let users = this.state.users.filter(user => user.id !== userData.id);
      this.setState({ users: users });
    });
  }

  componentWillReceiveProps(props) {
    this.height = this.chat.current.scrollHeight;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.chat.messages !== this.props.chat.messages)
      this.chat.current.scrollTop =
        this.chat.current.scrollHeight - this.height;
  }

  componentWillUnmount() {
    this.props.socket.emit("user typing", {
      name: this.props.auth.user.name,
      isTyping: false
    });

    this.props.clearMessages();
  }

  setNewMessage(event) {
    this.setState({
      newMessage: event.target.value
    });
    if (event.target.value !== "") {
      this.props.socket.emit("user typing", {
        name: this.props.auth.user.name,
        text: event.target.value,
        isTyping: true
      });
    } else {
      this.props.socket.emit("user typing", {
        name: this.props.auth.user.name,
        text: event.target.value,
        isTyping: false
      });
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.socket.emit("chat", {
      author: this.props.auth.user,
      text: this.state.newMessage,
      timestamp: new Date().toISOString()
    });
    this.setState({
      newMessage: ""
    });
    this.props.socket.emit("user typing", {
      name: this.props.auth.user.name,
      isTyping: false
    });
  }

  render() {
    return (
      <div className="chat">
        <div ref={this.chat} className="chat-content" onScroll={this.onScroll}>
          <ChatUsers users={this.state.users} />
          <Messages />
          <div className="shadow-messages">
            {Object.keys(this.state.usersTyping).map((user, index) => (
              <div key={index} className="shadow-message">
                <div className="message-name">
                  {user} is writing a message...
                </div>
                <div className="shadow-message-text blurry-text">
                  {this.state.usersTyping[user]}
                </div>
              </div>
            ))}
          </div>

          <div ref={this.messagesEnd} />
        </div>
        <form onSubmit={this.handleSubmit}>
          <input
            className="chat-input"
            id="message"
            type="text"
            label="Message"
            placeholder="Type your message ..."
            onChange={this.setNewMessage}
            value={this.state.newMessage}
            autoComplete="off"
            autoFocus
          />
        </form>
      </div>
    );
  }
}

Chat.propTypes = {
  auth: PropTypes.object.isRequired,
  chat: PropTypes.object.isRequired,
  addMessage: PropTypes.func.isRequired,
  loadMessages: PropTypes.func.isRequired,
  clearMessages: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  chat: state.chat
});

export default connect(
  mapStateToProps,
  { addMessage, loadMessages, clearMessages }
)(Chat);
