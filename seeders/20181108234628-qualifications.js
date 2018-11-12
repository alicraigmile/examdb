'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const date =  Date();
    return queryInterface.bulkInsert('Qualifications', [
      { id: 1, name: 'GCSE', createdAt: date, updatedAt: date },
      { id: 2, name: 'GCE', createdAt: date, updatedAt: date },
      { id: 3, name: 'National 5', createdAt: date, updatedAt: date },
      { id: 4, name: 'Higher', createdAt: date, updatedAt: date },
      { id: 5, name:'Advanced Higher', createdAt: date, updatedAt: date },
      { id: 6, name: 'Nàiseanta 5', createdAt: date, updatedAt: date }
      ], {});
  },

  down: (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete('Qualifications', {[Op.or]: [
        { name: 'GCSE' },
        { name: 'GCE' },
        { name: 'National 5' },
        { name: 'Higher' },
        { name:'Advanced Higher' },
        { name: 'Nàiseanta 5' }
      ]});
  }
};
