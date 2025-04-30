// src/routes/help.routes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import helpController from '../controllers/help.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';
import { HelpRequestCategory, HelpRequestPriority, HelpRequestStatus } from '../models/help.model';

const router = Router();

// All help routes require authentication
router.use(authMiddleware);

// Create help request
router.post(
  '/',
  [
    body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('issue').trim().isLength({ min: 10 }).withMessage('Issue description must be at least 10 characters'),
    body('category').optional().isIn(Object.values(HelpRequestCategory)).withMessage('Invalid category'),
    body('priority').optional().isIn(Object.values(HelpRequestPriority)).withMessage('Invalid priority')
  ],
  helpController.createHelpRequest.bind(helpController)
);

// Get all help requests for current user
router.get(
  '/',
  helpController.getUserHelpRequests.bind(helpController)
);

// Get help request by ID
router.get(
  '/:id',
  helpController.getHelpRequestById.bind(helpController)
);

// Update help request
router.put(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('issue').optional().trim().isLength({ min: 10 }).withMessage('Issue description must be at least 10 characters'),
    body('category').optional().isIn(Object.values(HelpRequestCategory)).withMessage('Invalid category'),
    body('priority').optional().isIn(Object.values(HelpRequestPriority)).withMessage('Invalid priority'),
    body('status').optional().isIn(Object.values(HelpRequestStatus)).withMessage('Invalid status')
  ],
  helpController.updateHelpRequest.bind(helpController)
);

// Add response to help request
router.post(
  '/:id/responses',
  [
    body('message').trim().isLength({ min: 1 }).withMessage('Response message is required'),
    body('attachments').optional().isArray().withMessage('Attachments must be an array')
  ],
  helpController.addResponse.bind(helpController)
);

// Admin/Support routes
// Get all help requests (admin/support only)
router.get(
  '/admin/all',
  roleMiddleware([UserRole.ADMIN, UserRole.SUPPORT]),
  helpController.getAllHelpRequests.bind(helpController)
);

// Assign help request to support staff
router.put(
  '/:id/assign',
  roleMiddleware([UserRole.ADMIN, UserRole.SUPPORT]),
  [
    body('assignToId').isMongoId().withMessage('Valid assignee ID is required')
  ],
  helpController.assignHelpRequest.bind(helpController)
);

export default router;