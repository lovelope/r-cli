const fs = require('fs-extra');
const ora = require('ora');
const git = require('isomorphic-git');
const inquirer = require('inquirer');
const chalk = require('chalk');
const symbols = require('log-symbols');

const shelljs = require('shelljs');

const config = require('../config');
const getQuestions = require('./questions');

git.plugins.set('fs', fs);

const { remote: gitRemote, branch: gitBranchs } = config.git;

// eslint-disable-next-line no-unused-vars
function assert(v) {
  console.dir(v);
  process.exit();
}

module.exports = function init(program, name) {
  inquirer
    .prompt(
      // TODO: hasType 其它类型
      getQuestions({ hasName: Boolean(name), hasType: program.typescript })
    )
    .then(answers => {
      const projectType = program.typescript ? 'ts' : 'default';
      // 项目配置
      const meta = {
        name,
        ...answers,
      };

      // git仓库分支
      const branch = gitBranchs[projectType];

      // 开始下载动画
      const spinner = ora('正在下载模板...');
      spinner.start();
      git
        .clone({
          url: gitRemote, // git 仓库地址
          dir: name, // 目标文件夹
          ref: branch, // 分支名
          singleBranch: true, // 单分支克隆
          depth: 1, // 浅克隆
        })
        .then(async () => {
          // 下载成功调用
          spinner.succeed();
          const fileName = `${name}/package.json`;
          if (fs.pathExistsSync(fileName)) {
            const content = fs.readFileSync(fileName).toString();
            const json = JSON.parse(content);
            const result = { ...json, ...meta };
            fs.writeFileSync(fileName, JSON.stringify(result, null, 2));
          }
          shelljs.rm('-rf', `${name}/.git`);
          console.log(symbols.success, chalk.green('项目初始化完成'));
        })
        .catch(err => {
          // 下载失败调用
          spinner.fail();
          console.log(symbols.error, chalk.red(err));
        });
    });
};
