const fs = require('fs');
const path = require('path');

const commit = process.env.RENDER_GIT_COMMIT || process.env.GITHUB_SHA || 'unknown';
const outputPath = path.join(__dirname, '..', 'public', 'deployment-info.json');

fs.writeFileSync(outputPath, `${JSON.stringify({ commit }, null, 2)}\n`, 'utf8');
console.log(`Wrote deployment metadata for commit: ${commit}`);
