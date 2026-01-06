import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

const Panel: React.FC<PanelProps> = ({
  children,
  title,
  actions,
  className = '',
  bodyClassName = '',
}) => {
  return (
    <section
      className={`rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-sm ${className}`}
    >
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-gray-200/70 dark:border-gray-800 flex items-center justify-between">
          {title && (
            <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">{title}</h3>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
    </section>
  );
};

export default Panel;
