'use strict';
module.exports = (sequelize, DataTypes) => {
  const ExamBoard = sequelize.define('ExamBoard', {
    name: DataTypes.STRING,
    unique: true
  }, {});
  ExamBoard.associate = function(models) {
    // associations can be defined here
    ExamBoard.belongsTo(models.WebResource, {as: 'Homepage'});
  };
  return ExamBoard;
};