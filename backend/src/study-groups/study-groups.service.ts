import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema, Types } from 'mongoose';
import { StudyGroup } from './schemas/study-group.schema';
import { CreateStudyGroupDto } from './dto/create-study-group.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class StudyGroupsService {
  constructor(
    @InjectModel(StudyGroup.name) private studyGroupModel: Model<StudyGroup>,
    private usersService: UsersService,
  ) {}

  async create(mentorId: string, createStudyGroupDto: CreateStudyGroupDto): Promise<StudyGroup> {
    try {
      console.log('Creating study group:', {
        mentorId,
        createStudyGroupDto
      });

      // Verify all student IDs exist and are students
      const students = await Promise.all(
        createStudyGroupDto.studentIds.map(async (studentId) => {
          const student = await this.usersService.findById(studentId);
          if (!student) {
            console.error('Student not found:', studentId);
            throw new NotFoundException(`User with ID ${studentId} not found`);
          }
          if (student.role !== UserRole.STUDENT) {
            console.error('User is not a student:', {
              userId: studentId,
              role: student.role
            });
            throw new BadRequestException(`User ${studentId} is not a student`);
          }
          return studentId;
        })
      );

      // Use create instead of new for compatibility with mocks and Mongoose
      const studyGroup = await this.studyGroupModel.create({
        ...createStudyGroupDto,
        mentor: mentorId,
        students,
        pendingStudents: [],
      });

      console.log('Study group created:', {
        id: studyGroup._id,
        name: studyGroup.name,
        mentor: studyGroup.mentor,
        students: studyGroup.students
      });

      // Populate the students field before returning
      const populatedGroup = await this.studyGroupModel
        .findById(studyGroup._id)
        .populate({
          path: 'students',
          select: 'fullName email studentId'
        })
        .populate({
          path: 'mentor',
          select: 'fullName email'
        })
        .exec();

      if (!populatedGroup) {
        console.error('Study group not found after creation:', studyGroup._id);
        throw new NotFoundException(`Study group with ID ${studyGroup._id} not found after creation`);
      }

      return populatedGroup;
    } catch (error) {
      console.error('Error in create:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create study group');
    }
  }

  async findAll(): Promise<StudyGroup[]> {
    return this.studyGroupModel.find().populate('mentor students').exec();
  }

  async findByMentor(mentorId: string): Promise<StudyGroup[]> {
    return this.studyGroupModel
      .find({ mentor: mentorId })
      .populate({
        path: 'mentor',
        select: 'fullName email'
      })
      .populate({
        path: 'students',
        select: 'fullName email studentId'
      })
      .exec();
  }

  async findByStudent(studentId: string): Promise<StudyGroup[]> {
    return this.studyGroupModel
      .find({ students: studentId })
      .populate({
        path: 'mentor',
        select: 'fullName email'
      })
      .populate({
        path: 'students',
        select: 'fullName email studentId'
      })
      .exec();
  }

  async findOne(id: string): Promise<StudyGroup> {
    const studyGroup = await this.studyGroupModel.findById(id).populate('mentor students').exec();
    if (!studyGroup) {
      throw new NotFoundException(`Study group with ID ${id} not found`);
    }
    return studyGroup;
  }

  async removeStudent(groupId: string, mentorId: string, studentId: string): Promise<StudyGroup> {
    try {
      console.log('Removing student:', {
        groupId,
        mentorId,
        studentId
      });

      const studyGroup = await this.studyGroupModel.findById(groupId);
      if (!studyGroup) {
        console.error('Study group not found:', groupId);
        throw new NotFoundException(`Study group with ID ${groupId} not found`);
      }

      console.log('Study group found:', {
        id: studyGroup._id,
        mentor: studyGroup.mentor,
        mentorId: mentorId,
        mentorMatch: studyGroup.mentor.toString() === mentorId,
        mentorType: typeof studyGroup.mentor,
        mentorIdType: typeof mentorId
      });

      // Convert both to strings for comparison
      const groupMentorId = studyGroup.mentor.toString();
      const requestMentorId = mentorId.toString();

      console.log('Mentor comparison:', {
        groupMentorId,
        requestMentorId,
        areEqual: groupMentorId === requestMentorId
      });

      if (groupMentorId !== requestMentorId) {
        console.error('Mentor mismatch:', {
          groupMentor: groupMentorId,
          requestMentor: requestMentorId
        });
        throw new BadRequestException('Only the mentor can remove students');
      }

      // Check if student is in the group
      const isStudentInGroup = studyGroup.students.some(s => s.toString() === studentId);
      if (!isStudentInGroup) {
        console.error('Student not in group:', {
          studentId,
          groupId
        });
        throw new BadRequestException('Student is not in the group');
      }

      // Remove student from the group
      studyGroup.students = studyGroup.students.filter(
        (student) => student.toString() !== studentId
      );

      const updatedGroup = await studyGroup.save();

      // Populate the students field before returning
      const populatedGroup = await this.studyGroupModel
        .findById(updatedGroup._id)
        .populate({
          path: 'students',
          select: 'fullName email studentId'
        })
        .populate({
          path: 'mentor',
          select: 'fullName email'
        })
        .exec();

      if (!populatedGroup) {
        console.error('Study group not found after update:', updatedGroup._id);
        throw new NotFoundException(`Study group with ID ${groupId} not found after update`);
      }

      console.log('Student removed successfully:', {
        groupId,
        studentId,
        updatedGroup: populatedGroup
      });

      return populatedGroup;
    } catch (error) {
      console.error('Error in removeStudent:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to remove student from the group');
    }
  }

  async addStudent(groupId: string, mentorId: string, studentId: string): Promise<StudyGroup> {
    try {
      console.log('Adding student:', {
        groupId,
        mentorId,
        studentId
      });

      const studyGroup = await this.studyGroupModel.findById(groupId);
      if (!studyGroup) {
        console.error('Study group not found:', groupId);
        throw new NotFoundException(`Study group with ID ${groupId} not found`);
      }

      console.log('Study group found:', {
        id: studyGroup._id,
        mentor: studyGroup.mentor,
        mentorId: mentorId,
        mentorMatch: studyGroup.mentor.toString() === mentorId,
        mentorType: typeof studyGroup.mentor,
        mentorIdType: typeof mentorId
      });

      // Convert both to strings for comparison
      const groupMentorId = studyGroup.mentor.toString();
      const requestMentorId = mentorId.toString();

      console.log('Mentor comparison:', {
        groupMentorId,
        requestMentorId,
        areEqual: groupMentorId === requestMentorId
      });

      if (groupMentorId !== requestMentorId) {
        console.error('Mentor mismatch:', {
          groupMentor: groupMentorId,
          requestMentor: requestMentorId
        });
        throw new BadRequestException('Only the mentor can add students');
      }

      const student = await this.usersService.findById(studentId);
      if (!student) {
        console.error('Student not found:', studentId);
        throw new NotFoundException(`User with ID ${studentId} not found`);
      }
      if (student.role !== UserRole.STUDENT) {
        console.error('User is not a student:', {
          userId: studentId,
          role: student.role
        });
        throw new BadRequestException(`User ${studentId} is not a student`);
      }

      // Check if student is already in the group
      const isStudentInGroup = studyGroup.students.some(s => s.toString() === studentId);
      if (isStudentInGroup) {
        console.error('Student already in group:', {
          studentId,
          groupId
        });
        throw new BadRequestException('Student is already in the group');
      }

      // Add student to the group
      studyGroup.students.push(studentId as any);
      const updatedGroup = await studyGroup.save();

      // Populate the students field before returning
      const populatedGroup = await this.studyGroupModel
        .findById(updatedGroup._id)
        .populate({
          path: 'students',
          select: 'fullName email studentId'
        })
        .populate({
          path: 'mentor',
          select: 'fullName email'
        })
        .exec();

      if (!populatedGroup) {
        console.error('Study group not found after update:', updatedGroup._id);
        throw new NotFoundException(`Study group with ID ${groupId} not found after update`);
      }

      console.log('Student added successfully:', {
        groupId,
        studentId,
        updatedGroup: populatedGroup
      });

      return populatedGroup;
    } catch (error) {
      console.error('Error in addStudent:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to add student to the group');
    }
  }

  async delete(groupId: string, mentorId: string): Promise<void> {
    try {
      console.log('Deleting study group:', {
        groupId,
        mentorId
      });

      const studyGroup = await this.studyGroupModel.findById(groupId);
      if (!studyGroup) {
        console.error('Study group not found:', groupId);
        throw new NotFoundException(`Study group with ID ${groupId} not found`);
      }

      console.log('Study group found:', {
        id: studyGroup._id,
        mentor: studyGroup.mentor,
        mentorId: mentorId,
        mentorMatch: studyGroup.mentor.toString() === mentorId,
        mentorType: typeof studyGroup.mentor,
        mentorIdType: typeof mentorId
      });

      // Convert both to strings for comparison
      const groupMentorId = studyGroup.mentor.toString();
      const requestMentorId = mentorId.toString();

      console.log('Mentor comparison:', {
        groupMentorId,
        requestMentorId,
        areEqual: groupMentorId === requestMentorId
      });

      if (groupMentorId !== requestMentorId) {
        console.error('Mentor mismatch:', {
          groupMentor: groupMentorId,
          requestMentor: requestMentorId
        });
        throw new BadRequestException('Only the mentor can delete the study group');
      }

      const result = await this.studyGroupModel.findByIdAndDelete(groupId);
      if (!result) {
        console.error('Failed to delete study group:', groupId);
        throw new NotFoundException(`Failed to delete study group with ID ${groupId}`);
      }

      console.log('Study group deleted successfully:', {
        groupId,
        result
      });
    } catch (error) {
      console.error('Error in delete:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete the study group');
    }
  }
}