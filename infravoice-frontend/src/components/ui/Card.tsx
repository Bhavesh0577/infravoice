import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-(--color-surface) border border-(--color-card-border) rounded-xl shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx('px-6 py-4 border-b border-(--color-card-border)', className)}
      {...props}
    >
      {children}
    </div>
  );
};

const CardBody: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={clsx('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
};

const CardFooter: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx('px-6 py-4 border-t border-(--color-card-border) bg-gray-50 dark:bg-gray-800 rounded-b-xl', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export { Card, CardHeader, CardBody, CardFooter };
