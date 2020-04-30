import React from "react";
import App, { App as UnconnectedApp } from "./App";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import { createStore } from "redux";
import reducer from "./reducers";

it("renders a task component with props", () => {
  var wrapper = mount(
    <Provider store={createStore(reducer)}>
      <App
        task="StimulusResponseTask"
        log={{ experimenter: "hi" }}
        menuItems={[]}
        testProp="hello"
      />
    </Provider>
  );
  //TODOLATER: This doesn't really do much.
  // expect(wrapper.find("StimulusResponseTask").prop("testProp")).toEqual(
  //   "hello"
  // );
});

it("renders download link if not given a task", () => {
  const wrapper = mount(<UnconnectedApp log={{ participant: "hello" }} />);
  expect(wrapper.find("a").text()).toEqual("Download experiment log");
});
