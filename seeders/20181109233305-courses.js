'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const date =  Date();

    return queryInterface.bulkInsert('Courses', [
      { id: 1, name: 'GCSE Mathematics AQA', programmeofstudyId: 1, examboardId: 1, createdAt: date, updatedAt: date },
      { id: 2, name: 'GCSE Mathematics EDEXCEL', programmeofstudyId: 1, examboardId: 2, createdAt: date, updatedAt: date }
    ], {});    
  },

  down: async (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete('Courses', {[Op.or]: [
      { id: 1 },
      { id: 2 }
      ]});
  }
};
