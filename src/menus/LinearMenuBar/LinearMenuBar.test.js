import React from "react";
import LinearMenuBar from "./LinearMenuBar";
import { mount } from "enzyme";
import { createStore } from "redux";
import reducer from "../../reducers";
import { Provider } from "react-redux";

let wrapper;
let handlers = {};
const nativeEvent = { nativeEvent: { stopImmediatePropagation: () => {} } };

let menus = [
  {
    title: "Animals",
    items: [
      { command: "dog", shortcut: [["control", "alt", "d"]] },
      { command: "cat", shortcut: [["control", "c"]] },
      { command: "pig", shortcut: [["control", "p"]] },
      { command: "bird", shortcut: [["control", "b"]] }
    ]
  },
  {
    title: "Fruits",
    items: [
      { command: "pineapple", shortcut: [["control", "meta", "p"]] },
      { command: "apple", shortcut: [["meta", "shift", "k"]] },
      { command: "kiwi", shortcut: [["alt", "k"]] },
      { command: "potato", shortcut: [["control", "shift", "p"]] }
    ]
  }
];

function createWrapper() {
  handlers = { onCommand: jest.fn() };
  const store = createStore(reducer);
  return mount(
    <Provider store={store}>
      <LinearMenuBar onCommand={handlers.onCommand} menus={menus} />
    </Provider>
  );
}

describe("LinearMenuBar", () => {
  beforeEach(() => {
    wrapper = createWrapper();
  });
  it("opens a menu when clicking title", () => {
    wrapper
      .find("[title='Animals']")
      .find(".title")
      .first()
      .simulate("click", nativeEvent);

    expect(wrapper.find("[title='Animals']").prop("open")).toBeTruthy();

    expect(wrapper.find(".active")).toHaveLength(1);
  });
  it("opens a different menu when hovering", () => {
    wrapper
      .find("[title='Animals']")
      .find(".title")
      .first()
      .simulate("click", nativeEvent);
    expect(wrapper.find(".active")).toHaveLength(1);
    expect(wrapper.find("[title='Animals']").prop("open")).toBeTruthy();

    wrapper
      .find("[title='Fruits']")
      .first()
      .simulate("mouseenter", nativeEvent);

    expect(wrapper.find(`[title="Animals"]`).prop("open")).toBeFalsy();
    expect(wrapper.find(`[title="Fruits"]`).prop("open")).toBeTruthy();
    expect(wrapper.find("[open=true]")).toHaveLength(1);
  });
  it("doesnt opn a menu when just hovering", () => {
    wrapper
      .find(".title")
      .first()
      .simulate("mouseenter", nativeEvent);
    expect(wrapper.find(".active")).toHaveLength(0);
    expect(wrapper.find("[open=true]")).toHaveLength(0);
  });
  it("closes when clicking again", () => {
    wrapper
      .find("[title='Animals']")
      .find(".title")
      .first()
      .simulate("click", nativeEvent);
    wrapper
      .find("[title='Animals']")
      .find(".title")
      .first()
      .simulate("click", nativeEvent);

    expect(wrapper.find("[title='Animals']").prop("open")).toBeFalsy();
    expect(wrapper.find("[open=true]")).toHaveLength(0);
  });
  it("closes when clicking document", () => {
    const map = {};

    let patch = document.addEventListener;
    document.addEventListener = jest.fn((event, cb) => {
      map[event] = cb;
    });

    wrapper = createWrapper();
    wrapper
      .find("[title='Animals']")
      .find(".title")
      .first()
      .simulate("click", nativeEvent);

    map.click({});
    wrapper.update();

    expect(wrapper.find("[open=true]")).toHaveLength(0);

    document.addEventListener = patch;
  });

  it("calls oncommand", () => {
    wrapper
      .find("[title='Animals']")
      .find(".title")
      .first()
      .simulate("click", nativeEvent);
    wrapper.find("[command='dog']").simulate("click", nativeEvent);

    expect(handlers.onCommand).toHaveBeenCalledWith("dog", true, "click");
  });
  fit("calls oncommand for shortcut", () => {
    const map = {};

    let patch = document.addEventListener;
    document.addEventListener = jest.fn((event, cb) => {
      map[event] = cb;
    });

    wrapper = createWrapper();

    map.keydown({ key: "control", type: "keydown" });
    map.keydown({ key: "c", type: "keydown" });

    wrapper.update();

    expect(wrapper.find("[open=true]")).toHaveLength(0);
    expect(handlers.onCommand).toHaveBeenCalledWith("cat", false, "keydown");

    document.addEventListener = patch;
  });

  it("removes all events properly", () => {
    const map = {};

    let patch = document.addEventListener;
    document.addEventListener = jest.fn((event, cb) => {
      map[event] = cb;
    });

    let patchR = document.removeEventListener;
    document.removeEventListener = jest.fn();

    wrapper = createWrapper();

    wrapper.unmount();

    expect(document.removeEventListener).toHaveBeenCalledWith(
      "click",
      map["click"]
    );

    document.addEventListener = patch;
    document.removeEventListener = patchR;
  });
});

describe("ExposeHK", () => {
  xit("pressing a modifier opens ExposeHK", done => {
    done.fail();
  });
  xit("releasing a modifier closes ExposeHK", done => {
    done.fail();
  });
});
