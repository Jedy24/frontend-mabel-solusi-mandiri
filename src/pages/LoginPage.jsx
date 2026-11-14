import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { requestError } from '../api/axios';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingState from '../components/common/LoadingState';
import Brand from '../components/layout/Brand';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { user, checking, signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [pending, setPending] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    async function submit(event) {
        event.preventDefault();
        setPending(true);
        setError('');
        setFieldErrors({});

        try {
            await signIn({ email, password });
        } catch (failure) {
            setFieldErrors(failure.response?.data?.errors || {});
            setError(requestError(failure, 'Could not sign in. Check that the API is running.'));
        } finally {
            setPending(false);
        }
    }

    if (checking) {
        return <LoadingState message="Checking your session…" />;
    }
    if (user) {
        return <Navigate to="/" replace />;
    }

    return (
        <main className="login-shell">
            <section className="panel login-card" aria-labelledby="login-title">
                <Brand />
                <div className="login-heading">
                    <h1 id="login-title">Sign in</h1>
                    <p>Access your team’s visit plans and activity.</p>
                </div>
                <form className="grid gap-4" onSubmit={submit}>
                    <Input
                        id="email"
                        label="Email address"
                        type="email"
                        autoComplete="username"
                        placeholder="you@example.com"
                        required
                        value={email}
                        error={fieldErrors.email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                    <div className="password-field">
                        <Input
                            id="password"
                            label="Password"
                            type={passwordVisible ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder="Password"
                            required
                            value={password}
                            error={fieldErrors.password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                            aria-controls="password"
                            onClick={() => setPasswordVisible((visible) => !visible)}
                        >
                            {passwordVisible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                        </button>
                    </div>
                    {error && (
                        <p className="alert alert-error" role="alert">
                            {error}
                        </p>
                    )}
                    <Button className="login-submit" type="submit" disabled={pending}>
                        {pending ? 'Signing in…' : 'Sign in'}
                        {!pending && <ArrowRight size={17} aria-hidden="true" />}
                    </Button>
                </form>
            </section>
        </main>
    );
}
