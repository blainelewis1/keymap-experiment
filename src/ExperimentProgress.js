import React from "react";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import LinearProgress from "@material-ui/core/LinearProgress";
import "./ExperimentProgress.css";

import { map, sum } from "lodash";
import { connect } from "react-redux";
import { advanceWorkflowLevelTo } from "./actions";

export default connect(
  (state) => ({
    log: state.configuration,
  }),
  {
    onAdvanceWorkflowLevelTo: advanceWorkflowLevelTo,
  }
)(
  ({
    log,
    onAdvanceWorkflowLevelTo,
    fullProgress = true,
    currentProgress = false,
    position = "top",
  }) => {
    //TODOLATER: shouldn't be named sections
    var curIndex = 0;
    var indices = [];
    for (let i = 0; i < log.children.length; i++) {
      if (log.children[i].noProgress) {
        curIndex--;
      } else {
        indices.push(i);
      }
    }

    let newIndex = 0;

    while (log.index > indices[newIndex]) {
      newIndex++;
    }

    let progressSections = log.children.filter((child) => !child.noProgress);
    let sections = map(progressSections, "label");
    let progress = 0;

    if (currentProgress) {
      let cur = log;

      while (!cur.progressLevel) {
        cur = cur.children[cur.index || 0];
      }

      progress = 100 * ((getCurrentChild(cur) - 1) / getAllChildren(cur));
    }

    return (
      <React.Fragment>
        {currentProgress && (
          <div className={`progress ${position}`}>
            <LinearProgress
              style={{ height: "8px" }}
              variant="determinate"
              value={progress}
            />
          </div>
        )}
        {fullProgress && (
          <Stepper activeStep={newIndex}>
            {sections.map((label, index) => {
              return (
                <Step
                  style={{
                    //TODOLATER: this doesn't make the cursor change on future steps.
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    // if (process.env.NODE_ENV === "development") {
                    onAdvanceWorkflowLevelTo("section", indices[index]);
                    // }
                  }}
                  key={label}
                >
                  <StepLabel>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
        )}
      </React.Fragment>
    );
  }
);

function getAllChildren(config) {
  if (config.children) {
    return sum(config.children.map(getAllChildren));
  } else {
    return 1;
  }
}

function getCurrentChild(config) {
  //BaseCase:
  if (!config.children) {
    return 1;
  } else {
    return sum(
      config.children.slice(0, (config.index || 0) + 1).map(getCurrentChild)
    );
  }
}
