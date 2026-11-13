import { CalendarSearch } from 'lucide-react';

export default function EmptyState({ filtered }) {
    return (
        <div className="empty-state">
            <CalendarSearch size={27} aria-hidden="true" />
            <h3>{filtered ? 'No visits match your filters' : 'No visits yet'}</h3>
            <p>
                {filtered
                    ? 'Try changing the search or filters.'
                    : 'Add a visit to start planning.'}
            </p>
        </div>
    );
}
