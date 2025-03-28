const sequelize = require("../../config/database");
const { DataTypes } = require("sequelize");

const Program = sequelize.define(
  "Program",
  {
    programId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    short_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "programs",
  }
);

module.exports = Program;
