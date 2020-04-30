import React from "react";
import seedrandom from "seedrandom";

import { menuToCommandHierarchy } from "../menus/Shortcuts/CommandHierarchies";
import {
  shuffle,
  randomChoice,
  randomString,
  getBrowserInfo,
  randomChoiceNoReplacement,
} from "../Utils";
import {
  zip,
  max,
  flatten,
  difference,
  cloneDeep,
  map,
  mapValues,
  flatMap,
  remove,
} from "lodash";
import { newMenus, vegetables } from "../data/newStimuli";

/* eslint import/no-webpack-loader-syntax: off */
import ExiiConsentLetter from "!raw-loader!../data/ExiiConsentLetter.md";

function trialsWithDistribution(frequencies, stimuli) {
  let result = flatten(
    frequencies.map((frequency, rank) =>
      Array(frequency).fill({
        stimulus: stimuli[rank],
        rank,
        frequency,
      })
    )
  );
  return result;
}

export function itemsFromMenu(menu) {
  return flatMap(menu, (menu) => menu.items.map((item) => item));
}

function stimuliFromMenu(menu) {
  return itemsFromMenu(menu).map(({ command: stimulus }) => ({ stimulus }));
}

/**
 * Takes a list of tasks and creates a new level with them occurring after one another.
 * Objects are automatically duplicated if given.
 * @param {String} level Level to label the next piece of config
 * @param {Array|Object} tasks either an array of tasks or an object to duplicate
 */
function compoundTask(level, ...tasks) {
  let biggest = max(tasks.map((task) => task.length));

  tasks = tasks.map((task) =>
    Array.isArray(task) ? task : Array(biggest).fill(task)
  );

  let result = zip(...tasks).map((taskInstances) => ({
    nextLevel: level,
    children: taskInstances,
  }));

  return result;
}

//TODOLATER: Add a version number with minor and major and maybe major name to let things be better. Then you can t4rack which runs
//TODOLATER: URL params should overwrite config values
//TODOLATER: log things like page refreshes.

//TODOLATER: configs are suuuper volatiile because of the random aspect, if you change the order of anything it wrecks everything.
//TODOLATER: Maybe we reseed the random all the time to fix that?

