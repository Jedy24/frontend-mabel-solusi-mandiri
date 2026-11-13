import { LogOut } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Brand from './Brand';

export default function MainLayout() {
    const { user, signOut } = useAuth();

    return (
        <>
            <header className="topbar">
                <div className="shell topbar-content">
                    <Brand />
                    <div className="account">
                        <span className="account-name">{user.name}</span>
                        <Button variant="secondary" onClick={signOut}>
                            <LogOut size={16} aria-hidden="true" /> Log out
                        </Button>
                    </div>
                </div>
            </header>
            <main className="shell dashboard">
                <Outlet />
            </main>
        </>
    );
}
