import React, { useRef } from 'react';
import Button from '@/components/Button/Button';

interface FormProps<T> {
  initialValues: T;
  onSubmit: (formData: T) => void;
  submitButtonLabel: string;
}

export const Form = <T extends object>({
  initialValues,
  onSubmit,
  children,
  submitButtonLabel,
}: React.PropsWithChildren<FormProps<T>>) => {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) {
      return;
    }
    const formData = new FormData(formRef.current);
    const formDataObject = Object.keys(initialValues).reduce<T>(
      (acc: T, key) => {
        acc[key as keyof T] = (formData.get(key) ??
          initialValues[key as keyof T]) as T[keyof T];
        return acc;
      },
      initialValues,
    );
    onSubmit(formDataObject);
    formRef.current.reset();
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="flex flex-col">{children}</div>
      <Button type="submit">{submitButtonLabel}</Button>
    </form>
  );
};
