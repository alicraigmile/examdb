const model = (sequelize, DataTypes) => {
    const WebResource = sequelize.define(
        'WebResource',
        {
            title: DataTypes.STRING,
            url: DataTypes.STRING
        },
        {}
    );
    WebResource.associate = models => {
        const { Course, Dataset } = models;
        WebResource.belongsTo(Dataset);
        WebResource.belongsToMany(Course, { through: 'CourseWebResource' });
    };
    return WebResource;
};

export default model;
