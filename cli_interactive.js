#!/usr/bin/env node
let inquirer = require("inquirer");
inquirer
  .prompt([
    {
      type: "list",
      name: "seqType",
      message: "Sequence Type?",
      choices: ["Protein", "DNA", "RNA"],
    },
    {
      type: "list",
      name: "matrix",
      message: "Matrix?",
      choices: ["BLOSUM45", "BLOSUM62"],
    },
  ])
  .then((answers) => {
    console.log(answers);
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else when wrong
    }
  });
