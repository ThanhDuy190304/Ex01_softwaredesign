// Mock the BaseService
jest.mock("../service/base.service", () => {
  return class {
    constructor() {
      this.model = {};
    }
    async delete() {
      return true;
    }
  };
});

// Mock models - Define mocks inside the factory function
jest.mock("../models/init-models", () => () => {
  return {
    Course: {
      findOne: jest.fn(),
      create: jest.fn(),
    },
    Faculty: {
      findOne: jest.fn(),
    },
    Class: {
      findOne: jest.fn(),
    },
  };
});

// Mock sequelize
jest.mock("../config/db", () => ({}));

const courseService = require("../service/course.service");
const {
  NotFoundError,
  ValidationError,
  DuplicateResourceError,
} = require("../util/errors");

describe("CourseService", () => {
  describe("CourseService.create", () => {
    let mockCourse;
    let origModel;

    beforeEach(() => {
      // Arrange
      mockCourse = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        credits: 3,
        facultyCode: "CNTT",
        description: "An introductory course to computer science",
        prerequisiteCourseCode: "MATH101",
        get: function (options) {
          if (options && options.plain) {
            return this;
          }
          return this;
        },
      };

      // Create mock models for testing
      origModel = courseService.model;
      courseService.model = {
        findOne: jest.fn(),
        create: jest.fn().mockResolvedValue(mockCourse),
      };

      // Mock the models object used in the service
      global.models = {
        Course: courseService.model,
        Faculty: {
          findOne: jest.fn(),
        },
        Class: {
          findOne: jest.fn(),
        },
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
      courseService.model = origModel;
    });

    test("When creating a course with missing required fields, then throw ValidationError", async () => {
      // Arrange - missing name
      const invalidCourseData = {
        courseCode: "CS101",
        credits: 3,
        facultyCode: "CNTT",
        description: "An introductory course to computer science",
        prerequisiteCourseCode: "MATH101",
      };

      // Act & Assert
      await expect(courseService.create(invalidCourseData)).rejects.toThrow(
        ValidationError
      );
    });

    test("When creating a course with credits less than 2, then throw ValidationError", async () => {
      // Arrange
      const invalidCourseData = {
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        credits: 1, // Invalid credits
        facultyCode: "CNTT",
        description: "An introductory course to computer science",
        prerequisiteCourseCode: "MATH101",
      };

      // Act & Assert
      await expect(courseService.create(invalidCourseData)).rejects.toThrow(
        ValidationError
      );
    });

    test("When creating a course with duplicate courseCode, then throw DuplicateResourceError", async () => {
      // Arrange
      const newCourseData = {
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        credits: 3,
        facultyCode: "CNTT",
        description: "An introductory course to computer science",
        prerequisiteCourseCode: "MATH101",
      };

      // Simulate existing course with same code
      courseService.model.findOne.mockResolvedValueOnce(mockCourse);

      // Act & Assert
      await expect(courseService.create(newCourseData)).rejects.toThrow(
        DuplicateResourceError
      );
    });

    test("When creating a course with non-existent facultyCode, then throw NotFoundError", async () => {
      // Arrange
      const newCourseData = {
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        credits: 3,
        facultyCode: "NON_EXISTENT",
        description: "An introductory course to computer science",
        prerequisiteCourseCode: "MATH101",
      };

      // No existing course with same code
      courseService.model.findOne.mockResolvedValueOnce(null);
      // No faculty exists with this code
      global.models.Faculty.findOne.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(courseService.create(newCourseData)).rejects.toThrow(
        NotFoundError
      );
    });

    test("When creating a course with non-existent prerequisiteCourseCode, then throw NotFoundError", async () => {
      // Arrange
      const newCourseData = {
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        credits: 3,
        facultyCode: "CNTT",
        description: "An introductory course to computer science",
        prerequisiteCourseCode: "NON_EXISTENT",
      };

      // No existing course with same code
      courseService.model.findOne.mockResolvedValueOnce(null);
      // Faculty exists
      global.models.Faculty.findOne.mockResolvedValueOnce({
        facultyCode: "CNTT",
      });
      // No prerequisite course exists with this code
      courseService.model.findOne.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(courseService.create(newCourseData)).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
