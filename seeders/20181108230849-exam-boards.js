'use strict';

const models = require('../models');

module.exports = {
  up: (queryInterface, Sequelize) => {
    const date =  Date();
    return queryInterface.bulkInsert('Qualifications', [
      { name: 'GCSE', createdAt: date, updatedAt: date },
      { name: 'GCE', createdAt: date, updatedAt: date },
      { name: 'National 5', createdAt: date, updatedAt: date },
      { name: 'Higher', createdAt: date, updatedAt: date },
      { name:'Advanced Higher', createdAt: date, updatedAt: date },
      { name: 'Nàiseanta 5', createdAt: date, updatedAt: date }
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
