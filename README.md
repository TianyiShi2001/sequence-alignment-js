# sequence-alignment-js
Sequence Alignment Algorithms implemented in Javascript, with a command line application

# Installation

```bash
npm i -g sequence-alignment
```

# Usage

## Help

Use `align -h` to show help.

## Examples

Global alignment of DNA sequences, using default parameters of NCBI megablast (`match = 1, mismatch = -2, gap = linear`)

```bash
$ align ATCCGAACATCCAATCGAAGC AGCATGCAAT
ATCCGAACAT-CCAATCGAAGC
||||||||||||||||||||||
A---G--CATGC-AAT------
score: -4
```

Semiglobal and local alignment using `-M s` and `-M l`, respectively

```bash
$ align -M s ATCCGAACATCCAATCGAAGC AGCATGCAAT
ATCCGAACATC-CAA-TCGAAGC
|||||||||||||||||||||||
------AGC-ATGCAAT------
score: 5

$ align -M l ATCCGAACATCCAATCGAAGC AGCATGCAAT
A-CAT-CCAAT
|||||||||||
AGCATGC-AAT
score: 5
```

