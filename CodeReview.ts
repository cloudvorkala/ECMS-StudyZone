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

