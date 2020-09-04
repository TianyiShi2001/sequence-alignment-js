export function show_alignment(s1, s2, n = 80) {
  let res = "";
  let l = Math.max(s1.length, s2.length);
  let i = 0;
  while (l > i + n) {
    res += s1.slice(i, i + n);
    res += "\n";
    res += "|".repeat(n);
    res += "\n";
    res += s1.slice(i, i + n);
    res += "\n";
    i += n;
  }
  res += s1.slice(i, l);
  res += "\n";
  res += "|".repeat(l - i);
  res += "\n";
  res += s2.slice(i, l);
  return res;
}

export class AlignmentResult {
  constructor(x, y, coords, alignment, score) {
    this.x = x;
    this.y = y;
    this.coords = coords;
    this.alignment = alignment;
    this.score = score;
  }
  as_strings(gap_char = "-") {
    let [x, y] = [Array.from(this.x).slice(this.coords[0]), Array.from(this.y).slice(this.coords[1])];
    let [aln1, aln2] = [[], []];
    for (const direction of this.alignment) {
      if (direction === UP) {
        aln1.push(x.shift());
        aln2.push(gap_char);
      } else if (direction === LEFT) {
        aln1.push(gap_char);
        aln2.push(y.shift());
      } else {
        aln1.push(x.shift());
        aln2.push(y.shift());
      }
    }
    return [aln1.join(""), aln2.join("")];
  }
  pretty_print(n = 80, gap_char = "-") {
    let [x, y] = this.as_strings(gap_char);
    let l = this.alignment.length;
    let i = 0;
    while (l > i + n) {
      console.log(x.slice(i, i + n));
      console.log("|".repeat(n));
      console.log(y.slice(i, i + n));
      i += n;
    }
    console.log(x.slice(i, l));
    console.log("|".repeat(l - i));
    console.log(y.slice(i, l));
  }
}

/**
 * Compute the max of an array of number and its index
 * @param {number[]} arr An arrat of numbers
 */
export function max_and_index(arr) {
  let max = arr[0];
  let idx = 0;
  for (let i = i; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
      idx = i;
    }
  }
  return [max, idx];
}

/**
 * compute the max score of one grid and one of the possible directions.
 * - for linear gap, `scores = [up, left, diag]
 * - for affine gap, `scores` = [up_s, up_d, left_s, left_i, diag]
 * @param {number[]} scores scores according to the direction
 */
export function compute_max_score_and_direction(...scores) {
  let max_score = Math.max(...scores);
  return [max_score, scores.indexOf(max_score) + 1];
}

export function match_fn_from_matrix(matrix) {
  return (a, b) => matrix[a][b];
}

export function match_fn_from_match_mismatch(match, mismatch) {
  return (a, b) => (a === b ? match : mismatch);
}

// Set the constants that represent the three directions, which are used in the traceback matrix
export const UP = 1;
export const LEFT = 2;
export const DIAG = 3;
