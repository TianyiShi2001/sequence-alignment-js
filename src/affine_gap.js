import { BLOSUM45 } from "./matrices/matrices.js";
import { compute_max_score_and_direction } from "./utils.js";
import { Aligner } from "./nw.js";

const UP_X = 1;
const UP_U = 2;
const LEFT_X = 3;
const LEFT_L = 4;
//const DIAG = 5;

export class AffineGapAligner extends Aligner {
  constructor(x, y, match_fn, gap_open, gap_extend) {
    super(x, y, match_fn);
    this.gap_open = gap_open;
    this.gap_extend = gap_extend;
  }
  global() {
    this.init_matrices(true);
    this.fill_matrices();
    this.result.score = this.S[this.x.length][this.y.length];
    this.traceback([this.n - 1, this.m - 1]);
    return this.result;
  }

  init_matrices(x) {
    this.D = Array.from({ length: this.n }, () => Array(this.m).fill(0));
    this.I = Array.from({ length: this.n }, () => Array(this.m).fill(0));
    this.S = Array.from({ length: this.n }, () => Array(this.m).fill(0));
    this.T = Array.from({ length: this.n }, () => Array(this.m).fill(0));
    this.TD = Array.from({ length: this.n }, () => Array(this.m).fill(0));
    this.TI = Array.from({ length: this.n }, () => Array(this.m).fill(0));
    for (let i = 1; i < this.n; i++) {
      //this.D[i][0] = this.gap_open + i * this.gap_extend;
      this.S[i][0] = this.gap_open + i * this.gap_extend;
      this.I[i][0] = -Infinity; // practically, no greater than this.S[i][0] + gap_open is OK
      this.T[i][0] = UP_X;
    }
    for (let j = 1; j < this.m; j++) {
      //this.I[0][j] = this.gap_open + j * this.gap_extend;
      this.S[0][j] = this.gap_open + j * this.gap_extend;
      this.D[0][j] = -Infinity;
      this.T[0][j] = LEFT_X;
    }
  }
  fill_matrices() {
    for (let i = 1; i < this.n; i++) {
      for (let j = 1; j < this.m; j++) {
        let up = this.S[i - 1][j] + this.gap_open + this.gap_extend;
        let up_u = this.D[i - 1][j] + this.gap_extend;
        let up_max = Math.max(up, up_u);
        this.D[i][j] = up_max;
        this.TD[i][j] = up_max === up ? 1 : 2;

        let left = this.S[i][j - 1] + this.gap_open + this.gap_extend;
        let left_l = this.I[i][j - 1] + this.gap_extend;
        let left_max = Math.max(left, left_l);
        this.I[i][j] = left_max;
        this.TI[i][j] = left_max === left ? 3 : 4;

        let diag = this.S[i - 1][j - 1] + this.match_fn(this.x[i - 1], this.y[j - 1]);

        [this.S[i][j], this.T[i][j]] = compute_max_score_and_direction(up, up_u, left, left_l, diag);
      }
    }
  }
  traceback(coords) {
    let res = [];
    let [i, j] = coords;
    let m = this.T;

    while (true) {
      //onsole.log(m, i, j);
      let direction = m[i][j];
      if (direction === UP_X) {
        res.push(1);
        i--;
        m = this.T;
      } else if (direction === UP_U) {
        res.push(1);
        i--;
        m = this.TD;
      } else if (direction === LEFT_X) {
        res.push(2);
        j--;
        m = this.T;
      } else if (direction === LEFT_L) {
        res.push(2);
        j--;
        m = this.TI;
      } else if (direction === 5) {
        res.push(3);
        i--;
        j--;
        m = this.T;
      } else break;
    }
    this.result.coords = [i, j];
    this.result.alignment = res.reverse();
  }
}
