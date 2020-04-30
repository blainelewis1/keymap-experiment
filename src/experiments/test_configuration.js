import { shuffle } from "../Utils";
import { MODIFIERS } from "../menus/Shortcuts/ShortcutUtils";
import { menuToCommandHierarchy } from "../menus/Shortcuts/CommandHierarchies";

import seedrandom from "seedrandom";

seedrandom("1", { global: true });

let linearmenus = [
  {
    title: "animals",
    items: [
      { command: "bat" },
      { command: "camel" },
      { command: "cat" },
      { command: "dinosaur" },
      { command: "dog" },
      { command: "dolphin" },
      { command: "duck" },
      { command: "fish" },
      { command: "frog" },
      { command: "penguin" },
      { command: "pigeon" },
      { command: "zebra" }
    ]
  },
  {
    title: "fruits",
    items: [
      { command: "apple" },
      { command: "banana" },
      { command: "cherry" },
      { command: "grapes" },
      { command: "kiwi" },
      { command: "lemon" },
      { command: "peach" },
      { command: "pear" },
      { command: "pineapple" },
      { command: "prune" },
      { command: "strawberry" },
      { command: "watermelon" }
    ]
  },
  {
    title: "vegetables",
    items: [
      { command: "artichoke" },
      { command: "broccoli" },
      { command: "carrot" },
      { command: "corn" },
      { command: "cucumber" },
      { command: "garlic" },
      { command: "lettuce" },
      { command: "mushroom" },
      { command: "onion" },
      { command: "pepper" },
      { command: "potato" },
      { command: "pumpkin" }
    ]
  },
  {
    title: "office",
    items: [
      { command: "chair" },
      { command: "clock" },
      { command: "envelope" },
      { command: "keyboard" },
      { command: "mouse" },
      { command: "paperclip" },
      { command: "pencil" },
      { command: "printer" },
      { command: "stamp" },
      { command: "stapler" },
      { command: "telephone" },
      { command: "trash" }
    ]
  },
  {
    title: "clothing",
    items: [
      { command: "boot" },
      { command: "bowtie" },
      { command: "button" },
      { command: "coat" },
      { command: "dress_shirt" },
      { command: "gloves" },
      { command: "hat" },
      { command: "skirt" },
      { command: "socks" },
      { command: "sweater" },
      { command: "t-shirt" },
      { command: "trousers" }
    ]
  },
  {
    title: "recreation",
    items: [
      { command: "baseball" },
      { command: "basketball" },
      { command: "bowling" },
      { command: "cards" },
      { command: "chess" },
      { command: "darts" },
      { command: "dice" },
      { command: "hockey" },
      { command: "karate" },
      { command: "pool" },
      { command: "rubikscube" },
      { command: "tennis" }
    ]
  }
];

let letters = "qwertyuiopasdfghjklzxcvbnm";

function generateRandomShortcut() {
  let m = MODIFIERS.slice();
  shuffle(m);
  let modifiers = m.slice(0, Math.floor(Math.random() * (m.length - 1) + 1));

  let letter = letters[Math.floor(Math.random() * letters.length)];
  let shortcut = [...modifiers, letter];

  return [shortcut];
}

linearmenus.forEach(menu => {
  menu.items.forEach(item => {
    item.shortcut = generateRandomShortcut();
  });
});

export default {
  current: { key: "sections", index: 0 },
  //menuItems : ["bear", "pig", "bird", "dog"],
  menus: linearmenus,
  menu: "ExposeHK",
  // delay: 500,
  stimulusType: "ImageStimulus",
  stimulusImagePath: "/images",
  stimulusImageExtension: "png",
  participant: "hello",
  commandHierarchy: menuToCommandHierarchy(linearmenus),
  sections: [
    {
      task: "StimulusResponseTask",
      current: { key: "blocks", index: 0 },
      blocks: [
        {
          current: { key: "trials", index: 0 },
          trials: [
            {
              stimulus: "bat"
            },
            {
              stimulus: "camel"
            },
            {
              stimulus: "apple"
            },
            {
              stimulus: "dog"
            }
          ]
        }
        // {
        //   current: { key: "trials", index: 0 },
        //   trials: [
        //     {
        //       stimulus: "cat"
        //     },
        //     {
        //       stimulus: "apple"
        //     },
        //     {
        //       stimulus: "dog"
        //     },
        //     {
        //       stimulus: "dolphin"
        //     }
        //   ]
        // }
      ]
    },
    {
      task: "StimulusResponseTask",
      menu: "Shortcuts",
      flashOnError: true,
      current: { key: "blocks", index: 0 },
      blocks: [
        {
          current: { key: "trials", index: 0 },
          trials: [
            {
              stimulus: "bat"
            },
            {
              stimulus: "camel"
            },
            {
              stimulus: "apple"
            },
            {
              stimulus: "dog"
            }
          ]
        }
      ]
    }
  ]
};
