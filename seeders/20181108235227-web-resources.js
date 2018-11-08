'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const date =  Date();
    return queryInterface.bulkInsert('WebResources', [
      { title: 'GCSE Maths | BBC Bitesize', url: 'http://www.bbc.co.uk/bitesize/subjects/z38pycw', createdAt: date, updatedAt: date },
      { title: 'Maths, GCSE AQA | BBC Bitesize', url: 'http://www.bbc.co.uk/bitesize/subjects/z8sg6fr', createdAt: date, updatedAt: date }
      ], {});
  },

  down: (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete('WebResources', {[Op.or]: [
        { title: 'GCSE Maths | BBC Bitesize' },
        { title: 'Maths, GCSE AQA | BBC Bitesize' }
      ]});
  }
};
