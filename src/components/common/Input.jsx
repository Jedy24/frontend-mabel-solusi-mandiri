export default function Input({ id, label, error, children, ...props }) {
    const accessibility = {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? id + '-error' : undefined
    };

    return (
        <div className="field">
            <label htmlFor={id}>{label}</label>
            {children ? (
                <select {...accessibility} {...props}>
                    {children}
                </select>
            ) : (
                <input {...accessibility} {...props} />
            )}
            {error && (
                <span id={id + '-error'} className="field-error">
                    {error}
                </span>
            )}
        </div>
    );
}
