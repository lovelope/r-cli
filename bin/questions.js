const getQuestions = ({ hasName = false, hasType = false }) =>
  [
    !hasName && {
      type: 'input',
      name: 'name',
      message: '请输入项目名称',
      default: 'react-starter',
    },
    {
      type: 'input',
      name: 'description',
      message: '请输入项目描述',
      default: '项目描述',
    },
    {
      type: 'input',
      name: 'author',
      message: '请输入作者名称',
      default: 'lovelope <lovelope@qq.com>',
    },
    !hasType && {
      type: 'list',
      name: 'projectType',
      message: '请选择项目类型',
      choices: [
        {
          name: 'default with mobx',
          value: 'default',
          checked: true,
        },
        { name: 'typescript with mobx', value: 'ts' },
      ],
    },
  ].filter(Boolean);

module.exports = getQuestions;
