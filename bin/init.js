const fs = require('fs');
const ora = require('ora');
const download = require('download-git-repo');
const inquirer = require('inquirer');
const chalk = require('chalk');
const symbols = require('log-symbols');

const pkg = require('../package.json');

module.exports = function init(program, name) {
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
      if (program.typescript) {
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
};
