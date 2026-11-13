import { Route } from 'lucide-react';

export default function Brand() {
    return (
        <div className="brand">
            <span className="brand-icon">
                <Route size={21} aria-hidden="true" />
            </span>
            <span>Visit Flow</span>
        </div>
    );
}
