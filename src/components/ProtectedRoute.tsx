import { Navigate } from 'react-router-dom';
import { useAuth } from '../stores/useAuth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuth(state => state.token);

  if (!token) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}