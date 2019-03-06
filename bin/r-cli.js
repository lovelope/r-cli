#!/usr/bin/env node

'use strict';

const program = require('commander');
const download = require('download-git-repo');
const inquirer = require('inquirer');
const fs = require('fs');
const ora = require('ora');
const symbols = require('log-symbols');
const chalk = require('chalk');

const pkg = require('../package.json');

require('./checkNodeVersion')(pkg.engines.node, pkg.name);

program
  .version(pkg.version, '-v, --version')
  .usage('<command> [options]')
  .command('init <name>')
  .option('-t, --typescript', '创建 typescript 项目')
  .action(name => {
    if (!fs.existsSync(name)) {
      inquirer
        .prompt([
          {
            name: 'description',
            message: '请输入项目描述',
          },
          {
            name: 'author',
            message: '请输入作者名称',
          },
        ])
        .then(answers => {
          // 开始下载
          const spinner = ora('正在下载模板...');
          spinner.start();

          // 项目类型
          let remoteUrl = pkg.template.default;
          if (
            process.argv.includes('-t') ||
            process.argv.includes('--typescript')
          ) {
            remoteUrl = pkg.template.typescript;
          }

          download(remoteUrl, name, { clone: true }, err => {
            if (err) {
              // 下载失败调用
              spinner.fail();
              console.log(symbols.error, chalk.red(err));
            } else {
              // 下载成功调用
              spinner.succeed();
              const meta = {
                name,
                description: answers.description,
                author: answers.author,
              };
              const fileName = `${name}/package.json`;
              if (fs.existsSync(fileName)) {
                const content = fs.readFileSync(fileName).toString();
                const json = JSON.parse(content);
                const result = { ...json, ...meta };
                fs.writeFileSync(fileName, JSON.stringify(result, null, 2));
              }
              console.log(symbols.success, chalk.green('项目初始化完成'));
            }
          });
        });
    } else {
      // 错误提示项目已存在，避免覆盖原有项目
      console.log(symbols.error, chalk.red('项目已存在'));
    }
  });

program.parse(process.argv);
