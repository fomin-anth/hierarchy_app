import React, { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({ children, className, ...rest }) => (
  <button
    className={`${className ?? ''} lg:size-auto p-2 border border-gray-300 rounded-md`}
    {...rest}
  >
    {children}
  </button>
);

export default Button;
