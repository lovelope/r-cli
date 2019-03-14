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

module.exports = function init(program, cmd, name) {
  inquirer
    .prompt(
      // TODO: hasType 其它类型
      getQuestions({ hasName: Boolean(name), hasType: cmd.typescript })
    )
    .then(answers => {
      const projectType = cmd.typescript ? 'ts' : 'default';
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
          // 进入文件夹
          shelljs.cd(name);
          // 删除旧的 git 仓库
          shelljs.rm('-rf', '.git');

          // 初始化 git
          await git.init({ dir: './' });

          // 开始下载动画
          const installSpinner = ora('正在安装依赖...');
          installSpinner.start();
          // 执行 `npm i`
          if (shelljs.exec('npm i --loglevel=silent').code !== 0) {
            // 下载失败调用
            installSpinner.fail();
            console.log(symbols.error, chalk.red('项目依赖安装失败'));
            shelljs.exit(1);
          }
          installSpinner.succeed();
          console.log(symbols.success, chalk.green('项目依赖安装完成'));
          console.log(symbols.success, chalk.green('项目初始化完成'));
        })
        .catch(err => {
          // 下载失败调用
          spinner.fail();
          console.log(symbols.error, chalk.red(err));
        });
    });
};
