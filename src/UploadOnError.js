import React from "react";
import UploadToS3 from "./tasks/UploadToS3";
import { CenteredPaper } from "./layout";

export class UploadOnError extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
    this.props.onLog(
      "javascriptError",
      JSON.stringify(error, Object.getOwnPropertyNames(error))
    );
    this.props.onLog("javscriptErrorInfo", info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <React.Fragment>
          <CenteredPaper axis="both" width="inherit">
            <div>
              <h1>Something went wrong.</h1>
              <p>
                You can try refreshing the page. If that doesn't work please
                message the requestor and we will arrange payment. You can also
                email
                <a href={`mailto:${this.props.experimenter}`}>
                  {this.props.experimenter}
                </a>
              </p>
            </div>
          </CenteredPaper>

          <UploadToS3 {...this.props} />
        </React.Fragment>
      );
    }

    return this.props.children;
  }
}
