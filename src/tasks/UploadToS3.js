import React from "react";
import AWS from "aws-sdk";
import Typography from "@material-ui/core/Typography";

import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";

import { log } from "../actions/";
import { connect } from "react-redux";
import { CenteredPaper, CenteredText } from "../layout";

//TODOLATER: properly this should be one component for error another for spinner

//TODO: sometimes this updates things while unmounted which is actually just suspicious af.

export const UploadToS3Display = ({
  error,
  participant,
  log,
  experimenter,
  onClick
}) => {
  let contents;

  if (!error) {
    contents = (
      <div>
        <Typography>We're uploading your results!</Typography>
        <br />
        <CircularProgress size={100} />
      </div>
    );
  } else {
    contents = (
      <div>
        <p>
          Something went wrong uploading your results. We'll still compensate
          you for your time upon submitting the hit. Please download the results
          and send them to <a href={`mailto:${experimenter}`}>{experimenter}</a>
        </p>
        <a
          download={`${participant}.json`}
          href={`data:text/json;charset=utf-8,${log}`}
        >
          Download experiment log
        </a>
        <br />
        <Button variant="contained" color="primary" onClick={onClick}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <CenteredPaper axis="both" width="inherit">
      <CenteredText>{contents}</CenteredText>
    </CenteredPaper>
  );
};

class UploadToS3 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    AWS.config.region = this.props.AWS_REGION;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this.props.AWS_COGNITO_IDENTITY_POOL_ID
    });

    this.s3 = new AWS.S3({
      apiVersion: "2006-03-01",
      params: { Bucket: this.props.AWS_S3_BUCKET }
    });
  }

  UNSAFE_componentWillMount() {
    if (this.props.fireAndForget) {
      this.attemptUploadWithRetries(1);
      this.props.onAdvanceWorkflow();
    } else {
      this.attemptUploadWithRetries(3);
    }
  }

  attemptUploadWithRetries(retries) {
    let logs = { ...this.props.log };
    logs.events = window.logs;

    this.uploadJSONFile(this.props.s3FileName, logs)
      .then(() => {
        if (!this.props.fireAndForget) {
          this.props.onAdvanceWorkflow();
          this.setState({ done: true });
        }
      })
      .catch(err => {
        this.props.onLog("s3 error", err);

        if (retries > 0) {
          this.attemptUploadWithRetries(retries - 1);
        } else {
          this.setState({ error: true });
        }
      });
  }

  //https://blog.mturk.com/tutorial-how-to-create-hits-that-ask-workers-to-upload-files-using-amazon-cognito-and-amazon-s3-38acb1108633
  uploadJSONFile(fileName, data) {
    return new Promise((resolve, reject) => {
      this.s3.upload(
        {
          Key: fileName,
          Body: JSON.stringify(data),
          ContentType: "json",
          ACL: "bucket-owner-full-control"
        },
        (err, data) => {
          if (err) {
            reject(err, data);
          } else {
            resolve(data);
          }
        }
      );
    });
  }

  render() {
    if (this.state.done) {
      return null;
    }
    return (
      <UploadToS3Display
        log={JSON.stringify(this.props.log)}
        participant={this.props.log.participant}
        onClick={this.props.onAdvanceWorkflow}
        experimenter={this.props.experimenter}
        error={this.state.error}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    log: state.configuration
  };
};
const mapDispatchToProps = {
  onLog: log
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UploadToS3);
