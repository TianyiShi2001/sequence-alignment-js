import { UP, LEFT, DIAG } from "./_common.js";
import { compute_max_score_and_direction } from "./_common.js";
import { AlignmentResult } from "./_common.js";
/**
 * Aligner
 */
export class Aligner {
  result;
  /**
   *
   * @param {string} x the first sequence
   * @param {string} y the other sequence
   * @param {function} match_fn match function
   * @param {number} gap_penalty gap panelty (negative integer)
   */
  constructor(x, y, match_fn, gap_penalty) {
    this.x = x;
    this.y = y;
    this.n = x.length + 1;
    this.m = y.length + 1;
    this.match_fn = match_fn;
    this.gap_penalty = gap_penalty;
    this.result = new AlignmentResult(x, y, [0, 0], [], -Infinity);
  }
  global() {
    this.init_matrices(true);
    this.fill_matrices();
    this.result.score = this.S[this.x.length][this.y.length];
    this.traceback_global();
    return this.result;
    // return new AlignmentResult(this.x, this.y, [0, 0], )
    //return this.report();
  }
  semi_global() {
    this.init_matrices(false);
    this.fill_matrices();
    this.traceback_semiglobal();
    return this.result;
  }
  local() {
    this.init_matrices(false);
    this.fill_matrices(true);
    this.traceback_local();
    return this.result;
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
    this.result.coords = [i, j];
    this.result.alignment = res.reverse();
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
    this.result.score = max;
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

    this.result.score = max;

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
    this.result.alignment = res;
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
