import { BLOSUM62 } from "../matrices/matrices";

// ! DNA (blastn)
// https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastn&PAGE_TYPE=BlastSearch&LINK_LOC=blasthome
// ftp://ftp.ncbi.nlm.nih.gov/pub/factsheets/HowTo_BLASTGuide.pdf
// Megablast is intended for comparing a query to closely related sequences and works best if the target percent identity is 95% or more but is very fast.
// Discontiguous megablast uses an initial seed that ignores some bases (allowing mismatches) and is intended for cross-species comparisons.
// BlastN is slow, but allows a word-size down to seven bases.
const MEGABLAST = [[1, -2], [-1]]; //"Highly similar sequences"
const DISCONTIGUOUS_MEGABLAST = [
  [2, -3],
  [-5, -2],
]; //"discontiguous megablast"
const BLASTN = [
  [2, -3],
  [-5, -2],
]; //"Somewhat similar sequences"

// ! Protein (blastp)

const BLASTP = [BLOSUM62, [-11, -1]];
