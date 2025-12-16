exports.generateCSV = (headers, rows) => {
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
};
