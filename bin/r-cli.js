#!/usr/bin/env node

'use strict';

const program = require('commander');
const fs = require('fs');
const symbols = require('log-symbols');
const chalk = require('chalk');
const validate = require('validate-npm-package-name');

const pkg = require('../package.json');
const init = require('./init');

require('./checkNodeVersion')(pkg.engines.node, pkg.name);

program
  .version(pkg.version, '-v, --version')
  .usage('<command> [options]')
  .command('init <name>')
  .option('-t, --typescript', '创建 typescript 项目')
  .action(name => {
    const valid = validate(name);
    const { validForNewPackages } = valid;
    if (!validForNewPackages) {
      // 错误提示项目名称不合法
      console.log(symbols.error, chalk.red('项目名称不合法'));
      process.exit();
    }
    if (!fs.existsSync(name)) {
      init(program, name);
    } else {
      // 错误提示项目已存在，避免覆盖原有项目
      console.log(symbols.error, chalk.red('项目已存在'));
    }
  });

program.parse(process.argv);
