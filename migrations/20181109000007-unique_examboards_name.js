'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {    
    return queryInterface.addConstraint('ExamBoards', ['name'], {
      type: 'unique',
      name: 'unique_examboard_name'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('ExamBoards', 'unique_examboard_name');
  }
};
