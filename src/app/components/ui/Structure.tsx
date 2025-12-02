import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, children, className = "" }: SectionProps) {
  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-heading mb-8 border-b border-border pb-4">{title}</h2>
        {children}
      </div>
    </section>
  );
}

interface CardProps {
  category: string;
  title: string;
  description: string;
  onClick?: () => void;
}

export function Card({ category, title, description, onClick }: CardProps) {
  return (
    <article 
      onClick={onClick}
      className="group p-6 rounded-lg bg-bg-card border border-slate-800 hover:border-accent-blue transition-colors cursor-pointer h-full flex flex-col"
    >
      <div className="text-sm font-medium text-accent-blue mb-2 uppercase tracking-wider">
        {category}
      </div>
      <h3 className="text-xl font-semibold text-heading mb-3 group-hover:text-accent-cyan transition-colors">
        {title}
      </h3>
      <p className="text-text-muted leading-relaxed flex-grow">
        {description}
      </p>
    </article>
  );
}



