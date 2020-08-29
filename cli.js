#!/usr/bin/env node
import { Aligner } from "./src/nw.js";
import { AffineGapAligner } from "./src/affine_gap.js";
import { matrices } from "./src/matrices/matrices.js";
import * as yargs from "yargs";
import { match_fn_from_match_mismatch, match_fn_from_matrix } from "./src/utils.js";

let argv = yargs.default // eslint-disable-line
  .alias("V", "version")
  .alias("h", "help")
  .help("help")
  .usage("Usage: $0 [OPTIONS] seq1 seq2")
  .option("mode", {
    alias: "M",
    describe: "mode (g for global, s for semi-global, l for local); defaults to g",
    type: "string",
    default: "g",
  })
  .option("dna", {
    alias: "d",
    describe: "Align DNA sequences",
    type: "boolean",
    demand: false,
  })
  .option("rna", {
    alias: "r",
    describe: "Align RNA sequences",
    type: "boolean",
    demand: false,
  })
  .option("protein", {
    alias: "p",
    describe: "Align DNA sequences",
    type: "boolean",
    demand: false,
  })
  .option("matrix", {
    alias: "m",
    describe: "Substitution matrix OR match/mismatch score. For protein sequences, choose from BLOSUM45, BLOSUM50, BLOSUM62, BLOSUM80, PAM30, PAM70, PAM250. Defaults to BLOSUM62. Use a pair of number to use match/mismatch scores instead (see examples below).",
    type: "string",
  })
  .option("gap", {
    alias: "g",
    describe: "Gap penalty (positive number). e.g. '5,2' for affine gap penalty with gapOpen=5 and gapExtend=2; '2' for linear gap penalty of -2",
    type: "string",
  })
  .option("verbose", {
    alias: "v",
    describe: "Verbose output with parameter values",
    type: "boolean",
    default: false,
  })
  .example("align ACGTAGG ATGAAGC\n└───→Global alignment of two DNA sequences")
  .example("align -p -m blosum62 -M l CSADFG CSQFGW\n└───→Local alignment of two protein sequences using BLOSUM62 matrix")
  .example("align -m 5,-2 -g 4,1 CC ACCT\n└───→Global aligment of two DNA sequences with affine gap penalty (gapOpen=4, gapExtend=1); match/mismatch=5,-2")
  .epilog("copyright (c) 2020 Tianyi Shi")
  .showHelpOnFail(false).argv;

if (argv._.length === 0) {
  console.error("Need to provide two sequences");
}
let type = argv.protein ? "p" : argv.rna ? "r" : "d";

let matchFn;
let matchMismatch;
if (!argv.matrix) {
  if (type === "d" || type === "r") {
    matchMismatch = [1, -2];
    matchFn = match_fn_from_match_mismatch(...matchMismatch);
  } else {
    matchFn = match_fn_from_matrix(matrices.BLOSUM62);
  }
} else {
  let m = argv.matrix.toUpperCase();
  if (matrices[m]) {
    matchFn = match_fn_from_matrix(matrices[m]);
  } else {
    matchMismatch = argv.matrix.split(/,\s*/g).map((s) => +s);
    matchFn = match_fn_from_match_mismatch(...matchMismatch);
  }
}

let gapPenalty, gapOpen, gapExtend;
let affineGap = false;
if (!argv.gap) {
  gapPenalty = -1;
} else {
  if (argv.gap.includes(",")) {
    [gapOpen, gapExtend] = argv.gap
      .split(/,\s*/)
      .slice(0, 2)
      .map((s) => -s);
    affineGap = true;
  } else {
    if (argv.gap > 0) {
      argv.gap = -argv.gap;
    }
    gapPenalty = +argv.gap;
  }
}

if (affineGap) {
  let aligner = new AffineGapAligner(argv._[0], argv._[1], matchFn, gapOpen, gapExtend);
  switch (argv.mode) {
    case "g":
      aligner.global();
      break;
    default:
      aligner.global();
      console.log("Currently affine gap supports global alignment only.");
      break;
  }
} else {
  let aligner = new Aligner(argv._[0], argv._[1], matchFn, gapPenalty);
  switch (argv.mode) {
    case "g":
      aligner.global();
      break;
    case "s":
      aligner.semi_global();
      break;
    case "l":
      aligner.local();
      break;
    default:
      break;
  }
}

if (argv.verbose) {
  console.log({
    matrix: matchMismatch ? null : argv.matrix,
    "match/mismatch": matchMismatch,
    gapPenalty,
    gapOpen,
    gapExtend,
  });
}
