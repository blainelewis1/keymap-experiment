import React from "react";
import ReactDOM from "react-dom";

import { Provider } from "react-redux";

import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import configureStore from "./configureStore";
import { configuration } from "./design/GenerateConfiguration";

import { BrowserRouter, Switch, Route } from "react-router-dom";

import { pick, throttle } from "lodash";

//TODOLATER: For the chrome extension maybe all we need to do is have an HTML page that loads an iframe from localhost. For production we can just build it and then copy manifest, maybe react-scripts build takes a folder name and we just change that and copy the manifest in with an npm script.

//TODOLATER: what if we could do multiple tasks at once? And what if instead of "progress" being global it was one of the tasks or some other auxillary tasks? Is there a way to add tasks at different levels without overwriting?

//TODOLATER: we could vastly speed up the page load by utilising more tree shaking, especially for our own tasks and modules.
//TODOLATER: code splitting, we could just load the first section then async the rest that we need.
//TODOLATER: we could render the html using the "server" I think we could do it statically at build. And then we just call hydrate instead. This would improve the bundle size a lot.
//TODOLATER: loadable would probably help lots with this. https://github.com/jamiebuilds/react-loadable

//TODOLATER: we should have some form of bundle size analysis

const store = configureStore(configuration);
let Experiment = (
  <Provider store={store}>
    <App />
  </Provider>
);

let Main = Experiment;

ReactDOM.render(
  <React.StrictMode>{Main}</React.StrictMode>,
  document.getElementById("root")
);
registerServiceWorker();

window.addEventListener("mousemove", (e) => {
  window.mousex = e.clientX;
  window.mousey = e.clientY;
});

let events =
  "mousedown mouseup click dblclick mousemove mouseover mouseout keydown keyup keypress resize";
events.split(" ").forEach((event) => {
  window.addEventListener(
    event,
    throttle((event) => logEvent(event), 200),
    {
      passive: true,
    }
  );
});

const LOG_KEY = "log_key";

let loaded = localStorage.getItem(LOG_KEY);
if (loaded) {
  window.log = JSON.parse(loaded);
} else {
  window.log = [];
}

const logEvent = (event) => {
  window.log.push(transformEvent(event));
  saveState();
};

const saveState = throttle(() => {
  window.localStorage.setItem(LOG_KEY, JSON.stringify(window.log));
}, 5000);

// mousewheel scroll resize
//TODOLATER: add touch events here too.
const transformEvent = (event) => {
  switch (event.type) {
    case "mousedown":
    case "mouseup":
    case "click":
    case "dblclick":
    case "mousemove":
    case "mouseover":
    case "mouseout":
      event = pick(event, [
        "type",
        "clientX",
        "clientY",
        "screenX",
        "screenY",
        "pageX",
        "pageY",
      ]);
      break;
    case "keydown":
    case "keyup":
    case "keypress":
      event = pick(event, [
        "type",
        "key",
        "code",
        "metaKey",
        "shiftKey",
        "altKey",
        "ctrlKey",
      ]);
      break;
    case "resize":
      event = {
        width: Math.max(
          document.documentElement.clientWidth,
          window.innerWidth || 0
        ),
        height: Math.max(
          document.documentElement.clientHeight,
          window.innerHeight || 0
        ),
      };
      break;
    default:
      return {};
  }
};
