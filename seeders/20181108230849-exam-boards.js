'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const date = Date();
    return queryInterface.bulkInsert('ExamBoards', [
      { id: 1, name: 'AQA', createdAt: date, updatedAt: date },
      { id: 2, name: 'EDEXCEL', createdAt: date, updatedAt: date },
      { id: 3, name: 'EDUQAS', createdAt: date, updatedAt: date },
      { id: 4, name: 'CEA', createdAt: date, updatedAt: date },
      { id: 5, name: 'OCR', createdAt: date, updatedAt: date },
      { id: 6, name: 'WJEC', createdAt: date, updatedAt: date },
      { id: 7, name: 'SQA', createdAt: date, updatedAt: date }
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
