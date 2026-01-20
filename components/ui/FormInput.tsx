interface FormInputProps {
  label: string;
  type?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  className?: string;
}

export default function FormInput({
  label,
  type = "text",
  name,
  value,
  placeholder,
  required = false,
  disabled = false,
  options,
  onChange,
  className = ""
}: FormInputProps) {
  const baseClasses = "w-full px-3 py-2 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300";
  const inputClasses = disabled 
    ? `${baseClasses} bg-slate-600 text-slate-400 cursor-not-allowed`
    : `${baseClasses} bg-slate-700`;

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={inputClasses}
        >
          <option value="">Select {label.toLowerCase()}...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={inputClasses}
        />
      )}
    </div>
  );
}