import { Course, Module, SubModule, Attachment, Prisma } from '@prisma/client';

export interface CreateCourseDto {
  title: string;
  description: string;
  price: number;
  coverUrl?: string;
}

export type CourseWithInstructor = Prisma.CourseGetPayload<{
  include: {
    modules: {
      include: {
        subModules: {
          include: {
            attachments: true;
          };
        };
      };
    };
    _count: {
      select: {
        enrollments: true;
      };
    };
  };
}> & {
  instructor: {
    id: string;
    name: string;
    email: string;
  };
};

export type CourseId = Course['id'];
export type ModuleId = Module['id'];
export type SubModuleId = SubModule['id'];
export type AttachmentId = Attachment['id'];

export type ModuleWithoutRelations = Prisma.ModuleGetPayload<{}>;
export type SubModuleWithoutRelations = Prisma.SubModuleGetPayload<{}>;
export type AttachmentWithoutRelations = Prisma.AttachmentGetPayload<{}>;

export interface CreateModuleDto {
  title: string;
  description?: string;
  order: number;
}

export interface CreateSubModuleDto {
  title: string;
  content: string;
  order: number;
}

export interface CreateAttachmentDto {
  title: string;
  fileUrl: string;
  fileType: string;
}

export type CourseWithCounts = Prisma.CourseGetPayload<{
  include: {
    _count: {
      select: {
        enrollments: true;
        modules: true;
      };
    };
  };
}>;

export type CourseWithCountsAndInstructor = CourseWithCounts & {
  instructor: {
    id: string;
    name: string;
    email: string;
  };
};
