import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import LoadingState from '../components/common/LoadingState';

export default function ProtectedRoute() {
    const { user, checking, sessionError, retrySession, signOut } = useAuth();

    if (checking) {
        return <LoadingState message="Checking your session…" />;
    }

    if (sessionError) {
        return (
            <main className="login-shell">
                <div className="panel login-card">
                    <p className="alert alert-error" role="alert">
                        {sessionError}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={retrySession}>Try again</Button>
                        <Button variant="secondary" onClick={signOut}>
                            Return to sign in
                        </Button>
                    </div>
                </div>
            </main>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
}
