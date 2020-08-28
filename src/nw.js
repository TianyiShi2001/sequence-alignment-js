import { UP, LEFT, DIAG } from "./_params.js";
import { compute_max_score_and_direction } from "./utils.js";
import { show_alignment } from "./_show.js";
/**
 * Aligner
 */
export class Aligner {
  score;
  alignment;
  coords;
  /**
   *
   * @param {string} x the first sequence
   * @param {string} y the other sequence
   * @param {function} match_fn match function
   * @param {number} gap_penalty gap panelty (negative integer)
   */
  constructor(x, y, match_fn, gap_penalty) {
    this.coords = [0, 0]; // unless local alignment
    this.x = x;
    this.y = y;
    this.n = x.length + 1;
    this.m = y.length + 1;
    this.match_fn = match_fn;
    this.gap_penalty = gap_penalty;
  }
  report() {
    console.log(show_alignment(...this.traceback_string("-")));
    console.log("score:", this.score);
    return { x: this.x, y: this.y, score: this.score, coords: this.coords, alignment: this.alignment };
  }
  global() {
    this.init_matrices(true);
    this.fill_matrices();
    this.score = this.S[this.x.length][this.y.length];
    this.traceback_global();
    return this.report();
  }
  semi_global() {
    this.init_matrices(false);
    this.fill_matrices();
    this.traceback_semiglobal();
    return this.report();
  }
  local() {
    this.init_matrices(false);
    this.fill_matrices(true);
    this.traceback_local();
    return this.report();
  }

  fill_matrices(local = false) {
    for (let i = 1; i < this.n; i++) {
      for (let j = 1; j < this.m; j++) {
        let up = this.S[i - 1][j] + this.gap_penalty;
        let left = this.S[i][j - 1] + this.gap_penalty;
        let diag = this.S[i - 1][j - 1] + this.match_fn(this.x[i - 1], this.y[j - 1]);
        let [score, direction] = compute_max_score_and_direction(up, left, diag);
        if (local === true) {
          if (score < 0) {
            [score, direction] = [0, 0];
          }
        }
        [this.S[i][j], this.T[i][j]] = [score, direction];
      }
    }
  }
  traceback(coords) {
    let res = [];
    let [i, j] = coords;
    while (true) {
      let direction = this.T[i][j];
      if (direction === UP) {
        res.push(1);
        i--;
      } else if (direction === LEFT) {
        res.push(2);
        j--;
      } else if (direction === DIAG) {
        res.push(3);
        i--;
        j--;
      } else break;
    }
    this.coords = [i, j];
    this.alignment = res.reverse();
  }
  // from (n-1, m-1) (last vertex) to (0, 0)
  traceback_global() {
    this.traceback([this.n - 1, this.m - 1]);
  }
  traceback_local() {
    let max = -Infinity;
    let coords = [0, 0];
    for (let i = 0; i < this.n; i++) {
      for (let j = 0; j < this.m; j++) {
        const n = this.S[i][j];
        if (n > max) {
          max = n;
          coords = [i, j];
        }
      }
    }
    this.score = max;
    this.traceback(coords);
  }
  traceback_semiglobal() {
    // find_max_score_and_coords
    let max = 0;
    let coords = [0, 0];
    // last column
    for (let i = 0; i < this.n; i++) {
      const n = this.S[i][this.m - 1];
      if (n > max) {
        max = n;
        coords = [i, this.m - 1];
      }
    }
    // last row
    for (let j = 0; j < this.m; j++) {
      const n = this.S[this.n - 1][j];
      if (n > max) {
        max = n;
        coords = [this.n - 1, j];
      }
    }

    this.score = max;

    // traceback
    let [i, j] = coords;
    let res = [];
    // if max lies in the last column; i<=n-1; n-i>=1
    for (let a = 1; a < this.n - i; a++) {
      res.push(1);
    }
    // if max lies in the last row; j<=m-1; m-j>=1
    for (let b = 1; b < this.m - j; b++) {
      res.push(2);
    }
    // loop while reaching the boundary at either i==0 or j ==0
    while (i !== 0 && j !== 0) {
      let direction = this.T[i][j];
      if (direction === UP) {
        res.push(1);
        i--;
      } else if (direction === LEFT) {
        res.push(2);
        j--;
      } else {
        res.push(3);
        i--;
        j--;
      }
    }
    // reaching left boundary, can still go up (deletions at start)
    for (let n = 0; n < i; n++) {
      res.push(1);
    }
    // reaching top boundary, can still go left (insertions at start)
    for (let m = 0; m < j; m++) {
      res.push(2);
    }
    this.alignment = res;
  }
  // from the traceback matrix, resolve one of the possible alignments
  traceback_string(gap_char, pretty) {
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

  // initialise the score matrix and the traceback matrix
  init_matrices(global = true) {
    this.S = Array.from({ length: this.n }, () => Array(this.m).fill(0));
    this.T = Array.from({ length: this.n }, () => Array(this.m).fill(0));
    if (global === false) {
      return;
    }
    for (let j = 1; j < this.m; j++) {
      this.S[0][j] = this.S[0][j - 1] + this.gap_penalty;
      this.T[0][j] = LEFT;
    }
    for (let i = 1; i < this.n; i++) {
      this.S[i][0] = this.S[i - 1][0] + this.gap_penalty;
      this.T[i][0] = UP;
    }
  }
}
