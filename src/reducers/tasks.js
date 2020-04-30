import { HIDE_STIMULUS, SHOW_STIMULUS } from "../actions/tasks";

const tasks = (state = { showStimulus: true }, action) => {
  switch (action.type) {
    case HIDE_STIMULUS:
      return { showStimulus: false };
    case SHOW_STIMULUS:
      return { showStimulus: true };
    default:
      return state;
  }
};

export default tasks;
