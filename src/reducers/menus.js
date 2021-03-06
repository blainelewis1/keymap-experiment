import { CLOSE_ALL_MENUS, OPEN_ALL_MENUS, OPEN_MENU } from "../actions/menus";

const shortcuts = (
  state = { openMenu: undefined, allMenusOpen: false },
  action
) => {
  switch (action.type) {
    case CLOSE_ALL_MENUS:
      return {
        allMenusOpen: false,
        openMenu: undefined
      };
    case OPEN_ALL_MENUS:
      return {
        ...state,
        allMenusOpen: true
      };
    case OPEN_MENU:
      return {
        ...state,
        openMenu: action.menu
      };
    default:
      return state;
  }
};

export default shortcuts;
