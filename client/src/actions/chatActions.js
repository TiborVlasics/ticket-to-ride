import axios from "axios";
import { GET_ERRORS, FETCH_MESSAGES, ADD_MESSAGE } from "./types";

export const addMessage = message => dispatch => {
  dispatch({ type: ADD_MESSAGE, payload: message });
  window.scrollTo(0, document.body.scrollHeight);
};

export const fetchMessages = () => dispatch => {
  axios
    .get("/messages/")
    .then(res => {
      dispatch({ type: FETCH_MESSAGES, payload: res.data });
      window.scrollTo(0, document.body.scrollHeight);
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};