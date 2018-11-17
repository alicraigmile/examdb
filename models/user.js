const model = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            firstName: DataTypes.STRING,
            lastName: DataTypes.STRING
        },
        {}
    );
    User.associate = function(models) {
        // associations can be defined here
    };
    return User;
};

export default model;
