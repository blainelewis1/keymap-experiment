import Shortcuts from "./Shortcuts";
import { mount } from "enzyme";
import React from "react";
import { mergeCommandHierarchy } from "./CommandHierarchies";
import { createStore } from "redux";
import reducer from "../../reducers";

let state = () => wrapper.find("Shortcuts").instance();
let wrapper;
let handlers = {};

describe("integration tests", () => {
  beforeEach(() => {
    handlers = {
      onModifiersChanged: jest.fn(),
      onCommand: jest.fn(),
      onNoCommand: jest.fn()
    };

    let commandHierarchy = {
      control: {
        c: {
          command: "copy"
        },
        g: {
          control: {
            f: {
              command: "submenu"
            }
          },
          meta: {
            s: {
              command: "different submenu"
            }
          }
        }
      },
      "meta+control": {
        z: {
          command: "undo"
        }
      },
      "meta+shift": {
        "/": {
          command: "show commands"
        }
      }
    };

    commandHierarchy = mergeCommandHierarchy({}, commandHierarchy);
    const store = createStore(reducer);
    wrapper = mount(
      <Shortcuts
        store={store}
        commandHierarchy={commandHierarchy}
        {...handlers}
      />
    );
  });

  it("fires modifiers changed", () => {
    expect(handlers.onModifiersChanged).not.toHaveBeenCalled();
    state().handleKeyboard({ key: "control", type: "keydown" });
    expect(handlers.onModifiersChanged).toHaveBeenCalled();
  });

  it("handles simple keyboard shortcuts", () => {
    wrapper
      .find("Shortcuts")
      .instance()
      .handleKeyboard({ key: "control", type: "keydown" });

    wrapper
      .find("Shortcuts")
      .instance()
      .handleKeyboard({ key: "c", type: "keydown" });

    expect(handlers.onCommand).toHaveBeenCalledWith("copy", false, "keydown");
  });

  it("fires commands only once", () => {
    state().handleKeyboard({ key: "control", type: "keydown" });
    state().handleKeyboard({ key: "c", type: "keydown" });
    state().handleKeyboard({ key: "c", type: "keydown" });

    expect(handlers.onCommand).toHaveBeenCalledTimes(2);
  });

  it("does nothing when no modifiers are pressed", () => {
    state().handleKeyboard({ key: "f", type: "keydown" });
    expect(handlers.onCommand).toHaveBeenCalledWith(null);
  });

  it("clears released modifiers", () => {
    state().handleKeyboard({ key: "control", type: "keydown" });
    state().handleKeyboard({ key: "meta", type: "keydown" });
    state().handleKeyboard({ key: "alt", type: "keydown" });

    state().handleKeyboard({ key: "control", type: "keyup" });
    state().handleKeyboard({ key: "meta", type: "keyup" });
    state().handleKeyboard({ key: "alt", type: "keyup" });

    expect(state().getCurrentModifiers()).toHaveLength(0);
  });

  it("handles chorded shortcuts", () => {
    state().handleKeyboard({ key: "control", type: "keydown" });
    state().handleKeyboard({ key: "g", type: "keydown" });
    state().handleKeyboard({ key: "f", type: "keydown" });

    expect(handlers.onCommand).toHaveBeenCalledWith(
      "submenu",
      false,
      "keydown"
    );
  });

  it("handles chorded shortcuts with different modifiers", () => {
    state().handleKeyboard({ key: "control", type: "keydown" });
    state().handleKeyboard({ key: "g", type: "keydown" });
    state().handleKeyboard({ key: "control", type: "keyup" });
    state().handleKeyboard({ key: "meta", type: "keydown" });
    state().handleKeyboard({ key: "s", type: "keydown" });

    expect(handlers.onCommand).toHaveBeenCalledWith(
      "different submenu",
      false,
      "keydown"
    );
  });

  it("handles multiple modifiers non-alphabetised", () => {
    state().handleKeyboard({ key: "control", type: "keydown" });
    state().handleKeyboard({ key: "meta", type: "keydown" });
    state().handleKeyboard({ key: "z", type: "keydown" });

    expect(handlers.onCommand).toHaveBeenCalledWith("undo", false, "keydown");
  });
  it("handles shifted keys", () => {
    state().handleKeyboard({ key: "shift", type: "keydown" });
    state().handleKeyboard({ key: "meta", type: "keydown" });
    state().handleKeyboard({ key: "?", type: "keydown" });

    expect(handlers.onCommand).toHaveBeenCalledWith(
      "show commands",
      false,
      "keydown"
    );
  });

  it("clicks properly", () => {
    state().handleKeyboard({ key: "control", type: "click" });
    state().handleKeyboard({ key: "c", type: "click" });
    expect(handlers.onCommand).toHaveBeenCalledWith("copy", true, "click");
  });

  it("clicks toggle modifier", () => {
    expect(handlers.onModifiersChanged).not.toHaveBeenCalled();
    state().handleKeyboard({ key: "shift", type: "click" });
    expect(state().getCurrentModifiers().shift).toBeTruthy();
    expect(state().getCurrentModifiers()).toHaveLength(1);

    expect(handlers.onModifiersChanged).toHaveBeenCalled();
    state().handleKeyboard({ key: "shift", type: "click" });

    expect(state().getCurrentModifiers()).toHaveLength(0);
  });

  xit("delays properly", done => {
    done.fail();
  });

  xit("delays twice", done => {
    done.fail();
  });

  it("properly handles attach and detach", () => {
    let add = document.addEventListener;
    let remove = document.removeEventListener;

    document.addEventListener = jest.fn();
    document.removeEventListener = jest.fn();

    wrapper = mount(<Shortcuts store={createStore(reducer)} />);

    expect(document.addEventListener).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
      expect.anything()
    );
    expect(document.addEventListener).toHaveBeenCalledWith(
      "keyup",
      expect.any(Function),
      expect.anything()
    );

    wrapper.unmount();

    expect(document.removeEventListener).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
      expect.anything()
    );
    expect(document.removeEventListener).toHaveBeenCalledWith(
      "keyup",
      expect.any(Function),
      expect.anything()
    );

    document.addEventListener = add;
    document.removeEventListener = remove;
  });

  it("works end to end", () => {
    let map = {};

    let add = document.addEventListener;
    let remove = document.removeEventListener;

    document.addEventListener = jest
      .genMockFn()
      .mockImplementation((event, cb) => {
        map[event] = cb;
      });
    document.removeEventListener = jest.fn();

    const onCommand = jest.fn();
    wrapper = mount(
      <Shortcuts
        store={createStore(reducer)}
        commandHierarchy={{
          control: {
            c: {
              command: "copy"
            }
          }
        }}
        onCommand={onCommand}
      />
    );

    map["keydown"]({ key: "meta", type: "keydown" });
    map["keyup"]({ key: "meta", type: "keyup" });
    map["keydown"]({ key: "control", type: "keydown" });
    map["keydown"]({ key: "c", type: "keydown" });

    expect(onCommand).toHaveBeenCalledWith("copy", false, "keydown");

    document.addEventListener = add;
    document.removeEventListener = remove;
  });
});

//TODOLATER: run tests to make sure that it fires the correct actions just by shallowmounting the unconnected component.
