const getFields = columns => columns.filter(c => c.field !== 'actions');

export function rowsToJSON(rows, columns) {
  const fields = getFields(columns);
  const data = rows.map(r => {
    const obj = {};
    fields.forEach(c => {
      obj[c.field] = r[c.field];
    });
    return obj;
  });
  return JSON.stringify(data, null, 2);
}

function rowsToDelimited(rows, columns, sep, quote = true) {
  const fields = getFields(columns);
  const header = fields.map(f => f.headerName || f.field).join(sep);
  const lines = rows
    .map(r =>
      fields
        .map(f => {
          let val = r[f.field] == null ? '' : String(r[f.field]);
          if (quote) val = val.replace(/"/g, '""');
          return quote ? `"${val}"` : val;
        })
        .join(sep)
    )
    .join('\n');
  return header + '\n' + lines;
}

export function rowsToCSV(rows, columns) {
  return rowsToDelimited(rows, columns, ',');
}

export function rowsToTSV(rows, columns) {
  return rowsToDelimited(rows, columns, '\t', false);
}

export function rowsToMarkdown(rows, columns) {
  const fields = getFields(columns);
  const header = '|' + fields.map(f => f.headerName || f.field).join('|') + '|';
  const separator = '|' + fields.map(() => '---').join('|') + '|';
  const lines = rows.map(r => '|' + fields.map(f => String(r[f.field] ?? '').replace(/\|/g, '\\|')).join('|') + '|').join('\n');
  return header + '\n' + separator + '\n' + lines;
}

export function rowsToYAML(rows, columns) {
  const fields = getFields(columns);
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
