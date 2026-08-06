import type { ButtonHTMLAttributes } from 'react';
import './button.css';

type Variant = 'primary' | 'ghost' | 'danger' | 'quiet';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className = '', ...rest }: Props) {
  return <button className={`btn btn--${variant} btn--${size} ${className}`} {...rest} />;
}
