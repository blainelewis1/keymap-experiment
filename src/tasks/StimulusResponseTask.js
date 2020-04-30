import React, { Component } from "react";

import DropdownMenu from "../menus/DropdownMenu";
import KeyMap from "../menus/KeyMap/KeyMap";
import { LinearMenuBar, ExposeHK } from "../menus/LinearMenuBar/LinearMenuBar";
import Shortcuts from "../menus/Shortcuts/Shortcuts";

import { connect } from "react-redux";
import { hideStimulus, showStimulus } from "../actions/tasks";
import { getCurrentProps } from "../Workflow";
import Button from "@material-ui/core/Button";
import "./StimulusResponseTask.css";
import styled from "styled-components";
import { CenteredPaper } from "../layout";

//TODOLATER: if we use a module we can write something like "import * as menus from "../menus".
// let cache = {};

// function importAll(r) {
//   r.keys().forEach(key => (cache[key] = r(key)));
// }

// importAll(require.context("../menus/", true, /^.*\/(?!.*test).*\.js$/));
// At build-time cache will be populated with all required modules.
const OuterProgress = styled.div`
  background-color: rgb(240, 132, 171);
  width: 100%;
  overflow: hidden;
  height: 5px;
`;
const InnerProgress = styled.div`
  width: ${props => props.value}%;
  background-color: rgb(225, 0, 80);
  height: 100%;
`;
const Progress = ({ value }) => (
  <OuterProgress>
    <InnerProgress value={value} />
  </OuterProgress>
);

const menus = {
  LinearMenuBar,
  DropdownMenu,
  KeyMap,
  ExposeHK,
  Shortcuts
};

const stimulusTypes = {
  ImageStimulus,
  TextStimulus
};

//TODOLATER: passing possition is awkward

export function Stimulus({ children, position, color }) {
  let style = {};

  if (color) {
    style.borderColor = `var(--color-${color})`;
  } else {
    style.border = "none";
  }

  return (
    <div style={style} className={`stimulus ${position}`}>
      {children}
    </div>
  );
}

export function TextStimulus({ stimulus, position, color }) {
  return (
    <Stimulus color={color} position={position}>
      <p className="text-stimulus">{stimulus}</p>
    </Stimulus>
  );
}
export function ImageStimulus({
  stimulus,
  stimulusImageExtension,
  stimulusImagePath,
  position,
  color
}) {
  return (
    <Stimulus color={color} position={position}>
      <img
        src={`${stimulusImagePath}/${stimulus}.${stimulusImageExtension}`}
        alt=""
      />
    </Stimulus>
  );
}

export class StimulusResponseTask extends Component {
  constructor(props) {
    super(props);

    this.state = {
      redScreen: false
    };
  }

  render() {
    let Menu = menus[this.props.menu] || DropdownMenu;
    let StimulusType = stimulusTypes[this.props.stimulusType] || TextStimulus;

    return (
      <div>
        <div
          className={
            "screen-flash " + (this.state.redScreen ? "screen-flash-red" : "")
          }
        />

        {this.props.withNext && (
          <Button onClick={this.props.onAdvanceWorkflow}>
            Shortcut won't work
          </Button>
        )}

        {this.props.showStimulus ? (
          <React.Fragment>
            <StimulusType {...this.props} />
            <Menu
              {...this.props}
              onCommand={this.validateSelection.bind(this)}
            />
          </React.Fragment>
        ) : (
          <CenteredPaper width="inherit" axis="both">
            <h1> Incorrect </h1>
            <Progress
              value={
                (100 * (new Date().getTime() - this.state.time)) /
                this.props.delayOnError
              }
            />
          </CenteredPaper>
        )}
      </div>
    );
  }

  validateSelection(item, delayOver, clicked) {
    this.props.onLog(
      "correct",
      JSON.stringify(item) === JSON.stringify(this.props.stimulus),
      false
    );

    this.props.onLog("delayIsOver", delayOver, false);
    this.props.onLog("clicked", clicked, false);

    if (!this.props.showStimulus) {
      // If the stimulus is hidden, don't do anything
      return;
    } else if (JSON.stringify(item) === JSON.stringify(this.props.stimulus)) {
      // Always advance if they're correct
      this.props.onAdvanceWorkflow();
    } else {
      // They made a mistake
      if (this.props.flashOnError) {
        this.setState({ redScreen: false, time: new Date().getTime() }, () => {
          this.setState({ redScreen: true });
        });
      }

      if (this.props.continueOnError) {
        if (this.props.delayOnError) {
          // If we're timing out on errors, hide the stimulus and wait a while
          this.props.onHideStimulus();
          setTimeout(this.onErrorTimeout.bind(this), this.props.delayOnError);
          this.interval = setInterval(this.forceUpdate.bind(this), 20);
        } else {
          // Otherwise, move on immediately
          this.props.onAdvanceWorkflow();
        }
      }
    }
  }

  onErrorTimeout() {
    this.props.onShowStimulus();
    this.props.onAdvanceWorkflow();
    clearInterval(this.interval);
  }
  componentDidMount() {
    this.props.onShowStimulus();
  }
}

const ConnectedStimulusResponseTask = connect(
  state => {
    let configuration = getCurrentProps(state.configuration);
    return { ...state.tasks, ...configuration };
  },
  {
    onHideStimulus: hideStimulus,
    onShowStimulus: showStimulus
  }
)(StimulusResponseTask);

export default ConnectedStimulusResponseTask;