export function generateRandomParticipant() {
  //TODOLATER: cleanup
  let params = new URL(window.location.href).searchParams;
  let session = params.get("SESSION") || "main";
  let participant = params.get("WORKER_ID") || "blaine";
  let worker_id = params.get("WORKER_ID") || "";
  let assignment_id = params.get("ASSIGNMENT_ID") || "";
  let hit_id = params.get("HIT_ID") || "blaine";

  let s3FileName = `${[participant, session].filter((a) => a).join("_")}.json`;

  let seed = participant;
  seedrandom(participant, { global: true });

  let menu = randomChoice(["KeyMap", "ExposeHK"]);
  let menus = cloneDeep(newMenus);

  let backmap = {
    animals: "12qwaszx",
    fruits: "34erdfcv",
    office: "56tyghbn",
    clothing: "78uijkm,",
    recreation: "90opl;./",
  };

  backmap = mapValues(backmap, (letters) => letters.split(""));

  // Choose a subset of items, then assign them to the shortcuts in that row.
  menus.forEach((menu) => {
    let { items, title } = menu;
    let letters = shuffle(backmap[title]);
    letters.pop();

    menu.items = shuffle(items).slice(0, letters.length);

    zip(menu.items, letters).forEach(([item, letter]) => {
      item.shortcut = [["shift", letter]];
    });
  });

  let truncatedZipfian = [8, 4, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  let selectionBlocks = 6;

  // When choosing shortcuts we chose a subset, so we have to remove those from left, center and right.
  let allKeys = flatMap(backmap, (value) => value);
  let inBackMap = (letter) => allKeys.indexOf(letter) !== -1;

  let left = "123qweasdzxc".split("").filter(inBackMap);
  let center = "456rtyfghvbn".split("").filter(inBackMap);
  let right = "7890uiopjkl;m,./".split("").filter(inBackMap);

  let z1 = randomChoice(left);
  let z2 = randomChoice(right);
  let z3 = randomChoice(center);

  let top3 = [z1, z2, z3];

  // Remove items we've already selected
  backmap = map(backmap, (keys) =>
    remove(keys, (value) => top3.indexOf(value) === -1)
  );

  // Now, select 2 items from every category making sure we haven't selected twice.
  let categories = flatMap(backmap, (items) => [
    randomChoiceNoReplacement(items),
    randomChoiceNoReplacement(items),
  ]);

  let stimuliShortcuts = [
    ...top3,
    ...categories,
    // ...categories.slice(0, categories.length - 1)
  ];

  let commandHierarchy = menuToCommandHierarchy(menus);

  let stimuliCommands = stimuliShortcuts.map(
    (letter) => commandHierarchy.shift[letter].command
  );

  let recallStim = shuffle(
    flatten(
      truncatedZipfian.map((frequency, rank) => ({
        stimulus: stimuliCommands[rank],
        rank,
        frequency,
        wasAsked: true,
      }))
    )
  );

  let confirmationCode = randomString();

  const extraCommands = menus.map((menu) =>
    randomChoice(difference(map(menu.items, "command"), stimuliCommands))
  );

  let keyMapTutorial = [
    { task: "KeyMapPointerTutorial" },
    { task: "KeyMapGuidedTutorial" },
    { task: "KeyMapShortcutTutorial" },
  ];
  let exposeHKTutorial = [
    { task: "ExposeHKPointerTutorial" },
    { task: "ExposeHKGuidedTutorial" },
    { task: "ExposeHKShortcutTutorial" },
  ];
  let tutorial = {
    label: "Tutorial",
    nextLevel: "blocks",
    menus: vegetables,
    commandHierarchy: menuToCommandHierarchy(vegetables),
    fullProgress: false,
    currentProgress: true,
    progressLevel: true,
    children: [
      ...(menu === "KeyMap" ? keyMapTutorial : exposeHKTutorial),
      {
        task: "DisplayTextTask",
        displayedText:
          "In the real experiment you will first center your mouse in a box and then press space. Afterwards an item for selection will be prompted and you must select it.",
      },
      ...Array(3)
        .fill({})
        .map(() => ({
          nextLevel: "trial",
          children: compoundTask(
            "task",
            { task: "MouseCenteringTask" },
            {
              task: "StimulusResponseTask",
              stimulus: "carrot",
            }
          ),
        })),
      {
        stimulusType: "TextStimulus",
        task: "StimulusResponseTask",
        stimulus:
          "Upon making an error there is a 3 second delay. Press Shift + F to see this.",
      },
    ],
  };

  const recallTask = {
    label: "Recall",
    task: "StimulusResponseTask",
    menu: "Shortcuts",
    flashOnError: false,
    delayOnError: 0,
    nextLevel: "trial",
    fullProgress: false,
    currentProgress: true,
    progressLevel: true,
    children: [
      {
        task: "DisplayTextTask",
        displayedText:
          "The visible parts of the interface are disabled. You must attempt to use a keyboard shortcut for every item. These are items you have already seen. Take your time and try to get as many correct as possible.",
      },
      ...recallStim,
      {
        task: "DisplayTextTask",
        displayedText:
          "These next items are items you haven't already selected.",
      },
      ...extraCommands.map((stimulus) => ({
        stimulus,
        wasAsked: false,
      })),
    ],
  };

  let selectionTasks = trialsWithDistribution(
    truncatedZipfian,
    stimuliCommands
  );

  selectionTasks.forEach((task) => {
    for (const menu of menus) {
      for (const item of menu.items) {
        if (item.command === task.stimulus) {
          task.color = menu.color;
          return;
        }
      }
    }
  });

  let stimulusType = "ImageStimulus";
  let stimulusImageExtension = "png";
  let stimulusImagePath = "images";

  // itemsFromMenu(menus).forEach(({ command: stimulus }) => {
  //   let img = new Image();
  //   img.src = `${stimulusImagePath}/${stimulus}.${stimulusImageExtension}`;
  // });

  let configuration = {
    condition: menu,
    confirmationCode,
    mturk: {
      hit_id,
      worker_id,
      assignment_id,
    },
    browser: getBrowserInfo(),

    seed,
    menus,
    session,
    group: "keymap",
    name: "tutorial_fixed",
    experimenter: "blaine.lewis@uwaterloo.ca",
    params: params.toString(),
    width: Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    ),
    height: Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    ),
    commandHierarchy,
    participant,
    os: "Windows",

    menu,
    delay: 500,

    stimulusType,
    stimulusImagePath,
    stimulusImageExtension,

    continueOnError: true,
    position: menu === "KeyMap" ? "top" : "bottom",

    flashOnError: true,
    delayOnError: 3000,

    nextLevel: "section",
    children: [
      // {
      //   label: "Stimulus Test",
      //   task: "StimulusResponseTask",
      //   continueOnError: true,
      //   delayOnError: 0,
      //   flashOnError: false,
      //   nextLevel: "trial",
      //   children: stimuliFromMenu(newMenus)
      // },
      {
        label: "Consent",
        task: "ConsentForm",
        letter: ExiiConsentLetter,
        questions: [
          {
            label: "I agree of my own free will to participate in the study.",
            required: true,
          },
        ],
      },

      {
        label: "Pre-Questionnaire",
        task: "GoogleFormQuestionnaire",
        formId: "1FAIpQLScYw8Rd-j9YPeVN2fAuqQa_TpdF2a0h9fn_6wA7A3prHoGIwQ",
        prefillParticipant: "entry.812855120",
      },
      {
        label: "Keyboard Selection",
        task: "KeyboardChooser",
      },

      tutorial,

      {
        label: "Main Experiment Information",
        noProgress: true,
        withContinue: true,
        task: "InformationScreen",
        content: `
# Main Experiment

The main experiment is about to begin. This is the longest part of the experiment.

In this task you will perform tasks just like in the tutorial. Select items as quickly and accurately as possible.

Shortcuts will use only the **shift** key.
      `,
      },
      {
        label: "Selection",
        task: "StimulusResponseTask",
        nextLevel: "block",
        fullProgress: false,
        currentProgress: true,
        progressLevel: true,
        children: addBetweenArray(
          Array(selectionBlocks)
            .fill({})
            .map(() => ({
              nextLevel: "trial",
              children: compoundTask(
                "task",
                { task: "MouseCenteringTask" },
                shuffle(selectionTasks)
              ),
            })),
          [
            {
              task: "DisplayTextTask",
              displayedText:
                "The next block of selections is about to begin, take a break if you need to.",
            },
          ],
          false
        ),
      },

      recallTask,

      {
        label: "Post-Questionnaire",
        task: "GoogleFormQuestionnaire",
        formId: "1FAIpQLSdZuipxOUtCz-3enkgqxaHtaF_vixCVIzpxS84FfW60AYZgOQ",
        prefillParticipant: "entry.1922125170",
      },

      {
        label: "Confirmation Code",
        task: "InformationScreen",
        withContinue: true,

        content: `
# Thank you!

## Confirmation Code: **${confirmationCode}**

Enter this code into the HIT and we'll accept it as soon as we can.

## Follow-Up Study

In 24 hours, we will send you a message on Mechanical Turk asking you to return for an **additional, optional task.** This follow-up task should take under 5 minutes of work. If you complete it, we will pay you **a bonus of $1.00**.

## Contact Information

We really appreciate your participation. It's vital for real people to test our interfaces and we understand sometimes our experiments can be a bit mind numbing but we really do appreciate your time. 

If the HIT took longer than we suggested it would, feel free to email me at blaine.lewis@uwaterloo.ca and I'll bonus you for time spent after crosschecking with our logs.`,
      },
    ],
  };

  if (session === "RECALL") {
    recallTask.label = "Followup Recall";
    configuration.children = [
      {
        label: "Welcome",
        task: "InformationScreen",
        withContinue: true,
        content: `
# Followup Study

This study uses the exact same items and shortcuts as yesterday.

You won't be able to see the shortcuts or interface and must recall them from memory.`,
      },
      recallTask,
      {
        label: "Followup Questionnaire",
        task: "GoogleFormQuestionnaire",
        formId: "1FAIpQLScPsytXjsW9Wa5xElD4LBlO9YgW5g4dLoJc5xdogIx1UFL0SA",
        prefillParticipant: "entry.1922125170",
      },
      {
        label: "Thank you!",
        withContinue: true,
        task: "InformationScreen",
        content: `
# Thank you!

You'll receive a $1.00 bonus sometime in the next couple of days.

Thank you for participating in our experiment and returning for the followup!`,
      },
    ];
  }

  return configuration;
}

