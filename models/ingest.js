'use strict';
module.exports = (sequelize, DataTypes) => {
  const Ingest = sequelize.define('Ingest', {
    name: DataTypes.STRING
  }, {});
  Ingest.associate = function(models) {
    // associations can be defined here
    Ingest.belongsTo(models.WebResource, {as: 'Source'});
    Ingest.belongsTo(models.User, {as: 'Initiator'});
  };
  return Ingest;
};