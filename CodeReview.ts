//1 Frontend Interface (frontend/src/pages/mentor/editprofile.tsx):
// Profile form fields include:
- Full Name (fullName)
- Email (email, read-only)
- Phone Number (phone)
- Degree (degree)
- Specialty Courses (specialty)
- Areas of Expertise (expertise, comma-separated array)
- Institution (institution)


//2 Data Flow:
// 1. Load existing data
useEffect(() => {
    const loadProfile = async () => {
      // Retrieve user data from session storage
      const userData = sessionStorage.getItem('user');
      if (userData) {
        const parsedData = JSON.parse(userData);
        // Initialize form with existing profile data
        setProfile({
          fullName: parsedData.fullName || '',
          email: parsedData.email || '',
          // ... other fields
        });
      }
    };
    loadProfile();
  }, []);

  // 2. Submit updates
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Send PUT request to backend
      await api.put('/users/mentor/profile', profile);

      // Update local storage with new data
      const userData = sessionStorage.getItem('user');
      if (userData) {
        const parsedData = JSON.parse(userData);
        sessionStorage.setItem('user', JSON.stringify({
          ...parsedData,
          ...profile
        }));
      }
// Redirect to profile page on success
      router.push('/mentor/profile');
    } catch (err) {
      setError('Update failed, please try again');
    }
  };

  //3 Backend Controller (backend/src/users/users.controller.ts):
  @Put('mentor/profile')
  @Roles('mentor')  // Role-based access control
  async updateMentorProfile(@Request() req, @Body() updateData: Partial<User>) {
    // Pass user ID and update data to service layer
    return this.usersService.updateMentorProfile(req.user.id, updateData);
  }

  // 4 Database Update (backend/src/users/users.service.ts)
  async updateMentorProfile(id: string, updateData: Partial<User>): Promise<User> {
    // Update user document in MongoDB
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateData },  // Set new values
      { new: true }          // Return updated document
    ).exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  //Mark code example (D to A+): Final Grade: A




  // Code Review 2

//1 Frontend Registration Form:
// frontend/src/pages/student-registration.tsx
const StudentRegistration = () => {
    // State management for form data
    const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      password: '',
      phone: '',
      studentId: ''
    });

    // Form submission handler
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        // Send registration request to backend
        const response = await fetch('/api/student/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          // Redirect to login page on success
          router.push('/auth/signin');
        }
      } catch (error) {
        // Handle registration errors
        console.error('Registration failed:', error);
      }
    };
    // 2 Backend DTO
    // backend/src/users/dto/register-student.dto.ts
export class RegisterStudentDto {
    // Required fields with validation
    @IsNotEmpty()
    @IsString()
    fullName!: string;

    @IsNotEmpty()
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    phone!: string;

    @IsNotEmpty()
    @IsString()
    studentId!: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password!: string;
  }

  // 3 Backend Controller (backend/src/users/users.controller.ts)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Public endpoint for student registration
  @Public()
  @Post('student/register')
  async registerStudent(@Body() registerStudentDto: RegisterStudentDto) {
    try {
      // Check if email already exists
      const existingUser = await this.usersService.findByEmail(registerStudentDto.email);
      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      // Create new student user
      const user = await this.usersService.create({
        ...registerStudentDto,
        role: UserRole.STUDENT
      });

      // Return user data without password
      const { password, ...result } = user.toObject();
      return result;
    } catch (error) {
      // Handle registration errors
      throw error;
    }
  }
}

// 4 Database Schema (backend/src/users/user.schema.ts)

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // Create new user in database
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Hash password for security
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user document
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      // Set default values for student
      expertise: [],
      institution: '',
      rating: 0,
    });

    // Save to database
    return createdUser.save();
  }
}

// 5 Database Schema (backend/src/users/user.schema.ts)

@Schema()
export class User extends Document {
  // Required fields
  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true, enum: UserRole })
  role!: UserRole;

  // Optional fields
  @Prop()
  phone?: string;

  @Prop()
  studentId?: string;

  @Prop()
  degree?: string;

  @Prop()
  specialty?: string;

  @Prop({ type: [String], default: [] })
  expertise!: string[];

  @Prop()
  institution?: string;

  @Prop({ default: 0 })
  rating!: number;

  @Prop({ default: Date.now })
  createdAt!: Date;
}