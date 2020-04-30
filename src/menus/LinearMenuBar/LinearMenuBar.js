import React from "react";
import "./LinearMenuBar.css";
import { shortcutToPrettyString } from "../Shortcuts/ShortcutUtils";
import Shortcuts from "../Shortcuts/Shortcuts";
import { connect } from "react-redux";
import { getCurrentProps } from "../../Workflow";

import { openAllMenus, openMenu, closeAllMenus } from "../../actions/menus";
import { menuToCommandHierarchy } from "../Shortcuts/CommandHierarchies";
import { noop } from "lodash";

const LinearItem = ({ command, shortcut, onClick }) => {
  return (
    <div onClick={e => onClick(command, e)} className="item">
      <span className="label"> {command} </span>
      {shortcut && (
        <span className="shortcut">{shortcutToPrettyString(shortcut)}</span>
      )}
    </div>
  );
};

export const LinearMenu = ({
  open,
  title,
  items,
  onItemClick,
  onMenuClick,
  onMouseEnter,
  color = "mac"
}) => {
  let active = open ? "active" : "";
  return (
    <div
      className={`linear-menu ${active}`}
      onMouseEnter={e => onMouseEnter(title, e)}
      style={{
        backgroundColor: `var(--color-${color})`
      }}
    >
      <div className="title" onClick={e => onMenuClick(title, e)}>
        {title}
      </div>

      <div className="menu">
        {items.map(menuItem => (
          <LinearItem
            key={menuItem.command}
            onClick={onItemClick}
            {...menuItem}
          />
        ))}
      </div>
    </div>
  );
};
export const LinearMenuBarDisplay = ({
  allOpen = false,
  menus,
  openMenu,
  onMenuClick = noop,
  onMouseEnter = noop,
  onItemClick = noop
}) => {
  return (
    <div className="linear-menu-bar">
      {menus.map(menu => {
        let open = allOpen || openMenu === menu.title;

        return (
          <LinearMenu
            key={menu.title}
            onMenuClick={onMenuClick}
            onMouseEnter={onMouseEnter}
            onItemClick={onItemClick}
            {...menu}
            open={open}
          />
        );
      })}
    </div>
  );
};

// handleTitleClick(e) {
//   e.nativeEvent.stopImmediatePropagation();
//   e.stopPropagation();
//   this.props.onClick();
// }

// handleItemClick(command, e) {
//   e.nativeEvent.stopImmediatePropagation();
//   e.stopPropagation();
//   this.props.onCommand(command);
// }

export class LinearMenuBar extends React.PureComponent {
  componentWillUnmount() {
    document.removeEventListener("click", this.props.onCloseAllMenus);
  }

  componentDidMount() {
    document.addEventListener("click", this.props.onCloseAllMenus);
  }

  render() {
    return (
      <React.Fragment>
        <Shortcuts
          commandHierarchy={menuToCommandHierarchy(this.props.menus)}
          onCommand={this.props.onCommand}
          onModifiersChanged={() => {
            if (Object.values(this.props.modifiersPressed).some(m => !!m)) {
              this.props.onOpenAllMenus();
            } else {
              this.props.onCloseAllMenus();
            }
          }}
        />
        <LinearMenuBarDisplay
          allOpen={
            this.props.delayTimeOver &&
            this.props.exposeHK &&
            this.props.allMenusOpen
          }
          openMenu={this.props.openMenu}
          menus={this.props.menus}
          onMenuClick={this.handleMenuClick}
          onMouseEnter={this.handleMouseEnter}
          onItemClick={this.handleItemClick}
        />
      </React.Fragment>
    );
  }

  handleMenuClick = (menuTitle, e) => {
    e.nativeEvent.stopImmediatePropagation();
    e.stopPropagation();

    if (this.props.openMenu === menuTitle) {
      this.props.onCloseAllMenus();
    } else {
      this.props.onOpenMenu(menuTitle);
    }
  };

  handleItemClick = (item, e) => {
    e.nativeEvent.stopImmediatePropagation();
    e.stopPropagation();

    this.props.onCommand(item, true, "click");
    this.props.onCloseAllMenus();
  };

  handleMouseEnter = menuTitle => {
    if (this.props.openMenu) {
      this.props.onOpenMenu(menuTitle);
    }
  };
}

let LinearMenuBarConnected = connect(
  state => {
    let configuration = getCurrentProps(state.configuration);
    return { ...state.shortcuts, ...state.menus, ...configuration };
  },
  {
    onCloseAllMenus: closeAllMenus,
    onOpenAllMenus: openAllMenus,
    onOpenMenu: openMenu
  }
)(LinearMenuBar);

export class ExposeHK extends React.Component {
  render() {
    return <LinearMenuBarConnected {...this.props} exposeHK />;
  }
}

export default LinearMenuBarConnected;
