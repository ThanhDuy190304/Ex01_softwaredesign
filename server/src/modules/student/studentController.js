const { processFile } = require("../import/fileUploadService");
const StudentService = require("./studentService");
const { validationResult, body } = require("express-validator");
const logger = require('../../logger');

async function deleteStudent(req, res) {
  try {
    const result = await StudentService.deleteStudent(req.params.studentId);
    if (result) {
      return res.status(400).json({ message: result.message });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

async function postStudent(req, res) {
  try {
    const errors = await StudentService.checkStudentData(req);
    if (!errors.success) {
      return res.status(400).json({ error: errors.message, details: errors.data });
    }

    const result = await StudentService.createStudent(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json(result.student);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      return { error: error.response.data.error };
    }
    return res.status(500).json({error: error}) 
  }
}

async function putStudent(req, res) {
  try {
    const errors = await StudentService.checkStudentData(req);
    if (!errors.success) {
      return res.status(400).json({ errors: errors.data });
    }

    const studentId = req.params.studentId;
    const updatedData = req.body;
    const result = await StudentService.updateStudent(studentId, updatedData);
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }
    return res.status(200).json(result.data);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

async function getStudents(req, res) {
  try {
    const result = await StudentService.getStudents(req.query);
    if (!result || result.students.length === 0) {
      return res.status(200).json({ students: [], total: 0 });
    }
    return res.status(200).json(result.students, result.total);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

async function getStatuses(req, res) {
  try {
    const statuses = await StudentService.getStatuses();
    return res.status(200).json(statuses.data);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

async function importStudents(req, res) {
  try {

    logger.info('importStudents');
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const result = await processFile(req.file);
    console.log(result);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

async function putStatus(req, res) {
  try {
    const statusId = req.params.statusId;
    const updatedData = req.body;
    const result = await StudentService.updateStatus(statusId, updatedData);
    if (!result.data) {
      return res.status(404).json({ message: result.message });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

async function postStatus(req, res) {
  try {
    const result = await StudentService.createStatus(req.body);
    return res.status(201).json(result.status);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

async function exportStudents(req, res) {
  try {
    const students = await StudentService.getToExportStudents(req.query);
    return res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

module.exports = { deleteStudent, postStudent, putStudent, getStudents, getStatuses, putStatus, postStatus, importStudents, exportStudents };
