import type { ReactNode } from 'react';

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({
  children,
  className = '',
}: ContainerProps) {
  return (
    <div
      className={`w-full px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 ${className}`}
    >
      {children}
    </div>
  );
}