import express from 'express';
import multer from 'multer';
import { authenticateToken, authorizeRoles } from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/validateMiddleware';
import { courseController } from './course.controller';
import { createCourseSchema, courseIdParamSchema } from './course.schema';
import { Role } from '@prisma/client';
import { env } from '../../config/env';
import { AppError } from '../../model/errorModel';
import { StatusCodes } from 'http-status-codes';

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_FILE_SIZE,
    files: env.MAX_FILES_PER_REQUEST,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = env.ALLOWED_FILE_TYPES.split(',');

    if (!file.mimetype) {
      cb(new AppError('Invalid file type', StatusCodes.BAD_REQUEST));
      return;
    }

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          `Invalid file type. Allowed types are: ${allowedTypes.join(', ')}`,
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
  },
});

// Wrap multer middleware to handle errors
const handleFileUpload =
  (fieldName: string) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        next(new AppError(`File upload error: ${err.message}`, StatusCodes.BAD_REQUEST));
        return;
      } else if (err) {
        next(err);
        return;
      }
      next();
    });
  };

const router = express.Router();

// Course routes
router.post(
  '/',
  authenticateToken,
  authorizeRoles(Role.instructor),
  handleFileUpload('cover'),
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
  handleFileUpload('file'),
  courseController.addAttachment,
);

export default router;
