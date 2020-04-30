import * as actions from "./index";

describe("actions", () => {
  it("should create a workflow action", () => {
    const expectedAction = {
      type: actions.ADVANCE_WORKFLOW
    };

    expect(actions.advanceWorkflow()).toEqual(expectedAction);
  });
});
