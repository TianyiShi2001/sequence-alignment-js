import { UP, LEFT, DIAG } from "./_params.js";

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
