// src/controllers/help.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import helpService from '../services/help.service';
import { 
  CreateHelpRequestDto, 
  CreateHelpResponseDto,
  UpdateHelpRequestDto 
} from '../dtos/help.dto';
import { errorHandler } from '../utils/errorHandler';
import { UserRole } from '../models/user.model';

export class HelpController {
  /**
   * Create help request
   * @route POST /api/help
   * @access Private
   */
  async createHelpRequest(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const requestData: CreateHelpRequestDto = {
        ...req.body,
        userId
      };
      
      const helpRequest = await helpService.createHelpRequest(requestData);
      
      res.status(201).json({
        message: 'Help request created successfully',
        helpRequest
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Get all help requests for current user
   * @route GET /api/help
   * @access Private
   */
  async getUserHelpRequests(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const { status, page = 1, limit = 10 } = req.query;
      
      const helpRequests = await helpService.getUserHelpRequests(
        userId, 
        status as string, 
        parseInt(page as string),
        parseInt(limit as string)
      );
      
      res.status(200).json(helpRequests);
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Get help request by ID
   * @route GET /api/help/:id
   * @access Private
   */
  async getHelpRequestById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const requestId = req.params.id;
      
      const helpRequest = await helpService.getHelpRequestById(requestId);
      
      if (!helpRequest) {
        res.status(404).json({ message: 'Help request not found' });
        return;
      }
      
      // Check if user has permission to view this request
      const isOwner = helpRequest.user.toString() === userId;
      const isAdmin = req.user.roles.includes(UserRole.ADMIN);
      const isSupport = req.user.roles.includes(UserRole.SUPPORT);
      const isAssigned = helpRequest.assignedTo?.toString() === userId;
      
      if (!isOwner && !isAdmin && !isSupport && !isAssigned) {
        res.status(403).json({ message: 'Permission denied' });
        return;
      }
      
      res.status(200).json({ helpRequest });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Update help request status
   * @route PUT /api/help/:id
   * @access Private (Admin, Support, or Owner)
   */
  async updateHelpRequest(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const requestId = req.params.id;
      const updateData: UpdateHelpRequestDto = req.body;
      
      // Get the help request
      const helpRequest = await helpService.getHelpRequestById(requestId);
      
      if (!helpRequest) {
        res.status(404).json({ message: 'Help request not found' });
        return;
      }
      
      // Check permissions
      const isOwner = helpRequest.user.toString() === userId;
      const isAdmin = req.user.roles.includes(UserRole.ADMIN);
      const isSupport = req.user.roles.includes(UserRole.SUPPORT);
      const isAssigned = helpRequest.assignedTo?.toString() === userId;
      
      // Different permission levels for different updates
      if (updateData.status) {
        // Only admin, support, or assigned can change status
        if (!isAdmin && !isSupport && !isAssigned) {
          res.status(403).json({ message: 'Permission denied to update status' });
          return;
        }
      } else {
        // For other updates, must be owner, admin, or support
        if (!isOwner && !isAdmin && !isSupport) {
          res.status(403).json({ message: 'Permission denied to update request' });
          return;
        }
      }
      
      const updatedRequest = await helpService.updateHelpRequest(requestId, updateData);
      
      res.status(200).json({
        message: 'Help request updated successfully',
        helpRequest: updatedRequest
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Add response to help request
   * @route POST /api/help/:id/responses
   * @access Private (Admin, Support, Owner)
   */
  async addResponse(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const requestId = req.params.id;
      
      // Get the help request
      const helpRequest = await helpService.getHelpRequestById(requestId);
      
      if (!helpRequest) {
        res.status(404).json({ message: 'Help request not found' });
        return;
      }
      
      // Check permissions
      const isOwner = helpRequest.user.toString() === userId;
      const isAdmin = req.user.roles.includes(UserRole.ADMIN);
      const isSupport = req.user.roles.includes(UserRole.SUPPORT);
      const isAssigned = helpRequest.assignedTo?.toString() === userId;
      
      if (!isOwner && !isAdmin && !isSupport && !isAssigned) {
        res.status(403).json({ message: 'Permission denied to add response' });
        return;
      }
      
      const responseData: CreateHelpResponseDto = {
        message: req.body.message,
        responderId: userId,
        attachments: req.body.attachments || []
      };
      
      const response = await helpService.addResponseToHelpRequest(requestId, responseData);
      
      res.status(201).json({
        message: 'Response added successfully',
        response
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Get all help requests (Admin/Support only)
   * @route GET /api/help/admin/all
   * @access Private (Admin, Support)
   */
  async getAllHelpRequests(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      // Check permissions
      const isAdmin = req.user.roles.includes(UserRole.ADMIN);
      const isSupport = req.user.roles.includes(UserRole.SUPPORT);
      
      if (!isAdmin && !isSupport) {
        res.status(403).json({ message: 'Permission denied' });
        return;
      }
      
      const { 
        status, 
        priority,
        category,
        assignedTo,
        page = 1, 
        limit = 10 
      } = req.query;
      
      const helpRequests = await helpService.getAllHelpRequests({
        status: status as string,
        priority: priority as string,
        category: category as string,
        assignedTo: assignedTo as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
      
      res.status(200).json(helpRequests);
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Assign help request to support staff
   * @route PUT /api/help/:id/assign
   * @access Private (Admin, Support)
   */
  async assignHelpRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      // Check permissions
      const isAdmin = req.user.roles.includes(UserRole.ADMIN);
      const isSupport = req.user.roles.includes(UserRole.SUPPORT);
      
      if (!isAdmin && !isSupport) {
        res.status(403).json({ message: 'Permission denied' });
        return;
      }
      
      const requestId = req.params.id;
      const { assignToId } = req.body;
      
      const assignedRequest = await helpService.assignHelpRequest(requestId, assignToId);
      
      if (!assignedRequest) {
        res.status(404).json({ message: 'Help request not found' });
        return;
      }
      
      res.status(200).json({
        message: 'Help request assigned successfully',
        helpRequest: assignedRequest
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }
}

export default new HelpController();