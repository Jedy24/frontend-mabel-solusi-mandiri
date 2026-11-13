import { Check, LoaderCircle, Undo2 } from 'lucide-react';
import Button from '../common/Button';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
});

export default function ActivityTable({ activities, updatingIds, onStatusChange }) {
    return (
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Visit activity table">
            <table>
                <thead>
                    <tr>
                        <th scope="col">Entity Name</th>
                        <th scope="col">Entity Type</th>
                        <th scope="col">Segment</th>
                        <th scope="col">Region</th>
                        <th scope="col">Visit Date</th>
                        <th scope="col">Sales Name</th>
                        <th scope="col">Status</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {activities.map((activity) => {
                        const visited = activity.status === 'VISITED';
                        const updating = updatingIds.includes(activity.id);
                        const action = visited ? 'Mark as Not Visited' : 'Mark as Visited';
                        const Icon = visited ? Undo2 : Check;

                        return (
                            <tr key={activity.id}>
                                <th scope="row">{activity.entity.name}</th>
                                <td>{activity.entity.type}</td>
                                <td>
                                    <span className="segment-tag">{activity.segment}</span>
                                </td>
                                <td>{activity.entity.region}</td>
                                <td>
                                    <time dateTime={activity.visitDate}>
                                        {dateFormat.format(new Date(activity.visitDate))}
                                    </time>
                                </td>
                                <td>{activity.salesName}</td>
                                <td>
                                    <span className={visited ? 'status visited' : 'status pending'}>
                                        {visited ? 'Visited' : 'Not Visited'}
                                    </span>
                                </td>
                                <td>
                                    <Button
                                        variant="quiet"
                                        className="table-action"
                                        disabled={updating}
                                        aria-label={
                                            action +
                                            ' · ' +
                                            activity.entity.name +
                                            ' · ' +
                                            activity.visitDate
                                        }
                                        onClick={() => onStatusChange(activity)}
                                    >
                                        {updating ? (
                                            <LoaderCircle
                                                size={14}
                                                className="animate-spin"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <Icon size={14} aria-hidden="true" />
                                        )}
                                        {updating ? 'Saving…' : action}
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
