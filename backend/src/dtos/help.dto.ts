// src/dtos/help.dto.ts
import { 
    HelpRequestCategory, 
    HelpRequestPriority, 
    HelpRequestStatus,
    HelpRequestRefModel
  } from '../models/help.model';
  
  export interface CreateHelpRequestDto {
    userId: string;
    title: string;
    issue: string;
    category?: HelpRequestCategory;
    priority?: HelpRequestPriority;
    relatedTo?: string;
    onModel?: HelpRequestRefModel;
  }
  
  export interface UpdateHelpRequestDto {
    title?: string;
    issue?: string;
    category?: HelpRequestCategory;
    priority?: HelpRequestPriority;
    status?: HelpRequestStatus;
  }
  
  export interface CreateHelpResponseDto {
    responderId: string;
    message: string;
    attachments?: string[];
  }
  
  export interface HelpRequestsFilterDto {
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
  }
  
  export interface HelpResponseDto {
    id: string;
    responder: {
      id: string;
      username: string;
      email: string;
    };
    message: string;
    attachments: string[];
    createdAt: Date;
  }
  
  export interface HelpRequestDto {
    id: string;
    title: string;
    issue: string;
    category: string;
    priority: string;
    status: string;
    user: {
      id: string;
      username: string;
      email: string;
    };
    assignedTo?: {
      id: string;
      username: string;
      email: string;
    };
    responses: HelpResponseDto[];
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
  }