import { UP, LEFT, DIAG } from "./_params.js";
import { AlignmentResult } from "./alignment_result.js";

export class SpaceEfficientAffineAligner {
  constructor(match_fn, gap_open, gap_extend) {
    this.match_fn = match_fn;
    this.gap_open = gap_open;
    this.gap_extend = gap_extend;
  }

  /**
   *
   * @param {string} x seq X
   * @param {string} y seq Y
   */
  global(x, y) {
    let operations = this.compute_recursive(x, y, x.length, y.length, this.gap_open, this.gap_open);
    let score = this.cost_only(x, y, false, this.gap_open)[0][y.length];
    return new AlignmentResult(x, y, [0, 0], operations, score);
  }

  /**
   * The reversive function of the space-efficient version of Gotoh's algorithm.
   * @param {string} x seq X
   * @param {string} y seq Y
   * @param {number} m x.length
   * @param {number} n y.length
   * @param {number} tb tb
   * @param {number} te te
   * @return {number[]} array of operations
   */
  compute_recursive(x, y, m, n, tb, te) {
    if (n === 0) {
      return Array.from({ length: m }).fill(UP);
    }
    if (m === 0) {
      return Array.from({ length: n }).fill(LEFT);
    }
    if (m === 1) {
      return this.one_row(x, y, n, tb, te);
    }
    let imid = ~~(m / 2);
    let [jmid, join_by_deletion] = this.find_mid(x, y, m, n, tb, te);
    if (join_by_deletion) {
      return this.compute_recursive(x.slice(0, imid - 1), y.slice(0, jmid), imid - 1, jmid, tb, 0)
        .concat([UP, UP])
        .concat(this.compute_recursive(x.slice(imid + 1), y.slice(jmid), m - imid - 1, n - jmid, 0, te));
    } else {
      return this.compute_recursive(x.slice(0, imid), y.slice(0, jmid), imid, jmid, tb, this.gap_open).concat(this.compute_recursive(x.slice(imid), y.slice(jmid), m - imid, n - jmid, this.gap_open, te));
    }
  }
  /**
   * Find `jmid` and whether the boundary is deletion
   * @param {string} x seq X
   * @param {string} y seq Y
   * @param {number} m x.length
   * @param {number} n y.length
   * @param {number} tb tb
   * @param {number} te te
   * @return {[number, boolean]} `jmid` and whether join by deletion
   */
  find_mid(x, y, m, n, tb, te) {
    let imid = ~~(m / 2);
    let [cc_upper, dd_upper] = this.cost_only(x.slice(0, imid), y, false, tb);
    let [cc_lower, dd_lower] = this.cost_only(x.slice(imid), y, true, te);
    let max = -Infinity;
    let jmid = 0;
    let join_by_deletion;
    for (let j = 0; j <= n; j++) {
      let c = cc_upper[j] + cc_lower[n - j];
      if (c > max) {
        max = c;
        jmid = j;
        join_by_deletion = false;
      }
      let d = dd_upper[j] + dd_lower[n - j] - this.gap_open; // subtract duplicating open!;
      if (d > max) {
        max = d;
        jmid = j;
        join_by_deletion = true;
      }
    }
    return [jmid, join_by_deletion];
  }
  /**
   * Cost-only (score-only) Gotoh's algorithm
   * @param {string} x seq A
   * @param {string} y seq B
   * @param {boolean} rev reverse
   * @param {number} tx tb/te
   * @return {[number[], number[]]}
   */
  cost_only(x, y, rev, tx) {
    let m = x.length + 1;
    let n = y.length + 1;
    let cc = Array.from({ length: n }).fill(0);
    let dd = Array.from({ length: n }).fill(0);
    let e, c, s, t;
    t = this.gap_open;
    for (let j = 1; j < n; j++) {
      cc[j] = c = t += this.gap_extend;
      dd[j] = -Infinity;
    }
    t = tx;
    for (let i = 1; i < m; i++) {
      s = cc[0];
      cc[0] = c = t += this.gap_extend;
      e = -Infinity;
      for (let j = 1; j < n; j++) {
        e = Math.max(e, c + this.gap_open) + this.gap_extend;
        dd[j] = Math.max(dd[j], cc[j] + this.gap_open) + this.gap_extend;
        c = rev ? Math.max(dd[j], e, s + this.match_fn(x[m - i - 1], y[n - j - 1])) : Math.max(dd[j], e, s + this.match_fn(x[i - 1], y[j - 1]));
        [s, cc[j]] = [cc[j], c];
      }
    }
    return [cc, dd];
  }
  /**
   * Compute the series of operations to convert single character x to seq Y
   * @param {string} x single-character seq X
   * @param {string} y seq Y
   * @param {number} n y.length
   * @param {number} tb tb
   * @param {number} te te
   * @return {number[]} array of operations
   */
  one_row(x, y, n, tb, te) {
    let score_by_indels_only = Math.max(tb, te) + this.gap_extend * (n + 1) + this.gap_open;
    let max = score_by_indels_only;
    let score_with_one_substitution_BASE = (n - 1) * this.gap_extend + this.gap_open;
    let maxj_;
    for (let j_ = 0; j_ < n; j_++) {
      // index of sequence instead of matrix; y[j] instead of j[j-1] is the jth character
      let score = score_with_one_substitution_BASE + this.match_fn(x, y[j_]);
      if (!(j_ == 0 || j_ == n - 1)) {
        score += this.gap_open;
      }
      if (score > max) {
        max = score;
        maxj_ = j_;
      }
    }
    if (max == score_by_indels_only) {
      let res = Array.from({ lenth: n + 1 });
      res.push(UP);
      for (j = 0; j < n; j++) {
        res.push(LEFT);
      }
      return res;
    } else {
      let res = Array.from({ lenth: n });
      for (let j = 0; j < maxj_; j++) {
        res.push(LEFT);
      }
      res.push(DIAG);
      for (let j = 0; j < n - maxj_ - 1; j++) {
        res.push(LEFT);
      }
      return res;
    }
  }
}
