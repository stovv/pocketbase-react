const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Run tests with coverage and capture output
function getCoverageStats() {
  try {
    const output = execSync('yarn test:coverage', { encoding: 'utf8' });
    const lines = output.split('\n');

    // Find the "All files" line in the coverage report
    const statsLine = lines.find((line) => line.startsWith('All files'));
    if (!statsLine) {
      throw new Error('Could not find coverage statistics');
    }

    // Parse coverage numbers
    const stats = statsLine.split('|').map((s) => s.trim());
    return {
      statements: stats[1],
      branches: stats[2],
      functions: stats[3],
      lines: stats[4],
    };
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// Find components with 100% coverage
function getFullyCoveredComponents() {
  try {
    const output = execSync('yarn test:coverage', { encoding: 'utf8' });
    const lines = output.split('\n');

    const fullyCovered = [];
    let currentComponent = '';

    lines.forEach((line) => {
      if (line.includes('|')) {
        const parts = line.split('|').map((s) => s.trim());
        if (parts.length >= 5) {
          const [name, stmts, branch, funcs, lines] = parts;
          if (stmts === '100' && branch === '100' && funcs === '100' && lines === '100') {
            currentComponent = name.split('/').pop();
            if (currentComponent && !currentComponent.includes('index')) {
              fullyCovered.push(currentComponent);
            }
          }
        }
      }
    });

    return fullyCovered;
  } catch (error) {
    console.error('Error analyzing coverage:', error);
    return [];
  }
}

// Update README.md
function updateReadme(stats, fullyCovered) {
  const readmePath = path.join(__dirname, '..', 'README.md');
  let readme = fs.readFileSync(readmePath, 'utf8');

  // Update coverage badge
  const coveragePercentage = stats.statements;
  const color =
    Number.parseInt(coveragePercentage) < 80
      ? 'red'
      : Number.parseInt(coveragePercentage) < 90
        ? 'yellow'
        : 'green';
  const badgeRegex = /\[\!\[Test Coverage\].+?\)]/g;
  const newBadge = `[![Test Coverage](https://img.shields.io/badge/coverage-${coveragePercentage}-${color}.svg)](https://github.com/tobicrain/pocketbase-react)`;

  if (readme.match(badgeRegex)) {
    readme = readme.replace(badgeRegex, newBadge);
  } else {
    // Add badge after npm version badge
    readme = readme.replace(/(!\[\[Npm package version\].+?\)])/, `$1\n${newBadge}`);
  }

  // Update coverage table
  const coverageSection = `## Test Coverage

Current test coverage statistics:

| Category | Coverage |
|----------|----------|
| Statements | ${stats.statements} |
| Branches | ${stats.branches} |
| Functions | ${stats.functions} |
| Lines | ${stats.lines} |

Key components with 100% coverage:
${fullyCovered.map((component) => `- \`${component}\``).join('\n')}

> Note: We are actively working on improving test coverage. Contributions are welcome!`;

  // Replace existing coverage section or add it before License
  const coverageSectionRegex = /## Test Coverage[\s\S]*?(?=## License)/;
  if (readme.match(coverageSectionRegex)) {
    readme = readme.replace(coverageSectionRegex, coverageSection + '\n\n');
  } else {
    readme = readme.replace('## License', coverageSection + '\n\n## License');
  }

  fs.writeFileSync(readmePath, readme);
  console.log('README.md has been updated with latest coverage information.');
}

// Main execution
const stats = getCoverageStats();
const fullyCovered = getFullyCoveredComponents();
updateReadme(stats, fullyCovered);
