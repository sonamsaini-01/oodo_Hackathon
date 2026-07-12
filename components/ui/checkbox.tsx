
'use client';

import React, { useState, useId } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({
  className,
  checked,
  onCheckedChange,
  ...props
}: CheckboxProps) {
  const id = useId();
  const [internalChecked, setInternalChecked] = useState(false);

  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    onCheckedChange?.(newChecked);
  };

  return (
    <div className="relative">
      <input
        type="checkbox"
        id={id}
        checked={currentChecked}
        onChange={handleChange}
        className="peer sr-only"
        {...props}
      />
      <div
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-md border-2 border-[#E2E8F0] bg-white transition-all',
          currentChecked && 'border-[#2563EB] bg-[#2563EB]',
          'hover:border-[#2563EB]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2',
          className
        )}
      >
        {currentChecked && (
          <svg
            className="h-3.5 w-3.5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
    </div>
  );
}

