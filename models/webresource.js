const model = (sequelize, DataTypes) => {
    const WebResource = sequelize.define(
        'WebResource',
        {
            title: DataTypes.STRING,
            url: DataTypes.STRING
        },
        {}
    );
    return WebResource;
};

export default model;
