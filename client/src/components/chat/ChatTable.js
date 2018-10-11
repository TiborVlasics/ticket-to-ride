import React from "react";
import PropTypes from "prop-types";
import { fetchMessages } from "../../actions/chatActions";
import { clearMessages } from "../../actions/chatActions";
import { connect } from "react-redux";

class ChatTable extends React.Component {
  componentDidMount() {
    this.props.fetchMessages();
    window.scrollTo(0, document.body.scrollHeight);
  }

  componentWillUnmount() {
    this.props.clearMessages();
  }

  render() {
    const { user } = this.props.auth;
    const messages = this.props.messages;

    return (
      <div className="chat-table">
        {messages.map(message => (
          <div
            key={message._id}
            className={
              message.author.name === user.name
                ? "message-container own-message"
                : "message-container"
            }
          >
            <img
              src={message.thumbnail}
              style={{ maxWidth: 35 }}
              alt="thumbnail"
            />
            <div className="message-name">{message.author.name + ":"}</div>
            {message.text.map((text, index) => (
              <div key={index} className="message-text">
                {text}
              </div>
            ))}
            <div className="message-date">{message.createdDate}</div>
          </div>
        ))}
      </div>
    );
  }
}

ChatTable.propTypes = {
  auth: PropTypes.object.isRequired,
  messages: PropTypes.array.isRequired,
  fetchMessages: PropTypes.func.isRequired,
  clearMessages: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  messages: state.messages
});

export default connect(
  mapStateToProps,
  { fetchMessages, clearMessages }
)(ChatTable);
