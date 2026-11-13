export default function LoadingState({ message = 'Loading visits…', compact = false }) {
    return (
        <div
            className={compact ? 'skeleton-list skeleton-list-compact' : 'skeleton-list'}
            role="status"
        >
            <span className="sr-only">{message}</span>
            {[0, 1, 2].map((row) => (
                <span className="skeleton skeleton-line" key={row} aria-hidden="true" />
            ))}
        </div>
    );
}
