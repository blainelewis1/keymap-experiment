import React from "react";
import { storiesOf } from "@storybook/react";

import App from "./App";
import configureStore from "./configureStore";
import { Provider } from "react-redux";
import { generateRandomParticipant } from "./design/GenerateConfiguration";

let store1 = configureStore(generateRandomParticipant());

storiesOf("experiment/", module)
  .addDecorator(story => <Provider store={store1}>{story()}</Provider>)
  .add("ExposeHK", () => <App />);

//TODOLATER:
// var store2 = configureStore(
//   flatConfigurations.filter(config => config.participantId === "KeyMap0")[0]
// );

// storiesOf("experiment/", module)
//   .addDecorator(story => <Provider store={store2}>{story()}</Provider>)
//   .add("KeyMap", () => <App />);
