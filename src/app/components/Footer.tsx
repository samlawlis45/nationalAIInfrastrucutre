import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-text-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
                <h2 className="text-3xl font-bold text-heading mb-2">The Next Era Begins Now.</h2>
                <p className="text-lg text-text-muted mb-6">Follow The Mission.</p>
                
                <Link href="/#contact" className="bg-accent-blue hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-md transition-colors inline-block">
                    Contact Us
                </Link>
            </div>
            
            <div className="text-right md:text-right">
                 <div className="text-sm text-text-muted">
                    <p><span className="text-accent-cyan cursor-pointer">AnchorTrust Holdings</span></p>
                    <p className="mt-2">&copy; {new Date().getFullYear()} AnchorTrust Holdings LLC</p>
                 </div>
            </div>
        </div>
      </div>
    </footer>
  );
}

