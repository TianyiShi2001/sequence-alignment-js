# sequence-alignment-js
[![npm](https://badge.fury.io/js/sequence-alignment.svg)](https://badge.fury.io/js/sequence-alignment)

Sequence Alignment Algorithms implemented in Javascript, with a command line application.

The core algorithm in this package, which is the space efficient version of Gotoh's algorithm, is based on [Eugene W. Myers and Webb Miller (1988) Optimal alignments in linear space, _Bioinformatics_ **4**, 11-17.](https://doi.org/10.1093/bioinformatics/4.1.11)


# Installation

```bash
npm i -g sequence-alignment
```

# Usage

## Help

Use `align -h` to show help page.

## Examples

### Global, Semiglobal and Local Alignment

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

### DNA/RNA/Protein

Use the `-d`, `-r`, `-p` flags to specify the type of sequence to be DNA, RNA and protein, respectively. Defaults to DNA.

```bash
# DNA
align ACCGGT ACGCAT
align -d ACCGGT ACGCAT
# RNA
align -r AUGCGU AUGCUG
# protein
align -p ACGHKL ACGLKL
```

### Specifying Substitution Matrix or Match/Mismatch Scores

Use the `-m` option to specify the substitution **m**atrix (usually for aligning protein sequences) OR **m**atch/**m**ismatch scores (usually for DNA/RNA sequences).

```bash
# align protein sequences using BLOSUM62 matrix
align -p -m blosum62 ASDFG ASDGF
```

```bash
# align DNA sequences with match=2; mismatch=-1
align -d -m 2,-1 ACGTA AGTAC
```

### Gap Penalty

If you used a matrix such as BLOSUM62, the gap

The gap penalty should be a positive number.

Use a single number to specify a constant (linear) gap penalty.

```bash
$ align ACCGGT AT -m 5,-1 -g 3
ACCGGT
||||||
A----T
score: -2
```

Use a pair of numbers to specify the gap open penalty and gap extend penalty, so that the affine gap penalty is used.

```bash
$ align ACCGGT AT -m 5,-1 -g 3,1
ACCGGT
||||||
A----T
score: 3
```

