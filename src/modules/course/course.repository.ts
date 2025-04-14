import { PrismaClient, Course, Module, SubModule, Attachment, Enrollment } from '@prisma/client';
import { CreateCourseDto } from './course.types';

export class CourseRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createCourse(data: CreateCourseDto, instructorId: string): Promise<Course> {
    return this.prisma.course.create({
      data: {
        ...data,
        instructorId,
      },
    });
  }

  async findAllCourses() {
    return this.prisma.course.findMany({
      include: {
        _count: {
          select: {
            enrollments: true,
            modules: true,
          },
        },
      },
    });
  }

  async findCourseById(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: {
            subModules: {
              include: {
                attachments: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });
  }

  async createModule(
    courseId: string,
    data: { title: string; description?: string; order: number },
  ): Promise<Module> {
    return this.prisma.module.create({
      data: {
        ...data,
        courseId,
      },
    });
  }

  async createSubModule(
    moduleId: string,
    data: { title: string; content: string; order: number },
  ): Promise<SubModule> {
    return this.prisma.subModule.create({
      data: {
        ...data,
        moduleId,
      },
    });
  }

  async createAttachment(
    subModuleId: string,
    data: { title: string; fileUrl: string; fileType: string },
  ): Promise<Attachment> {
    return this.prisma.attachment.create({
      data: {
        ...data,
        subModuleId,
      },
    });
  }

  async createEnrollment(userId: string, courseId: string): Promise<Enrollment> {
    return this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });
  }

  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
    return !!enrollment;
  }
}

export const courseRepository = new CourseRepository();
