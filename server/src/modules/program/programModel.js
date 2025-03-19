const sequelize = require("../../config/database");
const { DataTypes } = require("sequelize");

const Program = sequelize.define(
  "Program",
  {
    programId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    short_name: {
      type: DataTypes.STRING, // e.g., "CQ"
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING, // e.g., "Chính quy"
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "program",
  }
);

module.exports = Program;
