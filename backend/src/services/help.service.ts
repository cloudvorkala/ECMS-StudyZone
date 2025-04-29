// src/services/help.service.ts

import mongoose from 'mongoose';

import HelpRequest, { 
    IHelpRequestDocument, 
    HelpRequestStatus,
    IHelpResponseDocument
  } from '../models/help.model';
  import User, { UserRole } from '../models/user.model';
  import { 
    CreateHelpRequestDto, 
    CreateHelpResponseDto,
    UpdateHelpRequestDto,
    HelpRequestsFilterDto
  } from '../dtos/help.dto' 
  import notificationService from './notification.service';
  
  export class HelpService {
    /**
     * Create a new help request
     */
    async createHelpRequest(requestData: CreateHelpRequestDto): Promise<IHelpRequestDocument> {
      // Create help request
      const helpRequest = new HelpRequest({
        user: requestData.userId,
        title: requestData.title,
        issue: requestData.issue,
        category: requestData.category,
        priority: requestData.priority,
        status: HelpRequestStatus.OPEN,
        relatedTo: requestData.relatedTo || null,
        onModel: requestData.onModel || null
      });
      
      await helpRequest.save();
      
      // Find available support staff - in a real app, implement logic to pick the most appropriate person
      const supportStaff = await User.findOne({ roles: UserRole.SUPPORT });
      
      if (supportStaff) {
        // Notify support staff
        await notificationService.createNotification({
          userId: supportStaff.id, // Already a string, no need for toString()
          message: `New help request: ${requestData.title}`,
          title: 'New Support Request',
          action: 'View Request',
          actionUrl: `/admin/help/${helpRequest._id}`
        });
      }
      
      return helpRequest;
    }
    
    /**
     * Get help request by ID
     */
    async getHelpRequestById(requestId: string): Promise<IHelpRequestDocument | null> {
      return HelpRequest.findById(requestId)
        .populate('user', 'username email')
        .populate('assignedTo', 'username email')
        .populate('responses.responder', 'username email');
    }
    
    /**
     * Get all help requests for a user
     */
    async getUserHelpRequests(
      userId: string,
      status?: string,
      page: number = 1,
      limit: number = 10
    ): Promise<{
      requests: IHelpRequestDocument[];
      total: number;
      totalPages: number;
      currentPage: number;
    }> {
      const query: any = { user: userId };
      
      if (status) {
        query.status = status;
      }
      
      const skip = (page - 1) * limit;
      
      const [requests, total] = await Promise.all([
        HelpRequest.find(query)
          .populate('assignedTo', 'username email')
          .sort({ updatedAt: -1, priority: -1 })
          .skip(skip)
          .limit(limit),
        HelpRequest.countDocuments(query)
      ]);
      
      return {
        requests,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      };
    }
    
    /**
     * Update help request
     */
    async updateHelpRequest(
      requestId: string,
      updateData: UpdateHelpRequestDto
    ): Promise<IHelpRequestDocument | null> {
      const helpRequest = await HelpRequest.findById(requestId);
      
      if (!helpRequest) {
        return null;
      }
      
      // Update fields if provided
      if (updateData.title !== undefined) helpRequest.title = updateData.title;
      if (updateData.issue !== undefined) helpRequest.issue = updateData.issue;
      if (updateData.category !== undefined) helpRequest.category = updateData.category;
      if (updateData.priority !== undefined) helpRequest.priority = updateData.priority;
      if (updateData.status !== undefined) {
        helpRequest.status = updateData.status;
        
        // If status is resolved or closed, set resolvedAt date
        if (updateData.status === HelpRequestStatus.RESOLVED || 
            updateData.status === HelpRequestStatus.CLOSED) {
          helpRequest.resolvedAt = new Date();
        }
      }
      
      await helpRequest.save();
      
      // Send notification to user about status update if status changed
      if (updateData.status) {
        await notificationService.createNotification({
          userId: helpRequest.user.toString(),
          message: `Your help request "${helpRequest.title}" status changed to ${updateData.status}`,
          title: 'Help Request Update',
          action: 'View Request',
          actionUrl: `/help/${helpRequest._id}`
        });
      }
      
      return helpRequest;
    }
    
    /**
     * Add response to help request
     */
    async addResponseToHelpRequest(
      requestId: string,
      responseData: CreateHelpResponseDto
    ): Promise<IHelpResponseDocument | null> {
      const helpRequest = await HelpRequest.findById(requestId);
      
      if (!helpRequest) {
        return null;
      }
      
      // Create response
      const response = {
        responder: responseData.responderId,
        message: responseData.message,
        attachments: responseData.attachments || [],
        createdAt: new Date(),
        updatedAt: new Date()
      } as unknown as IHelpResponseDocument;
      
      // Add response to help request
      helpRequest.responses.push(response);
      
      // If help request is open and responder is support/admin, change status to in_progress
      const responder = await User.findById(responseData.responderId);
      const isSupport = responder?.roles.includes(UserRole.SUPPORT) || responder?.roles.includes(UserRole.ADMIN);
      
      if (helpRequest.status === HelpRequestStatus.OPEN && isSupport) {
        helpRequest.status = HelpRequestStatus.IN_PROGRESS;
        
        // If not assigned yet, assign to this responder
        if (!helpRequest.assignedTo && isSupport) {
          helpRequest.assignedTo = new mongoose.Types.ObjectId(responseData.responderId);
        }
      }
      
      await helpRequest.save();
      
      // Send notification to user if they didn't create this response
      if (helpRequest.user.toString() !== responseData.responderId) {
        await notificationService.createNotification({
          userId: helpRequest.user.toString(),
          message: `New response to your help request "${helpRequest.title}"`,
          title: 'Help Request Response',
          action: 'View Request',
          actionUrl: `/help/${helpRequest._id}`
        });
      }
      
      // If responder is not the assignee or user, notify assignee if exists
      if (helpRequest.assignedTo && 
          helpRequest.assignedTo.toString() !== responseData.responderId &&
          helpRequest.user.toString() !== helpRequest.assignedTo.toString()) {
        await notificationService.createNotification({
          userId: helpRequest.assignedTo.toString(),
          message: `New response on help request "${helpRequest.title}" you're assigned to`,
          title: 'Help Request Update',
          action: 'View Request',
          actionUrl: `/admin/help/${helpRequest._id}`
        });
      }
      
      return helpRequest.responses[helpRequest.responses.length - 1];
    }
    
    /**
     * Get all help requests (admin/support)
     */
    async getAllHelpRequests(
      filters: HelpRequestsFilterDto
    ): Promise<{
      requests: IHelpRequestDocument[];
      total: number;
      totalPages: number;
      currentPage: number;
    }> {
      const { status, priority, category, assignedTo, page = 1, limit = 10 } = filters;
      
      // Build query based on filters
      const query: any = {};
      
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (category) query.category = category;
      if (assignedTo) query.assignedTo = assignedTo;
      
      const skip = (page - 1) * limit;
      
      const [requests, total] = await Promise.all([
        HelpRequest.find(query)
          .populate('user', 'username email')
          .populate('assignedTo', 'username email')
          .sort({ status: 1, priority: -1, updatedAt: -1 })
          .skip(skip)
          .limit(limit),
        HelpRequest.countDocuments(query)
      ]);
      
      return {
        requests,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      };
    }
    
    /**
     * Assign help request to support staff
     */
    async assignHelpRequest(
      requestId: string,
      assignToId: string
    ): Promise<IHelpRequestDocument | null> {
      const helpRequest = await HelpRequest.findById(requestId);
      
      if (!helpRequest) {
        return null;
      }
      
      // Verify assignee is support or admin
      const assignee = await User.findById(assignToId);
      if (!assignee || 
          (!assignee.roles.includes(UserRole.SUPPORT) && 
           !assignee.roles.includes(UserRole.ADMIN))) {
        throw new Error('Assignee must be a support staff or admin');
      }
      
      // Update assignee
      helpRequest.assignedTo = new mongoose.Types.ObjectId(assignToId);
      
      // If status is open, change to in_progress
      if (helpRequest.status === HelpRequestStatus.OPEN) {
        helpRequest.status = HelpRequestStatus.IN_PROGRESS;
      }
      
      await helpRequest.save();
      
      // Notify assignee
      await notificationService.createNotification({
        userId: assignToId,
        message: `You have been assigned to help request: "${helpRequest.title}"`,
        title: 'New Assignment',
        action: 'View Request',
        actionUrl: `/admin/help/${helpRequest._id}`
      });
      
      // Notify user
      await notificationService.createNotification({
        userId: helpRequest.user.toString(),
        message: `Your help request "${helpRequest.title}" has been assigned to a support agent`,
        title: 'Help Request Update',
        action: 'View Request',
        actionUrl: `/help/${helpRequest._id}`
      });
      
      return helpRequest;
    }
    
    /**
     * Get summary statistics of help requests
     */
    async getHelpRequestStats(): Promise<{
      totalOpen: number;
      totalInProgress: number;
      totalResolved: number;
      totalClosed: number;
      totalUrgent: number;
      avgResolutionTimeHours: number;
    }> {
      const [
        totalOpen,
        totalInProgress,
        totalResolved,
        totalClosed,
        totalUrgent
      ] = await Promise.all([
        HelpRequest.countDocuments({ status: HelpRequestStatus.OPEN }),
        HelpRequest.countDocuments({ status: HelpRequestStatus.IN_PROGRESS }),
        HelpRequest.countDocuments({ status: HelpRequestStatus.RESOLVED }),
        HelpRequest.countDocuments({ status: HelpRequestStatus.CLOSED }),
        HelpRequest.countDocuments({ priority: 'urgent' })
      ]);
      
      // Calculate average resolution time for resolved/closed requests
      const resolvedRequests = await HelpRequest.find({
        status: { $in: [HelpRequestStatus.RESOLVED, HelpRequestStatus.CLOSED] },
        resolvedAt: { $ne: null }
      });
      
      let totalResolutionTimeMs = 0;
      
      resolvedRequests.forEach(request => {
        if (request.resolvedAt) {
          const resolutionTime = request.resolvedAt.getTime() - request.createdAt.getTime();
          totalResolutionTimeMs += resolutionTime;
        }
      });
      
      const avgResolutionTimeHours = resolvedRequests.length > 0
        ? (totalResolutionTimeMs / resolvedRequests.length) / (1000 * 60 * 60) // Convert ms to hours
        : 0;
      
      return {
        totalOpen,
        totalInProgress,
        totalResolved,
        totalClosed,
        totalUrgent,
        avgResolutionTimeHours
      };
    }
  }
  
  export default new HelpService();