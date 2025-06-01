import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

interface UserData {
  id: number;
  email: string;
  role: string;
  fullName?: string;
  degree?: string;
  specialty?: string;
}

interface ApiErrorResponse {
  message: string;
  statusCode?: number;
}

interface AxiosErrorResponse {
  data?: ApiErrorResponse;
  status?: number;
  config?: {
    headers?: Record<string, string>;
  };
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const validateUser = async () => {
      const token = sessionStorage.getItem('token');
      const user = sessionStorage.getItem('user');

      setDebugInfo(prev => prev + '\nStarting validation...');
      setDebugInfo(prev => prev + '\nToken exists: ' + !!token);
      setDebugInfo(prev => prev + '\nUser data exists: ' + !!user);

      if (!token || !user) {
        setDebugInfo(prev => prev + '\nNo token or user data found');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setTimeout(() => {
          router.push('/');
        }, 3000);
        return;
      }

      try {
        const userData = JSON.parse(user);
        setDebugInfo(prev => prev + '\nUser data: ' + JSON.stringify(userData));
        setDebugInfo(prev => prev + '\nAllowed roles: ' + JSON.stringify(allowedRoles));
        setDebugInfo(prev => prev + '\nUser role: ' + userData.role);
        setDebugInfo(prev => prev + '\nIs role allowed: ' + allowedRoles?.includes(userData.role));

        // Check if user role is in allowed roles list
        if (allowedRoles && !allowedRoles.includes(userData.role)) {
          setDebugInfo(prev => prev + '\nUser role not allowed, redirecting to: /' + userData.role + '/dashboard');
          setTimeout(() => {
            router.push(`/${userData.role}/dashboard`);
          }, 3000);
          return;
        }

        // Validate token
        setDebugInfo(prev => prev + '\nStarting token validation...');
        try {
          const response = await api.get<{ user: UserData }>('/auth/validate');
          setDebugInfo(prev => prev + '\nToken validation response: ' + JSON.stringify(response.data));
          setDebugInfo(prev => prev + '\nValidated user role: ' + response.data.user.role);
          setDebugInfo(prev => prev + '\nToken: ' + token);
          setDebugInfo(prev => prev + '\nAuthorization header: ' + `Bearer ${token}`);
          setIsAuthorized(true);
        } catch (error) {
          setDebugInfo(prev => prev + '\nToken validation failed: ' + JSON.stringify(error));
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: AxiosErrorResponse };
            setDebugInfo(prev => prev + '\nError status code: ' + axiosError.response?.status);
            setDebugInfo(prev => prev + '\nError response: ' + JSON.stringify(axiosError.response?.data));
            setDebugInfo(prev => prev + '\nRequest headers: ' + JSON.stringify(axiosError.response?.config?.headers));
          }
          throw error; // Re-throw error for outer catch block
        }
      } catch (error: unknown) {
        setDebugInfo(prev => prev + '\nError occurred: ' + JSON.stringify(error));
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: ApiErrorResponse } };
          setDebugInfo(prev => prev + '\nError response: ' + JSON.stringify(axiosError.response?.data));
        }
        // Clear invalid data
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    validateUser();
  }, [router, allowedRoles]);

  // Show debug info if not authorized
  if (!isAuthorized) {
    return (
      <div className="p-4 bg-gray-100">
        <h2 className="text-lg font-bold mb-2">Validating...</h2>
        <pre className="text-xs font-mono whitespace-pre-wrap bg-white p-2 rounded">
          {debugInfo}
        </pre>
      </div>
    );
  }

  return <>{children}</>;
}