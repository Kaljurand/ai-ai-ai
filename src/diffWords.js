export function diffWords(ref, hyp) {
  const r = ref.split(/\s+/);
  const h = hyp.split(/\s+/);
  const dp = Array.from({ length: r.length + 1 }, () => Array(h.length + 1).fill(0));
  for (let i = 1; i <= r.length; i++) {
    for (let j = 1; j <= h.length; j++) {
      if (r[i - 1] === h[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const diff = [];
  let i = r.length, j = h.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && r[i - 1] === h[j - 1]) {
      diff.unshift({ type: 'equal', word: r[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ type: 'insert', word: h[j - 1] });
      j--;
    } else {
      diff.unshift({ type: 'delete', word: r[i - 1] });
      i--;
    }
  }
  return diff;
}

export function diffWordsHtml(ref, hyp) {
  return diffWords(ref, hyp)
    .map(d => {
      if (d.type === 'equal') return d.word;
      return `<span class="${d.type}">${d.word}</span>`;
    })
    .join(' ');
}
