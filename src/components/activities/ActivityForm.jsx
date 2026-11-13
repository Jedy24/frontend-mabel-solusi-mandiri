import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createActivity } from '../../api/activityApi';
import { requestError } from '../../api/axios';
import { getEntities } from '../../api/entityApi';
import { getSalespeople } from '../../api/salesApi';
import Button from '../common/Button';
import Input from '../common/Input';
import SearchDropdown from '../common/SearchDropdown';

const loadingChoices = { options: [], error: '', loading: true };

export default function ActivityForm({ onClose, onCreated }) {
    const dialog = useRef(null);
    const [segment, setSegment] = useState('');
    const [entity, setEntity] = useState(null);
    const [salesperson, setSalesperson] = useState(null);
    const [visitDate, setVisitDate] = useState('');
    const [search, setSearch] = useState('');
    const [entities, setEntities] = useState(loadingChoices);
    const [sales, setSales] = useState(loadingChoices);
    const [entityAttempt, setEntityAttempt] = useState(0);
    const [salesAttempt, setSalesAttempt] = useState(0);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        dialog.current.showModal();
    }, []);

    useEffect(() => {
        if (!segment) {
            return undefined;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(
            async () => {
                try {
                    const options = await getEntities(segment, search, controller.signal);
                    if (!controller.signal.aborted) {
                        setEntities({ options, error: '', loading: false });
                    }
                } catch (failure) {
                    if (!controller.signal.aborted) {
                        setEntities({
                            options: [],
                            loading: false,
                            error: requestError(failure, 'Could not load entity choices.')
                        });
                    }
                }
            },
            search ? 350 : 0
        );

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [segment, search, entityAttempt]);

    useEffect(() => {
        const controller = new AbortController();
        async function loadSales() {
            try {
                const options = await getSalespeople(controller.signal);
                if (!controller.signal.aborted) {
                    setSales({ options, error: '', loading: false });
                }
            } catch (failure) {
                if (!controller.signal.aborted) {
                    setSales({
                        options: [],
                        loading: false,
                        error: requestError(failure, 'Could not load sales choices.')
                    });
                }
            }
        }

        loadSales();
        return () => controller.abort();
    }, [salesAttempt]);

    function clearFieldError(field) {
        setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }

    function updateSegment(value) {
        setSegment(value);
        setEntity(null);
        setSearch('');
        setEntities(loadingChoices);
        setFieldErrors((current) => ({ ...current, segment: undefined, entityId: undefined }));
    }

    function searchEntities(value) {
        const query = value.trim();
        if (query !== search) {
            setSearch(query);
            setEntities(loadingChoices);
        }
    }

    function close() {
        if (!saving) {
            dialog.current.close();
            onClose();
        }
    }

    async function submit(event) {
        event.preventDefault();
        const errors = {};
        if (!entity) {
            errors.entityId = 'Select an entity';
        }
        if (!salesperson) {
            errors.salesId = 'Select a salesperson';
        }
        setFieldErrors(errors);
        setError('');
        if (Object.keys(errors).length) {
            return;
        }

        setSaving(true);
        try {
            const activity = await createActivity({
                segment,
                visitDate,
                entityId: entity.id,
                salesId: salesperson.id
            });
            dialog.current.close();
            onCreated(activity);
        } catch (failure) {
            setFieldErrors(failure.response?.data?.errors || {});
            setError(requestError(failure, 'Could not save the visit. Try again.'));
            setSaving(false);
        }
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
                        value={segment}
                        error={fieldErrors.segment}
                        onChange={(event) => updateSegment(event.target.value)}
                    >
                        <option value="">Select a segment</option>
                        <option value="B2G">B2G</option>
                        <option value="B2B">B2B</option>
                    </Input>
                    <SearchDropdown
                        key={segment}
                        id="visit-entity"
                        label="Entity"
                        value={entity}
                        options={entities.options}
                        loading={entities.loading}
                        disabled={!segment}
                        placeholder={segment ? 'Select an entity' : 'Select a segment first'}
                        loadError={entities.error}
                        error={fieldErrors.entityId}
                        optionLabel={(option) =>
                            [option.name, option.type, option.region].join(' · ')
                        }
                        onSearch={searchEntities}
                        onSelect={(option) => {
                            setEntity(option);
                            clearFieldError('entityId');
                        }}
                        onRetry={() => {
                            setEntities(loadingChoices);
                            setEntityAttempt((current) => current + 1);
                        }}
                    />
                    <Input
                        id="visit-date"
                        label="Visit date"
                        type="date"
                        required
                        value={visitDate}
                        error={fieldErrors.visitDate}
                        onChange={(event) => {
                            setVisitDate(event.target.value);
                            clearFieldError('visitDate');
                        }}
                    />
                    <SearchDropdown
                        id="visit-sales"
                        label="Sales name"
                        value={salesperson}
                        options={sales.options}
                        loading={sales.loading}
                        placeholder="Select a salesperson"
                        loadError={sales.error}
                        error={fieldErrors.salesId}
                        optionLabel={(option) => option.name}
                        onSelect={(option) => {
                            setSalesperson(option);
                            clearFieldError('salesId');
                        }}
                        onRetry={() => {
                            setSales(loadingChoices);
                            setSalesAttempt((current) => current + 1);
                        }}
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
                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving…' : 'Save visit'}
                    </Button>
                </div>
            </form>
        </dialog>
    );
}
