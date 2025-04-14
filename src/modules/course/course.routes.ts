import express from 'express';
import multer from 'multer';
import { authenticateToken, authorizeRoles } from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/validateMiddleware';
import { courseController } from './course.controller';
import { createCourseSchema, courseIdParamSchema } from './course.schema';
import { Role } from '@prisma/client';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// Course routes
router.post(
  '/',
  authenticateToken,
  authorizeRoles(Role.instructor),
  upload.single('cover'),
  validateRequest({
    body: createCourseSchema,
  }),
  courseController.createCourse,
);

router.get('/', courseController.getAllCourses);

router.get(
  '/:id',
  validateRequest({
    params: courseIdParamSchema,
  }),
  courseController.getCourseById,
);

router.post(
  '/:id/enroll',
  authenticateToken,
  validateRequest({
    params: courseIdParamSchema,
  }),
  courseController.enrollInCourse,
);

// Module management routes
router.post(
  '/:id/modules',
  authenticateToken,
  authorizeRoles(Role.instructor),
  courseController.addModule,
);

router.post(
  '/modules/:moduleId/sub-modules',
  authenticateToken,
  authorizeRoles(Role.instructor),
  courseController.addSubModule,
);

router.post(
  '/sub-modules/:subModuleId/attachments',
  authenticateToken,
  authorizeRoles(Role.instructor),
  upload.single('file'),
  courseController.addAttachment,
);

export default router;
