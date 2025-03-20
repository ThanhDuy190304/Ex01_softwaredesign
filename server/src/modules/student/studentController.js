const { processFile } = require("../import/fileUploadService");
const StudentService = require("./studentService");
const { validationResult, body } = require("express-validator");

//// Validation rules trong controller
const StudentValidationRules = [
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("dateOfBirth")
    .isISO8601()
    .withMessage("Invalid date of birth (use YYYY-MM-DD)"),
  body("gender")
    .isIn(["Nam", "Nữ", "Khác"])
    .withMessage("Gender must be Nam, Nữ, or Khác"),
  body("facultyId").notEmpty().withMessage("Faculty ID is required"),
  body("courseId").notEmpty().withMessage("Course ID is required"),
  body("programId").notEmpty().withMessage("Program ID is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("phoneNumber")
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone number must be 10 digits"),
  body("status")
    .isIn(["Đang học", "Đã tốt nghiệp", "Đã thôi học", "Tạm dừng học"])
    .withMessage("Invalid status"),
];

async function deleteStudent(req, res) {
  try {
    const result = await StudentService.deleteStudent(req.params.studentId);
    if (result) {
      return res.status(400).json({ message: result });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function postStudent(req, res) {
  try {
    // Kiểm tra validation
    await Promise.all(StudentValidationRules.map((rule) => rule.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: "Dữ liệu không hợp lệ", details: errors.array() });
    }
    const result = await StudentService.createStudent(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json(result.student);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return { error: error.response.data.error };
    }
    return { error: "Lỗi server" };
  }
}

async function putStudent(req, res) {
  // Kiểm tra validation ngay trong controller
  await Promise.all(StudentValidationRules.map((rule) => rule.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const studentId = req.params.studentId;
    const updatedData = req.body;
    const result = await StudentService.updateStudent(studentId, updatedData);
    if (!result) {
      return res.status(404).json({ message: "Sinh viên không hợp lệ!" });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getStudents(req, res) {
  try {
    const { course, faculty, program, page, limit } = req.query;
    console.log({ course, faculty, program, page, limit });

    const result = await StudentService.getStudents({
      course,
      faculty,
      program: parseInt(program),
      page: parseInt(page),
      limit: parseInt(limit),
    });

    if (!result || result.students.length === 0) {
      return res.status(200).json({ students: [], total: 0 });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getStatuses(req, res) {
  try {
    const statuses = await StudentService.getStatuses();
    return res.status(200).json(statuses);
  } catch (error) {
    console.error("Error in getStatuses:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function searchStudents(req, res) {
  try {
    const { studentId, fullName, page, limit } = req.query;
    if (!studentId && !fullName) {
      return res
        .status(400)
        .json({ error: "studentId and fullName parameter is required" });
    }

    const result = await StudentService.searchStudents(
      studentId,
      fullName,
      page,
      limit
    );

    if (!result || result.students.length === 0) {
      return res.status(200).json({ students: [], total: 0 });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function importStudents(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const result = await processFile(req.file);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error processing file:", error);
    return res.status(500).json({ error: error.message });
  }
}
module.exports = {
  deleteStudent,
  postStudent,
  putStudent,
  getStudents,
  getStatuses,
  importStudents,
  searchStudents,
};
