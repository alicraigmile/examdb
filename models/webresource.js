'use strict';
module.exports = (sequelize, DataTypes) => {
  const WebResource = sequelize.define('WebResource', {
    title: DataTypes.STRING,
    url: DataTypes.STRING
  }, {});
  WebResource.associate = function(models) {
    // associations can be defined here
  };
  return WebResource;
};