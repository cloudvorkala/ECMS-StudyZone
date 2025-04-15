// ✅ src/services/auth.ts
// 登录服务函数（与后端 API 交互）

interface LoginPayload {
    email: string;
    password: string;
    role: string;
  }
  
  interface LoginResponse {
    token: string;
    user: {
      id: number;
      name: string;
      role: string;
    };
  }
  
  // 假设后端登录 API 地址为 /api/login
  export async function login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      throw new Error('Login failed');
    }
  
    const data: LoginResponse = await response.json();
    return data;
  }
  
  // 示例调用（你可以在 index.tsx 中使用这个函数）
  /*
  const handleLogin = async () => {
    try {
      const res = await login({ email, password, role });
      localStorage.setItem('token', res.token);
      router.push(`/api/${res.user.role}/dashboard`);
    } catch (err) {
      console.error(err);
    }
  };
  */
  