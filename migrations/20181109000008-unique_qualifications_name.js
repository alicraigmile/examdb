'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint('Qualifications', ['name'], {
      type: 'unique',
      name: 'unique_qualification_name'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('Qualifications', 'unique_qualification_name');
  }
};
