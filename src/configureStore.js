import reducer from "./reducers";
import { logAction, log, LOG, LOG_ACTION } from "./actions";
import { createStore } from "redux";
import { throttle } from "lodash";

const STATE_KEY = "state";

const loadState = () => {
  try {
    const state = localStorage.getItem(STATE_KEY);
    if (state) {
      return JSON.parse(state);
    }
  } catch (err) {}

  return undefined;
};

const saveState = throttle(state => {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (err) {}
}, 1000);

export default configuration => {
  let storedState = undefined;

  if (process.env.NODE_ENV === "production") {
    storedState = loadState();
  }

  if (
    storedState &&
    storedState.configuration.session !== configuration.session
  ) {
    storedState = undefined;
  }

  let store = {};

  if (process.env.NODE_ENV !== "production") {
    store = createStore(
      reducer,
      {
        configuration,
        ...storedState
      },
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
        window.__REDUX_DEVTOOLS_EXTENSION__()
    );
  } else {
    store = createStore(reducer, {
      configuration,
      ...storedState
    });
  }

  store.subscribe(() => saveState(store.getState()));

  let dispatch = store.dispatch;

  store.dispatch = action => {
    if ([LOG, LOG_ACTION].indexOf(action.type) === -1) {
      dispatch(logAction(action));
    }

    if (action.type === "ADVANCE_WORKFLOW") {
      dispatch(log("end", new Date().getTime(), false));
    }

    dispatch(action);

    if (action.type === "ADVANCE_WORKFLOW") {
      dispatch(log("start", new Date().getTime(), false));
    }
  };

  return store;
};
