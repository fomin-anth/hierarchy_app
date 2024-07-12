import React, { InputHTMLAttributes } from 'react';

export const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = (
  props,
) => {
  return <input className="border-2 border-black rounded-md" {...props} />;
};
