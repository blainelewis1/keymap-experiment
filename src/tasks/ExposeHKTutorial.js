import React from "react";

import { vegetables } from "../data/newStimuli";
import { Tutorial } from "./KeyMapTutorial";
import { LinearMenuBarDisplay } from "../menus/LinearMenuBar/LinearMenuBar";

export class ExposeHKPointerTutorial extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      error: false,
      errorMessage: ""
    };
  }
  componentDidMount() {
    document.addEventListener("click", this.globalClick);
    document.addEventListener("keyup", this.keyHandler);
    document.addEventListener("keydown", this.keyHandler);
  }
  componentWillUnmount() {
    document.removeEventListener("click", this.globalClick);
    document.removeEventListener("keyup", this.keyHandler);
    document.removeEventListener("keydown", this.keyHandler);
  }

  keyHandler = () => {
    this.setState({
      error: true,
      errorMessage: "Try using your mouse rather than the keyboard."
    });
  };

  globalClick = e => {
    // e.stopPropagation();
    if (this.state.step === 1) {
      this.setState({
        step: 0,
        error: true,
        errorMessage:
          "You clicked somewhere other than the menu, which closes it."
      });
    }
  };

  render() {
    let steps = [
      {
        component: (
          <LinearMenuBarDisplay
            onMenuClick={(item, e) => {
              e.nativeEvent.stopImmediatePropagation();
              e.stopPropagation();
              this.setState({ step: 1, error: false });
            }}
            menus={vegetables}
          />
        ),
        text: `Across the top are menus. Click "vegetables" to open the menu.`
      },
      {
        component: (
          <LinearMenuBarDisplay
            onMenuClick={e => {
              this.setState({
                step: 0,
                error: true,
                errorDisplay: "You closed the menu by clicking it again."
              });

              e.nativeEvent.stopImmediatePropagation();
              e.stopPropagation();
            }}
            menus={vegetables}
            openMenu="vegetables"
            onItemClick={(item, e) => {
              e.nativeEvent.stopImmediatePropagation();
              e.stopPropagation();
              if (item === "carrot") {
                this.props.onAdvanceWorkflow();
              } else {
                this.setState({
                  error: true,
                  errorMessage:
                    "You clicked the wrong button. You were supposed to choose carrot.",
                  step: 0
                });
              }
            }}
          />
        ),
        text: `Now the menu is open, find the item carrot and click it to select it.`
      }
    ];

    return <Tutorial steps={steps} {...this.state} />;
  }
}

export class ExposeHKGuidedTutorial extends React.Component {
  constructor(props) {
    super(props);
    this.state = { step: 0 };
  }

  componentDidMount() {
    document.addEventListener("keyup", this.keyHandler);
    document.addEventListener("keydown", this.keyHandler);
  }

  componentWillUnmount() {
    document.removeEventListener("keyup", this.keyHandler);
    document.removeEventListener("keydown", this.keyHandler);
  }

  clicked = e => {
    this.setState({
      step: 0,
      error: true,
      errorMessage:
        "You clicked the menu, try again but use your keyboard this time."
    });
  };

  delayOver = () => {
    this.setState({ step: 1, error: false });
    delete this.delayTimeout;
  };

  keyHandler = e => {
    if (e.type === "keyup") {
      // If they release shift in step 0 thne they didn't wait long enough.

      if (this.state.step === 0 && this.delayTimeout) {
        this.setState({
          error: true,
          errorMessage: "You didn't wait long enough for the menu to appear."
        });
      }
      clearTimeout(this.delayTimeout);
      delete this.delayTimeout;

      this.setState({ step: 0 });
    } else {
      if (e.key === "Shift" && !this.delayTimeout) {
        this.delayTimeout = setTimeout(this.delayOver, 500);
      } else if (e.key === "C" && this.state.step === 1) {
        this.props.onAdvanceWorkflow();
      } else {
        this.setState({
          error: true,
          errorMessage: "You selected something other than carrot."
        });
      }
    }
  };

  render() {
    let steps = [
      {
        component: (
          <LinearMenuBarDisplay onMenuClick={this.clicked} menus={vegetables} />
        ),
        text: `Rather than clicking the menu, you can press and hold shift on your keyboard and the menu will open after a short delay.`
      },
      {
        component: (
          <LinearMenuBarDisplay
            onItemClick={this.clicked}
            onMenuClick={this.clicked}
            menus={vegetables}
            allOpen
          />
        ),
        text: `Look across from carrot, it says "shift+c". Complete the selection by continuing to hold shift and also pressing c on your keyboard to select carrot.`
      }
    ];

    return <Tutorial steps={steps} {...this.state} />;
  }
}

export class ExposeHKShortcutTutorial extends React.Component {
  constructor(props) {
    super(props);
    this.state = { step: 0 };
  }

  componentDidMount() {
    document.addEventListener("keyup", this.keyHandler);
    document.addEventListener("keydown", this.keyHandler);
  }

  componentWillUnmount() {
    document.removeEventListener("keyup", this.keyHandler);
    document.removeEventListener("keydown", this.keyHandler);
  }

  clicked = e => {
    this.setState({
      step: 0,
      error: true,
      errorMessage:
        "You clicked the menu, try again but use your keyboard this time."
    });
  };

  delayOver = () => {
    this.setState({
      error: true,
      errorMessage: "You waited too long, release shift and try again.",
      step: 1
    });
    delete this.delayTimeout;
  };

  keyHandler = e => {
    if (e.type === "keyup") {
      if (e.key === "Shift") {
        clearTimeout(this.delayTimeout);
        delete this.delayTimeout;
        if (this.state.step === 1) {
          this.setState({ step: 0 });
        }
      }
    } else {
      if (e.key === "Shift") {
        if (!this.delayTimeout) {
          this.delayTimeout = setTimeout(this.delayOver, 500);
        }
      } else if (e.key === "C" && this.state.step === 0 && !e.repeat) {
        this.props.onAdvanceWorkflow();
      } else if (this.state !== 1) {
        this.setState({
          error: true,
          errorMessage:
            "You selected something other than carrot. The carrot is shift + C."
        });
      }
    }
  };

  render() {
    let steps = [
      {
        component: (
          <LinearMenuBarDisplay onMenuClick={this.clicked} menus={vegetables} />
        ),
        text: `You can select carrot without waiting for the menu to appear by pressing shift and the corresponding key if you remember it. Take a guess at which key it was.`
      },
      {
        component: (
          <LinearMenuBarDisplay
            onItemClick={this.clicked}
            onMenuClick={this.clicked}
            menus={vegetables}
            allOpen
          />
        ),
        text: `You waited too long and the menu appeared, release shift and try again.`
      }
    ];

    return <Tutorial steps={steps} {...this.state} />;
  }
}
