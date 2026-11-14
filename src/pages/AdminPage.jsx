import { ArrowLeft, Building2, ClipboardList, ContactRound, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { archiveAdmin, listAdmin, saveAdmin } from '../api/adminApi';
import { requestError } from '../api/axios';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingState from '../components/common/LoadingState';

const resources = {
    users: {
        label: 'Users',
        icon: Users,
        singular: 'user',
        empty: { name: '', email: '', password: '', role: 'USER' }
    },
    entities: {
        label: 'Entities',
        icon: Building2,
        singular: 'entity',
        empty: { name: '', type: '', segment: 'B2G', region: '', isMaster: true }
    },
    sales: { label: 'Sales', icon: ContactRound, singular: 'salesperson', empty: { name: '' } },
    audit: { label: 'Audit log', icon: ClipboardList }
};

function CatalogForm({ resource, form, setForm, editing, errors, busy, onSubmit, onCancel }) {
    const { singular } = resources[resource];

    function field(name, label, extra = {}) {
        return (
            <Input
                id={'admin-' + name}
                label={label}
                required
                value={form[name]}
                error={errors[name]}
                onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                {...extra}
            />
        );
    }

    function catalogSwitch(name, label, description) {
        const id = 'admin-' + name;
        const describedBy = id + '-description' + (errors[name] ? ' ' + id + '-error' : '');

        return (
            <div className="catalog-setting">
                <div>
                    <label htmlFor={id} id={id + '-label'}>
                        {label}
                    </label>
                    <p id={id + '-description'}>{description}</p>
                    {errors[name] && (
                        <p className="field-error" id={id + '-error'}>
                            {errors[name]}
                        </p>
                    )}
                </div>
                <label className="catalog-toggle" htmlFor={id} aria-hidden="true">
                    <span className="catalog-toggle-track" />
                </label>
                <input
                    className="sr-only catalog-toggle-input"
                    id={id}
                    type="checkbox"
                    role="switch"
                    aria-labelledby={id + '-label'}
                    aria-describedby={describedBy}
                    aria-invalid={errors[name] ? true : undefined}
                    checked={form[name]}
                    onChange={(event) => setForm({ ...form, [name]: event.target.checked })}
                />
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="panel admin-panel">
            <h2>{editing ? 'Edit ' + singular : 'Add ' + singular}</h2>
            <fieldset disabled={busy} className="admin-fields">
                {field('name', 'Name', { maxLength: 100 })}
                {resource === 'users' && (
                    <>
                        {field('email', 'Email', { type: 'email', autoComplete: 'off' })}
                        {field('password', 'Password', {
                            type: 'password',
                            autoComplete: 'new-password',
                            minLength: 12
                        })}
                        <Input
                            id="admin-role"
                            label="Role"
                            value={form.role}
                            error={errors.role}
                            onChange={(event) => setForm({ ...form, role: event.target.value })}
                        >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </Input>
                    </>
                )}
                {resource === 'entities' && (
                    <>
                        {field('type', 'Type', { maxLength: 100 })}
                        <Input
                            id="admin-segment"
                            label="Segment"
                            value={form.segment}
                            error={errors.segment}
                            onChange={(event) => setForm({ ...form, segment: event.target.value })}
                        >
                            <option value="B2G">B2G</option>
                            <option value="B2B">B2B</option>
                        </Input>
                        {field('region', 'Region', { maxLength: 100 })}
                    </>
                )}
                {(resource === 'entities' || editing) && (
                    <div
                        className="catalog-settings"
                        role="group"
                        aria-labelledby="catalog-settings-title"
                    >
                        <h3 id="catalog-settings-title">Catalog settings</h3>
                        <div className="catalog-settings-grid">
                            {resource === 'entities' &&
                                catalogSwitch(
                                    'isMaster',
                                    'Master catalog',
                                    'Include in the main Entity dropdown. When off, an entity with past visits can still appear as a fallback.'
                                )}
                            {editing &&
                                catalogSwitch(
                                    'isActive',
                                    'Active',
                                    'Turn off to hide this item from new visits while keeping its visit history.'
                                )}
                        </div>
                    </div>
                )}
            </fieldset>
            <div className="admin-actions">
                <Button type="submit" disabled={busy}>
                    {busy ? 'Saving…' : 'Save'}
                </Button>
                {editing && (
                    <Button variant="secondary" disabled={busy} onClick={onCancel}>
                        Cancel edit
                    </Button>
                )}
            </div>
        </form>
    );
}

function AuditList({ rows }) {
    return (
        <ul className="admin-list">
            {rows.map((entry) => (
                <li key={entry.id} className="admin-item">
                    <div>
                        <strong>
                            {entry.action} · {entry.targetType}
                        </strong>
                        <p>
                            {entry.actorEmail} · {entry.actorRole}
                        </p>
                        <p>
                            <time dateTime={entry.createdAt}>
                                {new Date(entry.createdAt).toLocaleString()}
                            </time>
                            {' · '}
                            {entry.targetId}
                        </p>
                        {entry.changes && (
                            <details>
                                <summary>View changes</summary>
                                <pre>{JSON.stringify(entry.changes, null, 4)}</pre>
                            </details>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}

function AdminSection({ resource }) {
    const config = resources[resource];
    const audit = resource === 'audit';
    const [form, setForm] = useState(config.empty);
    const [editing, setEditing] = useState(null);
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState([]);
    const [hasNext, setHasNext] = useState(false);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [version, setVersion] = useState(0);
    const [loadError, setLoadError] = useState('');
    const [actionError, setActionError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [notice, setNotice] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        async function load() {
            try {
                const data = await listAdmin(
                    resource,
                    controller.signal,
                    audit ? { page } : undefined
                );
                if (!controller.signal.aborted) {
                    setRows(audit ? data.rows : data);
                    setHasNext(audit && data.hasNext);
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setLoadError(requestError(error, 'Could not load this section.'));
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        load();
        return () => controller.abort();
    }, [resource, audit, page, version]);

    function reload() {
        setLoadError('');
        setLoading(true);
        setVersion((current) => current + 1);
    }

    function resetForm() {
        setForm(config.empty);
        setEditing(null);
        setFieldErrors({});
        setActionError('');
    }

    function edit(row) {
        const editable = Object.fromEntries(
            Object.keys(config.empty).map((key) => [key, row[key]])
        );
        setForm({ ...editable, isActive: row.isActive });
        setEditing(row.id);
        setFieldErrors({});
        setActionError('');
        setNotice('');
    }

    async function submit(event) {
        event.preventDefault();
        setBusy(true);
        setFieldErrors({});
        setActionError('');
        setNotice('');
        try {
            await saveAdmin(resource, editing, form);
            resetForm();
            setNotice('Saved.');
            reload();
        } catch (error) {
            setFieldErrors(error.response?.data?.errors ?? {});
            setActionError(requestError(error, 'Could not save this item.'));
        } finally {
            setBusy(false);
        }
    }

    async function archive(row) {
        if (!window.confirm('Archive ' + row.name + '?')) {
            return;
        }

        setBusy(true);
        setActionError('');
        setNotice('');
        try {
            await archiveAdmin(resource, row.id);
            if (editing === row.id) {
                resetForm();
            }
            setNotice('Archived.');
            reload();
        } catch (error) {
            setActionError(requestError(error, 'Could not archive this item.'));
        } finally {
            setBusy(false);
        }
    }

    function goToPage(nextPage) {
        setLoadError('');
        setLoading(true);
        setPage(nextPage);
    }

    return (
        <>
            {!audit && (
                <CatalogForm
                    resource={resource}
                    form={form}
                    setForm={setForm}
                    editing={editing}
                    errors={fieldErrors}
                    busy={busy}
                    onSubmit={submit}
                    onCancel={resetForm}
                />
            )}
            {notice && (
                <p className="alert alert-success" role="status">
                    {notice}
                </p>
            )}
            {actionError && (
                <p className="alert alert-error" role="alert">
                    {actionError}
                </p>
            )}
            <section className="panel admin-panel" aria-label={config.label}>
                <div className="admin-section-heading">
                    <h2>{config.label}</h2>
                    {!audit && !loading && !loadError && (
                        <p>
                            {rows.length} {rows.length === 1 ? 'record' : 'records'}
                        </p>
                    )}
                </div>
                {loading && (
                    <LoadingState message={'Loading ' + config.label.toLowerCase() + '…'} />
                )}
                {loadError && (
                    <div>
                        <p className="alert alert-error" role="alert">
                            {loadError}
                        </p>
                        <Button variant="secondary" onClick={reload}>
                            Try again
                        </Button>
                    </div>
                )}
                {!loading && !loadError && (
                    <>
                        {!rows.length && <p>No records found.</p>}
                        {audit ? (
                            <AuditList rows={rows} />
                        ) : (
                            <ul className="admin-list">
                                {rows.map((row) => (
                                    <li key={row.id} className="admin-item">
                                        <div>
                                            <strong>{row.name}</strong>
                                            {resource === 'users' && <p>{row.email}</p>}
                                            {resource === 'entities' && (
                                                <p>
                                                    {row.type} · {row.segment} · {row.region}
                                                </p>
                                            )}
                                        </div>
                                        {resource === 'users' ? (
                                            <span className="segment-tag">
                                                {row.role === 'ADMIN' ? 'Admin' : 'User'}
                                            </span>
                                        ) : (
                                            <div className="admin-actions">
                                                <span
                                                    className={
                                                        row.isActive
                                                            ? 'status visited'
                                                            : 'status pending'
                                                    }
                                                >
                                                    {row.isActive ? 'Active' : 'Archived'}
                                                </span>
                                                <Button
                                                    variant="secondary"
                                                    disabled={busy}
                                                    onClick={() => edit(row)}
                                                >
                                                    Edit
                                                </Button>
                                                {row.isActive && (
                                                    <Button
                                                        variant="quiet"
                                                        disabled={busy}
                                                        onClick={() => archive(row)}
                                                    >
                                                        Archive
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {audit && (
                            <div className="admin-actions">
                                <Button
                                    variant="secondary"
                                    disabled={page === 1}
                                    onClick={() => goToPage(page - 1)}
                                >
                                    Previous
                                </Button>
                                <span>Page {page}</span>
                                <Button
                                    variant="secondary"
                                    disabled={!hasNext}
                                    onClick={() => goToPage(page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </>
    );
}

export default function AdminPage() {
    const [resource, setResource] = useState('users');

    return (
        <>
            <div className="page-heading">
                <div>
                    <h1>Administration</h1>
                    <p>Manage accounts, visit catalogs, and audit history.</p>
                </div>
                <Link to="/" className="button button-secondary">
                    <ArrowLeft size={17} aria-hidden="true" /> Back to Visit Management
                </Link>
            </div>
            <nav className="panel admin-nav" aria-label="Admin sections">
                {Object.entries(resources).map(([key, { label, icon: Icon }]) => (
                    <Button
                        key={key}
                        variant="quiet"
                        aria-pressed={resource === key}
                        onClick={() => setResource(key)}
                    >
                        <Icon size={17} aria-hidden="true" /> {label}
                    </Button>
                ))}
            </nav>
            <AdminSection key={resource} resource={resource} />
        </>
    );
}
