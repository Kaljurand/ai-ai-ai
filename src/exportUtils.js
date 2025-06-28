export function rowsToJSON(rows, columns) {
  const fields = columns.filter(c => c.field !== 'actions');
  const data = rows.map(r => {
    const obj = {};
    for (const c of fields) obj[c.field] = r[c.field];
    return obj;
  });
  return JSON.stringify(data, null, 2);
}

export function rowsToCSV(rows, columns) {
  const fields = columns.filter(c => c.field !== 'actions');
  const header = fields.map(f => f.headerName || f.field).join(',');
  const lines = rows.map(r => fields.map(f => {
    const val = r[f.field] == null ? '' : String(r[f.field]).replace(/"/g, '""');
    return `"${val}"`;
  }).join(',')).join('\n');
  return header + '\n' + lines;
}

export function rowsToMarkdown(rows, columns) {
  const fields = columns.filter(c => c.field !== 'actions');
  const header = '|' + fields.map(f => f.headerName || f.field).join('|') + '|';
  const separator = '|' + fields.map(() => '---').join('|') + '|';
  const lines = rows.map(r => '|' + fields.map(f => String(r[f.field] ?? '').replace(/\|/g, '\\|')).join('|') + '|').join('\n');
  return header + '\n' + separator + '\n' + lines;
}

export function rowsToYAML(rows, columns) {
  const fields = columns.filter(c => c.field !== 'actions');
  return rows
    .map(r =>
      '-\n' +
      fields
        .map(f => `  ${f.field}: ${r[f.field] ?? ''}`)
        .join('\n')
    )
    .join('\n');
}

export function download(content, type, filename) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
