import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../model/errorModel';
import { ServiceResponse } from '../../model/serviceResponse';
import { CourseRepository } from './course.repository';
import { uploadFile } from '../../config/cloudinary';
import {
  CourseId,
  CourseWithInstructor,
  CreateCourseDto,
  CreateModuleDto,
  CreateSubModuleDto,
  ModuleWithoutRelations,
  SubModuleWithoutRelations,
  AttachmentWithoutRelations,
  CourseWithCountsAndInstructor,
} from './course.types';
import { emailQueue } from '../../config/bull';
import { userServiceClient } from '../../config/apiClient';

interface UserResponse {
  data: {
    id: string;
    email: string;
    name: string;
  };
}

export class CourseService {
  private courseRepository: CourseRepository;

  constructor(repository: CourseRepository = new CourseRepository()) {
    this.courseRepository = repository;
  }

  async createCourse(
    data: CreateCourseDto,
    instructorId: string,
    coverImage?: Express.Multer.File,
  ): Promise<ServiceResponse<{ courseId: string }>> {
    let coverUrl: string | undefined;

    if (coverImage) {
      coverUrl = await uploadFile(coverImage, 'covers');
    }

    const course = await this.courseRepository.createCourse(
      {
        ...data,
        coverUrl,
      },
      instructorId,
    );

    return ServiceResponse.success(
      'Course created successfully',
      { courseId: course.id },
      StatusCodes.CREATED,
    );
  }

  async getAllCourses(): Promise<ServiceResponse<CourseWithCountsAndInstructor[]>> {
    const courses = await this.courseRepository.findAllCourses();

    try {
      const coursesWithInstructors = await Promise.all(
        courses.map(async (course) => {
          const response = await userServiceClient.get<UserResponse>(
            `/users/${course.instructorId}`,
          );
          const instructorData = response.data.data;

          return {
            ...course,
            instructor: {
              id: instructorData.id,
              name: instructorData.name,
              email: instructorData.email,
            },
          };
        }),
      );

      return ServiceResponse.success('Courses retrieved successfully', coursesWithInstructors);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch course information', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getCourseById(id: string): Promise<ServiceResponse<CourseWithInstructor>> {
    const course = await this.courseRepository.findCourseById(id);
    if (!course) {
      throw new AppError('Course not found', StatusCodes.NOT_FOUND);
    }

    try {
      // Fetch instructor data from user service
      const response = await userServiceClient.get<UserResponse>(`/users/${course.instructorId}`);
      const instructorData = response.data.data;

      return ServiceResponse.success('Course retrieved successfully', {
        ...course,
        instructor: {
          id: instructorData.id,
          name: instructorData.name,
          email: instructorData.email,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch course information', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async enrollInCourse(userId: string, courseId: string): Promise<ServiceResponse<CourseId>> {
    const course = await this.courseRepository.findCourseById(courseId);
    if (!course) {
      throw new AppError('Course not found', StatusCodes.NOT_FOUND);
    }

    const isAlreadyEnrolled = await this.courseRepository.isEnrolled(userId, courseId);
    if (isAlreadyEnrolled) {
      throw new AppError('Already enrolled in this course', StatusCodes.CONFLICT);
    }

    try {
      // Fetch user data from user service
      const response = await userServiceClient.get<UserResponse>(`/users/${userId}`);
      const userEmail = response.data.data.email;

      // Create enrollment
      await this.courseRepository.createEnrollment(userId, courseId);

      // Queue enrollment confirmation email
      await emailQueue.add('sendEnrollmentConfirmation', {
        email: userEmail,
        courseName: course.title,
      });

      return ServiceResponse.success('Successfully enrolled in course', course.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to process enrollment', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async addModule(
    courseId: string,
    data: CreateModuleDto,
  ): Promise<ServiceResponse<ModuleWithoutRelations>> {
    const course = await this.courseRepository.findCourseById(courseId);
    if (!course) {
      throw new AppError('Course not found', StatusCodes.NOT_FOUND);
    }

    const module = await this.courseRepository.createModule(courseId, data);
    return ServiceResponse.success('Module added successfully', module);
  }

  async addSubModule(
    moduleId: string,
    data: CreateSubModuleDto,
  ): Promise<ServiceResponse<SubModuleWithoutRelations>> {
    const subModule = await this.courseRepository.createSubModule(moduleId, data);
    return ServiceResponse.success('SubModule added successfully', subModule);
  }

  async addAttachment(
    subModuleId: string,
    title: string,
    file: Express.Multer.File,
  ): Promise<ServiceResponse<AttachmentWithoutRelations>> {
    const fileUrl = await uploadFile(file, 'attachments');
    const attachment = await this.courseRepository.createAttachment(subModuleId, {
      title,
      fileUrl,
      fileType: file.mimetype,
    });
    return ServiceResponse.success('Attachment added successfully', attachment);
  }
}

export const courseService = new CourseService();
