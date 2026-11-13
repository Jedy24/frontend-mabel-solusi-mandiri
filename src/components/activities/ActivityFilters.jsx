import { RotateCcw, Search } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

export default function ActivityFilters({
    filters,
    onChange,
    onSearch,
    onReset,
    dateError,
    hasFilters
}) {
    return (
        <section className="panel filters" aria-labelledby="filters-title">
            <div className="filters-heading">
                <h2 id="filters-title">Filters</h2>
                <Button variant="quiet" onClick={onReset} disabled={!hasFilters}>
                    <RotateCcw size={14} aria-hidden="true" /> Reset filters
                </Button>
            </div>
            <div className="filter-grid">
                <form
                    className="search-field"
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSearch();
                    }}
                >
                    <Input
                        id="visit-search"
                        label="Entity name"
                        type="search"
                        placeholder="Search entities"
                        maxLength={120}
                        value={filters.search}
                        onChange={(event) => onChange('search', event.target.value)}
                    />
                    <Button type="submit" variant="secondary" className="search-submit">
                        <Search size={16} aria-hidden="true" /> Search
                    </Button>
                </form>
                <Input
                    id="filter-segment"
                    label="Segment"
                    value={filters.segment}
                    onChange={(event) => onChange('segment', event.target.value)}
                >
                    <option value="">All segments</option>
                    <option value="B2G">B2G</option>
                    <option value="B2B">B2B</option>
                </Input>
                <Input
                    id="filter-status"
                    label="Status"
                    value={filters.status}
                    onChange={(event) => onChange('status', event.target.value)}
                >
                    <option value="">All statuses</option>
                    <option value="VISITED">Visited</option>
                    <option value="NOT_VISITED">Not Visited</option>
                </Input>
                <Input
                    id="filter-from"
                    label="Start date"
                    type="date"
                    value={filters.from}
                    onChange={(event) => onChange('from', event.target.value)}
                />
                <Input
                    id="filter-to"
                    label="End date"
                    type="date"
                    value={filters.to}
                    error={dateError}
                    onChange={(event) => onChange('to', event.target.value)}
                />
            </div>
        </section>
    );
}
