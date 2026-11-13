import { LoaderCircle, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createActivity } from '../../api/activityApi';
import { requestError } from '../../api/axios';
import { getEntities } from '../../api/entityApi';
import Button from '../common/Button';
import Input from '../common/Input';

export default function ActivityForm({ onClose, onCreated }) {
    const dialog = useRef(null);
    const [form, setForm] = useState({ segment: '', entityId: '', visitDate: '', salesName: '' });
    const [search, setSearch] = useState('');
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [entityError, setEntityError] = useState('');
    const [entityAttempt, setEntityAttempt] = useState(0);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        dialog.current.showModal();
    }, []);

    useEffect(() => {
        if (!form.segment) {
            return undefined;
        }

        const controller = new AbortController();
        async function loadChoices() {
            try {
                const choices = await getEntities(form.segment, search.trim(), controller.signal);
                if (!controller.signal.aborted) {
                    setEntities(choices);
                }
            } catch (failure) {
                if (!controller.signal.aborted) {
                    setEntityError(requestError(failure, 'Could not load entity choices.'));
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        const timer = window.setTimeout(loadChoices, search ? 250 : 0);
        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [form.segment, search, entityAttempt]);

    function resetChoices() {
        setEntities([]);
        setEntityError('');
        setLoading(true);
    }

    function update(field, value) {
        setFieldErrors((current) => ({ ...current, [field]: undefined }));
        if (field === 'segment') {
            setForm((current) => ({ ...current, segment: value, entityId: '' }));
            setFieldErrors((current) => ({ ...current, entityId: undefined }));
            setSearch('');
            resetChoices();
            setLoading(Boolean(value));
            return;
        }
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateSearch(value) {
        setSearch(value);
        update('entityId', '');
        resetChoices();
    }

    function close() {
        if (!saving) {
            dialog.current.close();
            onClose();
        }
    }

    async function submit(event) {
        event.preventDefault();
        if (!form.salesName.trim()) {
            setFieldErrors({ salesName: 'Enter a sales name' });
            return;
        }

        setSaving(true);
        setError('');
        setFieldErrors({});
        try {
            const activity = await createActivity(form);
            dialog.current.close();
            onCreated(activity);
        } catch (failure) {
            setFieldErrors(failure.response?.data?.errors || {});
            setError(requestError(failure, 'Could not save the visit. Try again.'));
            setSaving(false);
        }
    }

    let entityPlaceholder = 'Select an entity';
    if (!form.segment) {
        entityPlaceholder = 'Select a segment first';
    } else if (loading) {
        entityPlaceholder = 'Loading entities…';
    } else if (!entities.length) {
        entityPlaceholder = entityError ? 'Could not load entities' : 'No entities found';
    }

    return (
        <dialog
            ref={dialog}
            className="visit-dialog"
            aria-labelledby="add-visit-title"
            onCancel={(event) => {
                event.preventDefault();
                close();
            }}
        >
            <div className="dialog-heading">
                <h2 id="add-visit-title">Add visit</h2>
                <Button
                    variant="quiet"
                    onClick={close}
                    disabled={saving}
                    aria-label="Close add visit"
                >
                    <X size={20} aria-hidden="true" />
                </Button>
            </div>
            <form onSubmit={submit}>
                <fieldset disabled={saving} className="dialog-fields">
                    <Input
                        id="visit-segment"
                        label="Segment"
                        required
                        value={form.segment}
                        error={fieldErrors.segment}
                        onChange={(event) => update('segment', event.target.value)}
                    >
                        <option value="">Select a segment</option>
                        <option value="B2G">B2G</option>
                        <option value="B2B">B2B</option>
                    </Input>
                    <Input
                        id="entity-search"
                        label="Find an entity"
                        type="search"
                        maxLength={120}
                        value={search}
                        disabled={!form.segment}
                        placeholder="Search by name"
                        onChange={(event) => updateSearch(event.target.value)}
                    />
                    <Input
                        id="visit-entity"
                        label="Entity"
                        required
                        value={form.entityId}
                        disabled={!form.segment || loading || !entities.length}
                        error={fieldErrors.entityId}
                        onChange={(event) => update('entityId', event.target.value)}
                    >
                        <option value="">{entityPlaceholder}</option>
                        {entities.map((entity) => (
                            <option key={entity.id} value={entity.id}>
                                {entity.name} · {entity.type} · {entity.region}
                            </option>
                        ))}
                    </Input>
                    {loading && (
                        <p className="entity-message" role="status">
                            Loading entity choices…
                        </p>
                    )}
                    {entityError && (
                        <div className="alert alert-error" role="alert">
                            {entityError}
                            <Button
                                variant="quiet"
                                onClick={() => {
                                    resetChoices();
                                    setEntityAttempt((current) => current + 1);
                                }}
                            >
                                Try again
                            </Button>
                        </div>
                    )}
                    <Input
                        id="visit-date"
                        label="Visit date"
                        type="date"
                        required
                        value={form.visitDate}
                        error={fieldErrors.visitDate}
                        onChange={(event) => update('visitDate', event.target.value)}
                    />
                    <Input
                        id="visit-sales"
                        label="Sales name"
                        required
                        maxLength={100}
                        value={form.salesName}
                        error={fieldErrors.salesName}
                        onChange={(event) => update('salesName', event.target.value)}
                    />
                    {error && (
                        <p className="alert alert-error" role="alert">
                            {error}
                        </p>
                    )}
                </fieldset>
                <div className="dialog-footer">
                    <Button variant="secondary" onClick={close} disabled={saving}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={
                            saving ||
                            loading ||
                            Boolean(entityError) ||
                            (Boolean(form.segment) && !entities.length)
                        }
                    >
                        {saving && (
                            <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                        )}
                        {saving ? 'Saving…' : 'Save visit'}
                    </Button>
                </div>
            </form>
        </dialog>
    );
}
