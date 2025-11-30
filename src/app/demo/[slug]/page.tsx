import React from 'react';

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-bg-primary">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-heading mb-8 capitalize">
          Demo: {slug.replace(/-/g, ' ')}
        </h1>
        <div className="bg-bg-card border border-slate-800 rounded-lg p-12">
          <p className="text-xl text-text-muted mb-8">
            This is a placeholder for the <span className="text-accent-blue font-medium">{slug}</span> demo.
          </p>
          <p className="text-text-body">
            The specific content for this demo will be implemented soon.
          </p>
        </div>
      </div>
    </div>
  );
}

