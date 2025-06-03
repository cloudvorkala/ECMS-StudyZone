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
  const router = useRouter();

  // Individual state variables for form inputs instead of single object
  const [fullName, setFullName] = useState<string>('');
  const [emailLocalPart, setEmailLocalPart] = useState<string>(''); // Only local part, domain is fixed
  const [phone, setPhone] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Client-side validation patterns for immediate feedback
  const emailPattern = /^[a-zA-Z]{1,5}[0-9]{1,6}$/; // University email format: 1-5 letters + 1-6 digits
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{1,20}$/; // Must contain letters and numbers
  const studentIdPattern = /^\d{8}$/; // Exactly 8 digits required

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate email local part before submitting
    if (!emailPattern.test(emailLocalPart)) {
      setError('Email must be 1-5 letters followed by 1-6 digits (e.g., abcd123456).');
      setLoading(false);
      return;
    }

    // Construct full email with university domain
    const email = `${emailLocalPart}@autuni.ac.nz`;

    // Validate other required fields
    if (!passwordPattern.test(password)) {
      setError('Password must be 1-20 characters and contain both letters and numbers.');
      setLoading(false);
      return;
    }

    if (!studentIdPattern.test(studentId)) {
      setError('Student ID must be 8 digits.');
      setLoading(false);
      return;
    }

    try {
      // Send registration data to backend API
      const response = await api.post('/users/register/student', {
        fullName,
        email,
        phone,
        studentId,
        password,
      });

      if (response.status === 201) {
        alert('Registration successful! You can now login.');
        router.push('/'); // Redirect to home page
      }
    } catch (error: unknown) {
      // Handle API errors with proper type checking
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiErrorResponse } };
        setError(axiosError.response?.data?.message || 'Registration failed');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
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
  @Public() // Allow unauthenticated access for registration
  @Post('register/student')
  async registerStudent(@Body() registerStudentDto: RegisterStudentDto): Promise<User> {
   // Check for duplicate email before creating user
   const existingUser = await this.usersService.findByEmail(registerStudentDto.email);
   if (existingUser) {
     throw new ConflictException('Email already exists');
   }

   // Transform DTO to include required role field
   const createUserDto: CreateUserDto = {
     fullName: registerStudentDto.fullName,
     email: registerStudentDto.email,
     password: registerStudentDto.password,
     role: UserRole.STUDENT, // Set role explicitly for student registration
     phone: registerStudentDto.phone,
     studentId: registerStudentDto.studentId,
   };

   // Delegate user creation to service layer
   return this.usersService.create(createUserDto);
  }

// 4 Database Schema (backend/src/users/user.schema.ts)

async create(createUserDto: CreateUserDto): Promise<User> {
  // Hash password using bcrypt with salt rounds of 10
  const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

  // Create new user document with hashed password
  const createdUser = new this.userModel({
    ...createUserDto,
    password: hashedPassword,
    // Set default values for optional fields
    expertise: createUserDto.expertise || [],
    institution: createUserDto.institution || '',
    rating: 0, // Initialize rating to 0 for new users
  });

  // Save user document to MongoDB and return the created user
  return createdUser.save();
 }

 // Helper method to check for existing users during registration
 async findByEmail(email: string): Promise<User | null> {
  return this.userModel.findOne({ email }).exec();
 }