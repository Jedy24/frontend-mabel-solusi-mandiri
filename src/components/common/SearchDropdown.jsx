import { ChevronDown, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Button from './Button';
import LoadingState from './LoadingState';

export default function SearchDropdown({
    id,
    label,
    value,
    options,
    optionLabel,
    onSelect,
    onSearch,
    onRetry,
    placeholder,
    disabled,
    loading,
    loadError,
    error
}) {
    const trigger = useRef(null);
    const searchInput = useRef(null);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const panelId = id + '-options';

    useEffect(() => {
        if (open) {
            searchInput.current?.focus();
        }
    }, [open]);

    const visible = onSearch
        ? options
        : options.filter((option) =>
              optionLabel(option).toLowerCase().includes(search.trim().toLowerCase())
          );

    function updateSearch(text) {
        setSearch(text);
        onSearch?.(text);
    }

    function close(restoreFocus = false) {
        setOpen(false);
        if (restoreFocus) {
            trigger.current?.focus();
        }
    }

    return (
        <div
            className="field search-dropdown"
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    close();
                }
            }}
            onKeyDown={(event) => {
                if (event.key === 'Escape' && open) {
                    event.preventDefault();
                    event.stopPropagation();
                    close(true);
                }
            }}
        >
            <label id={id + '-label'} htmlFor={id}>
                {label}
            </label>
            <button
                type="button"
                id={id}
                ref={trigger}
                className="dropdown-trigger"
                aria-labelledby={id + '-label ' + id + '-value'}
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? id + '-error' : undefined}
                disabled={disabled}
                onClick={() => {
                    if (open) {
                        close();
                    } else {
                        updateSearch('');
                        setOpen(true);
                    }
                }}
            >
                <span id={id + '-value'}>{value ? optionLabel(value) : placeholder}</span>
                <ChevronDown size={16} aria-hidden="true" />
            </button>
            {error && (
                <span id={id + '-error'} className="field-error">
                    {error}
                </span>
            )}
            {open && (
                <div className="dropdown-panel" id={panelId}>
                    <div className="dropdown-search">
                        <Search size={16} aria-hidden="true" />
                        <input
                            ref={searchInput}
                            type="search"
                            value={search}
                            maxLength={120}
                            aria-label={'Search ' + label.toLowerCase()}
                            placeholder="Search by name"
                            onChange={(event) => updateSearch(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                }
                            }}
                        />
                    </div>
                    {loading && (
                        <LoadingState
                            compact
                            message={'Loading ' + label.toLowerCase() + ' choices…'}
                        />
                    )}
                    {!loading && loadError && (
                        <div className="dropdown-message">
                            <p role="alert">{loadError}</p>
                            <Button
                                variant="quiet"
                                onClick={() => {
                                    searchInput.current?.focus();
                                    onRetry();
                                }}
                            >
                                Try again
                            </Button>
                        </div>
                    )}
                    {!loading &&
                        !loadError &&
                        (visible.length ? (
                            <ul className="dropdown-options" aria-label={label + ' choices'}>
                                {visible.map((option) => (
                                    <li key={option.id}>
                                        <button
                                            type="button"
                                            aria-pressed={value?.id === option.id}
                                            onClick={() => {
                                                onSelect(option);
                                                close(true);
                                            }}
                                        >
                                            {optionLabel(option)}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="dropdown-message" role="status">
                                No matches found.
                            </p>
                        ))}
                </div>
            )}
        </div>
    );
}