// const configuration = addBetween(
//   ["block"],
//   generateRandomParticipant(),
//   {
//     label: "Upload",
//     task: "UploadToS3",
//     noProgress: true,
//     fireAndForget: true
//   },
//   false
// );

const configuration = generateRandomParticipant();

export const GenerateConfiguration = () => {
  let config = configuration;
  let config_string = JSON.stringify(config, null, 2);

  return (
    <div>
      <a
        download={"config.json"}
        href={`data:text/json;charset=utf-8,${config_string}`}
      >
        Download
      </a>
      <div style={{ fontFamily: "monospace", whiteSpace: "pre" }}>
        {config_string}
      </div>
    </div>
  );
};

function addBetween(levels, config, task, end = true) {
  if (!config.children) {
    return config;
  } else if (levels.indexOf(config.nextLevel) > -1) {
    config.children = addBetweenArray(config.children, task, end);
  }

  //recurse recurse
  config.children.forEach((child) => addBetween(levels, child, task, end));
  return config;
}
//TODOLATER: could probably use flatmapdeep to avoid first if statement.
function addBetweenArray(arr, elem, end = true) {
  return flatMap(arr, (child, index, children) => {
    let added;
    if (Array.isArray(elem)) {
      added = [child, ...elem];
    } else {
      added = [child, elem];
    }
    if (end || children.length - 1 !== index) {
      return added;
    } else {
      return child;
    }
  });
}

// export const flatConfigurations = flattenToLevel(
//   generateConfiguration(),
//   "participants"
// );
export { configuration };
// export const configuration = flatConfigurations.filter(
//   config => config.participantId === "KeyMap0"
// )[0];
