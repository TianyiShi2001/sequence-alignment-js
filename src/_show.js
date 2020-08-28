export function show_alignment(s1, s2, n = 80) {
  let res = "";
  let l = Math.max(s1.length, s2.length);
  let i = 0;
  while (l > i + n) {
    res += s1.slice(i, i + n);
    res += "\n";
    res += "|".repeat(n);
    res += "\n";
    res += s2.slice(i, i + n);
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
