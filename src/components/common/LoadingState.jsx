import { LoaderCircle } from 'lucide-react';

export default function LoadingState({ message = 'Loading visits…' }) {
    return (
        <div
            className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-600"
            role="status"
        >
            <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />
            {message}
        </div>
    );
}
