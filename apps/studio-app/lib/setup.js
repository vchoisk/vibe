const fs = require('fs-extra');
const { defaultConfig, getPaths } = require('@snapstudio/config');

async function setupDirectories() {
  console.log('Setting up SnapStudio directories...');
  
  const paths = getPaths();
  
  // Create all necessary directories
  const directories = [
    paths.appData,
    paths.sessions,
    paths.config,
    paths.logs,
    paths.temp,
    defaultConfig.watchDirectory,
    defaultConfig.outputDirectory,
  ];

  for (const dir of directories) {
    await fs.ensureDir(dir);
    console.log(`✓ Created/verified: ${dir}`);
  }

  // Create default config if it doesn't exist
  const configPath = `${paths.config}/studio-settings.json`;
  if (!(await fs.pathExists(configPath))) {
    await fs.writeJson(configPath, defaultConfig, { spaces: 2 });
    console.log('✓ Created default configuration');
  }

  console.log('\nSnapStudio is ready!');
  console.log(`Watch directory: ${defaultConfig.watchDirectory}`);
  console.log(`Output directory: ${defaultConfig.outputDirectory}`);
}

module.exports = { setupDirectories };