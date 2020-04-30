// An experiment configuration object looks like this (for example):
// let configuration = {
//   your_props: your_values,
//   current: {key: "sections", value: 0},
//   sections: [
//     {
//       your_section_props: your_values,
//       current: {key: "blocks", value: 0},
//       blocks: [
//         {
//           your_block_props: your_values,
//           current: {key: "trials", value: 0},
//           trials: [
//             {
//               your_trial_props: your_values,
//             },
//             {
//               your_trial_props: your_values,
//             }
//           ],
//         }
//       ],
//     }
//   ],
// }
//
// Each level of the configuration (except for the leaves) must have at least 2 elements:
// - current: Describes where the participant is in the experiment. Contains a key (the name of a list) and a value (the current index in the list).
// - current.key: A list of pieces of the experiment.
// All other props are provided as inputs to the experiment components.
// Props at the higher levels are overridden by props with the same name at lower levels. For example, a "speed" prop inside one of the "blocks" objects would take precedence over a "speed" prop in the "sections" object.

//TODOLATER: Convert getcurrentprops into a "selector" function
//TODOLATER: next level should be optional so this should use children I think.

// Flatten the experiment props down to a given level.
// Returns a list of all flattened configurations.
export function flattenToLevel(config, level) {
  if ("nextLevel" in config) {
    // Find our properties
    let properties = Object.assign({}, config);
    delete properties.children;
    delete properties.nextLevel;
    delete properties.index;

    // Get the flattened lists
    let flattenedConfigList;
    if (config.nextLevel === level) {
      // Base case: we're at the right level
      // Just grab the list of configs below us
      flattenedConfigList = config.children;
    } else {
      // Recursive case: go deeper
      flattenedConfigList = [];
      config.children.forEach(subConfig =>
        flattenedConfigList.push(...flattenToLevel(subConfig, level))
      );
    }

    // Apply our properties
    return flattenedConfigList.map(subConfig => {
      let propertiesClone = Object.assign({}, properties);
      return Object.assign(propertiesClone, subConfig);
    });
  } else {
    // Edge case: we've run out of levels to flatten
    // Return a list with the entire config in it
    return [config];
  }
}

export function getIndexFromValue(config, level) {
  config.children.map(getIndexFromValue);

  if (config.level === level) {
    return { ...config, config };
  }
}

// Get a flattened list of props for this trial of the experiment.
export function getCurrentProps(configuration, props = {}) {
  // Error catching: if we're finished the experiment, return undefined
  if (!configuration) {
    return undefined;
  }

  // Recursive case: return the union of the props at this level and the props at the next level
  // Prop values at this level are overwritten by values in the next level
  if ("nextLevel" in configuration) {
    const nextLevelIndex = configuration.index || 0;

    let properties = Object.assign({}, configuration);
    delete properties.nextLevel;
    delete properties.index;
    delete properties.children;
    properties = Object.assign(props, properties);

    return getCurrentProps(configuration.children[nextLevelIndex], properties);
  }
  // Base case: return all of the props
  else {
    return Object.assign(props, configuration);
  }
}

// Move on to the next step of the workflow.
// Returns true if the participant has finished all the steps in this part of the configuration.
export function advanceWorkflow(config) {
  // Error catching: if we went past the end of a list, don't keep advancing
  if (!config) {
    return false;
  }

  // Recursive case: move through this level's stage list
  // If we reach the end, return true so that the level above this knows we're finished
  if ("nextLevel" in config) {
    const nextLevelIndex = config.index || 0;
    config.children = [
      ...config.children.slice(0, nextLevelIndex),
      {
        ...config.children[nextLevelIndex]
      },
      ...config.children.slice(nextLevelIndex + 1)
    ];

    if (advanceWorkflow(config.children[nextLevelIndex])) {
      config.index = nextLevelIndex + 1;
      return config.index >= config.children.length;
    }
  }
  // Base case: at a leaf node, we don't have a list of steps, so we're always done
  else {
    return true;
  }
}

// Returns true if the participant has finished all the steps in this part of the configuration.
export function advanceWorkflowLevelTo(config, level, newValue) {
  // Error catching: if we went past the end of a list, don't keep advancing
  if (!config) {
    return false;
  }

  if (config["nextLevel"] === level) {
    config.index = newValue;
  } else if (config.children) {
    return { ...advanceWorkflowLevelTo(config.children[config.index]) };
  }
}

export function log(config, key, value, withTimeStamp) {
  while ("nextLevel" in config) {
    const nextLevelIndex = config.index || 0;

    config.children = [
      ...config.children.slice(0, nextLevelIndex),
      {
        ...config.children[nextLevelIndex]
      },
      ...config.children.slice(nextLevelIndex + 1)
    ];
    config = config.children[nextLevelIndex];
  }
  if (withTimeStamp) {
    config[key] = {
      value: value,
      timestamp: Date.now()
    };
  } else {
    config[key] = value;
  }
}

export function logAction(config, action) {
  while ("nextLevel" in config) {
    const nextLevelIndex = config.index || 0;

    config.children = [
      ...config.children.slice(0, nextLevelIndex),
      {
        ...config.children[nextLevelIndex]
      },
      ...config.children.slice(nextLevelIndex + 1)
    ];
    config = config.children[nextLevelIndex];
  }

  if (!config.actions) {
    config.actions = [];
  }
  config.actions = [
    ...config.actions,
    {
      action: action,
      timestamp: Date.now()
    }
  ];
}
