import { useEffect } from 'react';
import { useRouter } from 'next/router';

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();

  useEffect(() => {
    // 检查是否已登录
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        // 只在访问登录页面时重定向
        if (router.pathname === '/') {
          router.push(`/${userData.role}/dashboard`);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    }
  }, [router]);

  return <>{children}</>;
}