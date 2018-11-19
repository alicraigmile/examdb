const model = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            firstName: DataTypes.STRING,
            lastName: DataTypes.STRING
        },
        {}
    );
    return User;
};

export default model;
