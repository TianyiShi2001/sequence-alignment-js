import { BLOSUM45 } from "./matrices/matrices.js";
import { UP, LEFT, DIAG } from "./_params.js";
import { compute_max_score_and_direction } from "./utils.js";
import { Aligner } from "./nw.js";

export class AffineGapAligner extends Aligner {
  constructor(x, y, match_fn, gap_open, gap_extend) {
    super(x, y, match_fn);
    // this.x = x;
    // this.y = y;
    // this.n = x.length + 1;
    // this.m = y.length + 1;
    // this.match_fn = match_fn;
    this.gap_open = gap_open;
    this.gap_extend = gap_extend;
  }
  global() {
    this.init_matrices(true);
    this.fill_matrices();
    this.score = this.S[this.x.length][this.y.length];
    this.traceback_global();
    return this.report();
  }
  global_() {
    this.init_matrices(true);
    this.fill_matrices_();
    this.score = this.S[this.x.length][this.y.length];
    this.traceback_global();
    return this.report();
  }
  init_matrices(x) {
    this.D = Array.from({ length: this.n }, () => Array(this.m).fill(0));
    this.I = Array.from({ length: this.n }, () => Array(this.m).fill(0));
    this.S = Array.from({ length: this.n }, () => Array(this.m).fill(0));
    this.T = Array.from({ length: this.n }, () => Array(this.m).fill(0));
    for (let i = 1; i < this.n; i++) {
      //this.D[i][0] = this.gap_open + i * this.gap_extend;
      this.S[i][0] = this.gap_open + i * this.gap_extend;
      this.I[i][0] = -Infinity; // practically, no greater than this.S[i][0] + gap_open is OK
      this.T[i][0] = UP;
    }
    for (let j = 1; j < this.m; j++) {
      //this.I[0][j] = this.gap_open + j * this.gap_extend;
      this.S[0][j] = this.gap_open + j * this.gap_extend;
      this.D[0][j] = -Infinity;
      this.T[0][j] = LEFT;
    }
  }
  fill_matrices() {
    for (let i = 1; i < this.n; i++) {
      for (let j = 1; j < this.m; j++) {
        [this.S[i][j], this.T[i][j]] = compute_max_score_and_direction(
          (this.D[i][j] = Math.max(this.S[i - 1][j] + this.gap_open + this.gap_extend, this.D[i - 1][j] + this.gap_extend)), // delete (up)
          (this.I[i][j] = Math.max(this.S[i][j - 1] + this.gap_open + this.gap_extend, this.I[i][j - 1] + this.gap_extend)),
          this.S[i - 1][j - 1] + this.match_fn(this.x[i - 1], this.y[j - 1]) // match (diag)
        ); //insert (left)
      }
    }
  }
  fill_matrices_() {
    for (let i = 1; i < this.n; i++) {
      for (let j = 1; j < this.m; j++) {
        let up = this.S[i - 1][j] + this.gap_extend;
        this.T[i - 1][j] !== UP && (up = up + this.gap_open);
        let left = this.S[i][j - 1] + this.gap_extend;
        this.T[i][j - 1] !== LEFT && (left = left + this.gap_open);
        let diag = this.S[i - 1][j - 1] + this.match_fn(this.x[i - 1], this.y[j - 1]);
        [this.S[i][j], this.T[i][j]] = compute_max_score_and_direction(up, left, diag);
      }
    }
  }
}
