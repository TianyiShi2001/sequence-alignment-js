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

// compute the max score of one grid and one of the possible directions
export function compute_max_score_and_direction(up, left, diag) {
  let max_score = Math.max(up, left, diag);
  return [max_score, [up, left, diag].indexOf(max_score) + 1];
}

export function match_fn_from_matrix(matrix) {
  return (a, b) => matrix[a][b];
}

export function match_fn_from_match_mismatch(match, mismatch) {
  return (a, b) => (a === b ? match : mismatch);
}
