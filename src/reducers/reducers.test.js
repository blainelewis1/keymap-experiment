import reducer from "./index";
import * as actions from "../actions";

xit("should return the initial state", () => {
  expect(reducer(undefined, {})).toEqual([{}]);
});

xit("should handle ADVANCE_WORKFLOW", () => {
  expect(reducer([], actions.advanceWorkflow())).toEqual([
    { configuration: "" }
  ]);
});
