'use strict';


module.exports = {
  up: (queryInterface, Sequelize) => {
    const date =  Date();

    return queryInterface.bulkInsert('ProgrammeOfStudies', [
      { id: 1, name: 'GCSE Mathematics', qualificationId: 1, createdAt: date, updatedAt: date }, // 1#WebResource
      { id: 2, name: 'GCSE English Language', qualificationId: 1, createdAt: date, updatedAt: date },
      { id: 3, name: 'GCSE English Literature', qualificationId: 1, createdAt: date, updatedAt: date },
      { id: 4, name: 'GCE Mathematics', qualificationId: 2, createdAt: date, updatedAt: date },
      { id: 5, name: 'GCE English Language', qualificationId: 2, createdAt: date, updatedAt: date },
      { id: 6, name: 'GCSE Further Mathematics', qualificationId: 1, createdAt: date, updatedAt: date },
      { id: 7, name: 'GCSE History', qualificationId: 1, createdAt: date, updatedAt: date },
      { id: 8, name: 'GCSE Music', qualificationId: 1, createdAt: date, updatedAt: date },
      { id: 9, name: 'GCSE French', qualificationId: 1, createdAt: date, updatedAt: date },
      { id: 10, name: 'GCSE German', qualificationId: 1, createdAt: date, updatedAt: date },
      { id: 11, name: 'GCSE Home Economics', qualificationId: 1, createdAt: date, updatedAt: date }
      ], {});    
  },

  down: async (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete('ProgrammeOfStudies', {[Op.or]: [
      { name: 'Mathematics' },
      { name: 'English Language' },
      { name: 'English Literature' },
      { name: 'Mathematics' },
      { name: 'English Language' },
      { name: 'Further Mathematics' },
      { name: 'History' },
      { name: 'Music' },
      { name: 'French' },
      { name: 'German' },
      { name: 'Home Economics' }
      ]});
  }
};
