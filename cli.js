import { Aligner } from "./src/nw.js";
import { matrices } from "./src/matrices/matrices.js";
import * as yargs from "yargs";
import { match_fn_from_match_mismatch, match_fn_from_matrix } from "./src/utils.js";

let argv = yargs.default // eslint-disable-line
  .alias("v", "version")
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
    describe: "Substitution matrix. For protein sequences, choose from BLOSUM45, BLOSUM50, BLOSUM62, BLOSUM80, PAM30, PAM70, PAM250. Defaults to BLOSUM62",
    type: "string",
  })
  .option("gap", {
    alias: "g",
    describe: "Gap penalty. e.g. '5,2'",
    type: "string",
  })
  .example("align ACGTAGG ATGAAGC\n└───→Global alignment of two DNA sequences")
  .example("align -p -M l CSADFG CSQFGW\nLocal alignment of two protein sequences")
  .epilog("copyright©️石天熠 2020")
  .showHelpOnFail(false).argv;

if (argv._.length === 0) {
  console.error("Need to provide two sequences");
}
let type = argv.protein ? "p" : argv.rna ? "r" : "d";

let matchFn;
if (!argv.matrix) {
  if (type === "d" || type === "r") {
    matchFn = match_fn_from_match_mismatch(1, -2);
  } else {
    matchFn = match_fn_from_matrix(matrices.BLOSUM62);
  }
} else {
  let m = argv.matrix.toUpperCase();
  matchFn = match_fn_from_matrix(matrices[m]);
}

let gapPenalty;
if (!argv.gap) {
  gapPenalty = -1;
} else {
  if (argv.gap > 0) {
    argv.gap = -argv.gap;
  }
  gapPenalty = +argv.gap;
}

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
