'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const date =  Date();
    return queryInterface.bulkInsert('ExamBoards', [
      { name: 'AQA', createdAt: date, updatedAt: date },
      { name: 'EDEXCEL', createdAt: date, updatedAt: date },
      { name: 'EDUQAS', createdAt: date, updatedAt: date },
      { name: 'CEA', createdAt: date, updatedAt: date },
      { name: 'OCR', createdAt: date, updatedAt: date },
      { name: 'WJEC', createdAt: date, updatedAt: date },
      { name: 'SQA', createdAt: date, updatedAt: date }
      ], {});
  },

  down: (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete('ExamBoards', {[Op.or]: [
        { name: 'AQA' },
        { name: 'EDEXCEL' },
        { name: 'EDUQAS' },
        { name: 'CEA' },
        { name: 'OCR' },
        { name: 'WJEC' },
        { name: 'SQA' }
      ]});
  }
};
