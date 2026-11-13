import { CalendarDays, CircleCheck, Clock3, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getActivities, updateActivityStatus } from '../api/activityApi';
import { requestError } from '../api/axios';
import ActivityFilters from '../components/activities/ActivityFilters';
import ActivityForm from '../components/activities/ActivityForm';
import ActivityTable from '../components/activities/ActivityTable';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';

const emptyFilters = { search: '', segment: '', status: '', from: '', to: '' };

export default function DashboardPage() {
    const [filters, setFilters] = useState(emptyFilters);
    const [search, setSearch] = useState('');
    const [activities, setActivities] = useState([]);
    const [completedRequest, setCompletedRequest] = useState('');
    const [listError, setListError] = useState('');
    const [actionError, setActionError] = useState('');
    const [success, setSuccess] = useState('');
    const [version, setVersion] = useState(0);
    const [adding, setAdding] = useState(false);
    const [updatingIds, setUpdatingIds] = useState([]);

    const { segment, status, from, to } = filters;
    const dateError = from && to && from > to ? 'End date must be on or after the start date' : '';
    const hasFilters = Object.values(filters).some(Boolean);
    const requestKey = JSON.stringify([segment, status, from, to, search, version]);
    const loading = !dateError && completedRequest !== requestKey;
    const showResults = !loading && !dateError && !listError;

    useEffect(() => {
        if (dateError) {
            return undefined;
        }

        const controller = new AbortController();
        async function loadVisits() {
            setListError('');
            try {
                const visits = await getActivities(
                    { segment, status, from, to, search },
                    controller.signal
                );
                if (!controller.signal.aborted) {
                    setActivities(visits);
                }
            } catch (failure) {
                if (!controller.signal.aborted) {
                    setListError(
                        requestError(
                            failure,
                            'Could not load visits. Check that the API is running.'
                        )
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setCompletedRequest(requestKey);
                }
            }
        }

        loadVisits();
        return () => controller.abort();
    }, [segment, status, from, to, search, dateError, requestKey]);

    function refresh() {
        setVersion((current) => current + 1);
    }

    async function changeStatus(activity) {
        setUpdatingIds((current) => [...current, activity.id]);
        setActionError('');
        setSuccess('');
        const nextStatus = activity.status === 'VISITED' ? 'NOT_VISITED' : 'VISITED';
        try {
            await updateActivityStatus(activity.id, nextStatus);
            setSuccess(
                nextStatus === 'VISITED'
                    ? 'Visit marked as Visited.'
                    : 'Visit marked as Not Visited.'
            );
            refresh();
        } catch (failure) {
            setActionError(requestError(failure, 'Could not update the visit status.'));
        } finally {
            setUpdatingIds((current) => current.filter((id) => id !== activity.id));
        }
    }

    function visitCreated() {
        setAdding(false);
        setActionError('');
        setSuccess('Visit added successfully.');
        refresh();
    }

    const visited = activities.filter((activity) => activity.status === 'VISITED').length;
    const metrics = [
        { label: 'Total Visits', value: activities.length, icon: CalendarDays, tone: 'blue' },
        { label: 'Visited', value: visited, icon: CircleCheck, tone: 'green' },
        { label: 'Not Visited', value: activities.length - visited, icon: Clock3, tone: 'amber' }
    ];

    return (
        <>
            <div className="page-heading">
                <div>
                    <h1>Visit Management</h1>
                    <p>Plan visits and track their status.</p>
                </div>
                <Button onClick={() => setAdding(true)}>
                    <Plus size={19} aria-hidden="true" /> Add Visit
                </Button>
            </div>
            <section className="metrics" aria-label="Visit summary">
                {metrics.map(({ label, value, icon: Icon, tone }) => (
                    <div className="panel metric" key={label}>
                        <span className={`metric-icon ${tone}`}>
                            <Icon size={22} aria-hidden="true" />
                        </span>
                        <div>
                            <p>{label}</p>
                            <strong>
                                {loading ? (
                                    <span
                                        className="skeleton metric-placeholder"
                                        aria-hidden="true"
                                    />
                                ) : showResults ? (
                                    value
                                ) : (
                                    '—'
                                )}
                            </strong>
                        </div>
                    </div>
                ))}
            </section>
            <ActivityFilters
                filters={filters}
                hasFilters={hasFilters}
                dateError={dateError}
                onChange={(field, value) =>
                    setFilters((current) => ({ ...current, [field]: value }))
                }
                onSearch={() => setSearch(filters.search.trim())}
                onReset={() => {
                    setFilters(emptyFilters);
                    setSearch('');
                }}
            />
            {success && (
                <p className="alert alert-success" role="status">
                    {success}
                </p>
            )}
            {actionError && (
                <p className="alert alert-error" role="alert">
                    {actionError}
                </p>
            )}
            <section className="panel activity-panel" aria-labelledby="activity-title">
                <div className="activity-heading">
                    <h2 id="activity-title">Visit activity</h2>
                    {showResults && (
                        <p>
                            {activities.length} {activities.length === 1 ? 'visit' : 'visits'}
                        </p>
                    )}
                </div>
                {dateError && (
                    <p className="list-message">Correct the date range to see matching visits.</p>
                )}
                {loading && <LoadingState />}
                {!loading && !dateError && listError && (
                    <div className="list-message" role="alert">
                        <p>{listError}</p>
                        <Button variant="secondary" onClick={refresh}>
                            Try again
                        </Button>
                    </div>
                )}
                {showResults &&
                    (activities.length ? (
                        <ActivityTable
                            activities={activities}
                            updatingIds={updatingIds}
                            onStatusChange={changeStatus}
                        />
                    ) : (
                        <EmptyState filtered={hasFilters} />
                    ))}
            </section>
            {adding && <ActivityForm onClose={() => setAdding(false)} onCreated={visitCreated} />}
        </>
    );
}
