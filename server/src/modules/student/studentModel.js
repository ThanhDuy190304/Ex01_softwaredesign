const { DataTypes, Op } = require("sequelize");
const sequelize = require("../../config/database");

const Faculty = require("../faculty/facultyModel");
const Course = require("../course/courseModel");
const Program = require("../program/programModel");
const NIDCard = require("./nidCardModel");
const OIDCard = require("./oidCardModel");
const Passport = require("./passportModel");
const Nationality = require("../nationality/nationalityModel");
const StudentStatus = require("./studentStatusModel");

const Student = sequelize.define(
  "Student",
  {
    studentId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM("Nam", "Nữ", "Khác"),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mailAddress: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    permanentAddress: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    temporaryResidenceAddress: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "students",
  }
);

// Relationships
Student.belongsTo(Faculty, { foreignKey: "facultyId" });
Student.belongsTo(Course, { foreignKey: "courseId" });
Student.belongsTo(Program, { foreignKey: "programId" });
Student.belongsTo(Nationality, { foreignKey: "nationalityId" });

Student.hasOne(OIDCard, { foreignKey: "studentId" });
Student.hasOne(NIDCard, { foreignKey: "studentId" });
Student.hasOne(Passport, { foreignKey: "studentId" });

Faculty.hasMany(Student, { foreignKey: "facultyId" });
Course.hasMany(Student, { foreignKey: "courseId" });
Program.hasMany(Student, { foreignKey: "programId" });
Nationality.hasMany(Student, { foreignKey: "nationalityId" });

Passport.belongsTo(Student, { foreignKey: "studentId" });
NIDCard.belongsTo(Student, { foreignKey: "studentId" });
OIDCard.belongsTo(Student, { foreignKey: "studentId" });

Student.belongsTo(StudentStatus, { foreignKey: "studentStatusId" });
StudentStatus.hasMany(Student, { foreignKey: "studentStatusId" });

// 🛠 Hook để tạo studentId dựa trên courseId
Student.beforeCreate(async (student, options) => {
  try {
    if (student.studentId) {
      return;
    }
    if (!student.courseId) {
      throw new Error("courseId is required to generate studentId");
    }
    const year = student.courseId.replace("K", "").slice(-2); // "K2021" -> "21"
    // Tìm studentId lớn nhất hiện tại trong cùng courseId
    const lastStudent = await Student.findOne({
      where: {
        studentId: { [Op.like]: `${year}%` }, // Chỉ lấy studentId bắt đầu với năm đó
      },
      order: [["studentId", "DESC"]], // Sắp xếp giảm dần để lấy số cao nhất
    });

    let newId;
    if (lastStudent) {
      newId = (parseInt(lastStudent.studentId) + 1).toString();
    } else {
      newId = `${year}00001`; // Nếu chưa có ai, bắt đầu từ 2100001
    }

    student.studentId = newId; // Gán ID mới cho sinh viên
  } catch (error) {
    console.error("Error in beforeCreate hook:", error);
    throw error; // Ném lỗi để ngăn việc tạo đối tượng
  }
});

module.exports = Student;
