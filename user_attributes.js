module.exports = function(sequelize, DataTypes) {
    var UserAttributes = sequelize.define("UserAttributes", {
        is_admin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        freezeTableName: true
    });

    return UserAttributes;
};
