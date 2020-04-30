import { combineReducers } from "redux";
import configuration from "./configuration";
import shortcuts from "./shortcuts";
import menus from "./menus";
import tasks from "./tasks";

export default combineReducers({ configuration, shortcuts, menus, tasks });
// export default combineReducers({
//   configuration,
//   shortcuts
// });
