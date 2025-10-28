import { useOutletContext, Navigate } from "react-router-dom";

export function ProtectedRoute({ children }) {
  const { user } = useOutletContext();

  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return children(user);
}
