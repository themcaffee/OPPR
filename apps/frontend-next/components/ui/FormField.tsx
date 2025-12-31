import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { Input } from './Input';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, id, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <Input ref={ref} id={id} error={error} {...props} />
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
