const chalk = require('chalk');
const semver = require('semver');

module.exports = function checkNodeVersion(wanted, id) {
  if (!semver.satisfies(process.version, wanted)) {
    console.log(
      chalk.red(
        `You are using Node ${
          process.version
        }, but this version of ${id} requires Node ${wanted}.\nPlease upgrade your Node version.`
      )
    );
    process.exit(1);
  }
};
