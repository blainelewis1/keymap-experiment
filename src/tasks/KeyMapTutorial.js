import React from "react";

import { KeyMapDisplay } from "../menus/KeyMap/KeyMap";
import { menuToCommandHierarchy } from "../menus/Shortcuts/CommandHierarchies";
import { vegetables } from "../data/newStimuli";
import { MySnackbarContentWrapper } from "../layout/Snackbar";
import { Snackbar, Stepper, Step, StepLabel } from "@material-ui/core";
import { CenteredPaper } from "../layout";

export class Tutorial extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: false };
  }
  //Could use props instead which would probs work well, whenever tyhey change record the change. I coukd makje the close button work with that too. Just reset a variable.
  handleClose = (e, reason) => {
    if (reason !== "clickaway") {
      this.setState({ error: false });
    }
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.error !== this.state.error) {
      this.setState({ error: nextProps.error });
    }
  }

  render() {
    const { step, steps } = this.props;
    const { component } = steps[step];

    return (
      <React.Fragment>
        <CenteredPaper top={this.props.top} axis="both" width="inherit">
          <Stepper orientation="vertical" activeStep={step}>
            {steps.map(({ text }, index) => (
              <Step key={text}>
                <StepLabel>{text}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CenteredPaper>
        {component}

        <Snackbar
          open={this.state.error}
          autoHideDuration={5000}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center"
          }}
        >
          <MySnackbarContentWrapper
            onClose={this.handleClose}
            variant="error"
            message={this.props.errorMessage}
          />
        </Snackbar>
      </React.Fragment>
    );
  }
}

export class KeyMapPointerTutorial extends React.Component {
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
    e.stopPropagation();

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
    let commandHierarchy = menuToCommandHierarchy(vegetables);
    let steps = [
      {
        component: (
          <KeyMapDisplay
            onKeyClick={this.keyClick}
            layoutName={this.props.layoutName}
            commandsAvailable={commandHierarchy["shift"]}
          />
        ),
        text: `In the bottom left are modifier buttons. Use the mouse to click the modifier button labelled shift.`
      },
      {
        component: (
          <KeyMapDisplay
            onKeyClick={this.keyClick}
            layoutName={this.props.layoutName}
            commandsAvailable={commandHierarchy["shift"]}
            modifiersPressed={{ shift: true }}
            active
          />
        ),
        text: `That opened a menu in the shape of a keyboard. Find the item carrot and click it to select it.`
      }
    ];

    return <Tutorial top={25} steps={steps} {...this.state} />;
  }

  keyClick = (key, e) => {
    e.nativeEvent.stopImmediatePropagation();
    e.stopPropagation();

    if (this.state.step === 1) {
      if (key === "c") {
        this.props.onAdvanceWorkflow();
      } else {
        this.setState({
          error: true,
          errorMessage:
            "You clicked the wrong button. You were supposed to choose carrot.",
          step: 0
        });
      }
    } else if (this.state.step === 0) {
      if (key === "shift") {
        this.setState({ step: 1, error: false });
      } else {
        this.setState({
          error: true,
          errorMessage: "That's the wrong modifier button."
        });
      }
    }
  };
}

export class KeyMapGuidedTutorial extends React.Component {
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
    let commandHierarchy = menuToCommandHierarchy(vegetables);
    let steps = [
      {
        component: (
          <KeyMapDisplay
            layoutName={this.props.layoutName}
            commandsAvailable={commandHierarchy["shift"]}
            onKeyClick={this.clicked}
          />
        ),
        text: `Rather than clicking the modifier button, you can press and hold shift on your keyboard and the menu will open after a short delay.`
      },
      {
        component: (
          <KeyMapDisplay
            layoutName={this.props.layoutName}
            commandsAvailable={commandHierarchy["shift"]}
            modifiersPressed={{ shift: true }}
            active
            onKeyClick={this.clicked}
          />
        ),
        text: `The key with carrot is "C", look in the top right of the key. Complete the selection by continuing to hold shift and also pressing C on your keyboard to select carrot.`
      }
    ];

    return <Tutorial top={25} steps={steps} {...this.state} />;
  }
}

export class KeyMapShortcutTutorial extends React.Component {
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
    let commandHierarchy = menuToCommandHierarchy(vegetables);

    let steps = [
      {
        component: (
          <KeyMapDisplay
            onKeyClick={this.clicked}
            layoutName={this.props.layoutName}
            commandsAvailable={commandHierarchy["shift"]}
          />
        ),
        text: `You can select carrot without waiting for the menu to appear by pressing shift and the corresponding key if you remember it. Take a guess at which key it was.`
      },
      {
        component: (
          <KeyMapDisplay
            layoutName={this.props.layoutName}
            commandsAvailable={commandHierarchy["shift"]}
            modifiersPressed={{ shift: true }}
            onKeyClick={this.clicked}
            active
          />
        ),
        text: `You waited too long and the menu appeared, release shift and try again.`
      }
    ];

    return <Tutorial top={25} steps={steps} {...this.state} />;
  }
}
