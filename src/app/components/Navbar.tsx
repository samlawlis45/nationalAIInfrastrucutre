"use client";

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

const DEMOS = [
  { name: "Well-to-Inference", href: "/demo/well-to-inference" },
  { name: "Curtailment Capture", href: "/demo/curtailment-capture" },
  { name: "Carbon-Aware Routing", href: "/demo/carbon-aware-routing" },
  { name: "Attribution Lineage", href: "/demo/attribution-lineage" },
  { name: "Grid to Supply", href: "/demo/grid2supply" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-heading font-bold text-xl tracking-tight">
              National AI Infrastructure
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button onClick={() => scrollToSection('genesis')} className="text-text-body hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Genesis Alignment
              </button>
              
              <button onClick={() => scrollToSection('technology')} className="text-text-body hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Technology
              </button>
              
              {/* Dropdown */}
              <div className="relative group">
                <button 
                    className="text-text-body group-hover:text-white px-3 py-2 rounded-md text-sm font-medium inline-flex items-center transition-colors"
                    onClick={() => setIsDemoOpen(!isDemoOpen)}
                    onMouseEnter={() => setIsDemoOpen(true)}
                >
                  Demos
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                
                {/* Dropdown Content */}
                <div 
                    className="absolute left-0 mt-0 w-56 rounded-md shadow-lg bg-slate-900 ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left"
                    onMouseLeave={() => setIsDemoOpen(false)}
                >
                  <div className="py-1">
                    {DEMOS.map((demo) => (
                      <Link
                        key={demo.name}
                        href={demo.href}
                        className="block px-4 py-2 text-sm text-text-body hover:bg-slate-800 hover:text-white"
                      >
                        {demo.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={() => scrollToSection('contact')} className="text-text-body hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Contact
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-slate-900 inline-flex items-center justify-center p-2 rounded-md text-text-muted hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button 
                onClick={() => scrollToSection('genesis')}
                className="text-text-body hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Genesis Alignment
            </button>
            <button 
                onClick={() => scrollToSection('technology')}
                className="text-text-body hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Technology
            </button>
            <div className="px-3 py-2 text-text-muted font-medium">Demos</div>
            {DEMOS.map((demo) => (
                <Link
                    key={demo.name}
                    href={demo.href}
                    className="text-text-body hover:text-white block px-3 py-2 rounded-md text-base font-medium pl-6"
                    onClick={() => setIsOpen(false)}
                >
                    {demo.name}
                </Link>
            ))}
            <button 
                onClick={() => scrollToSection('contact')}
                className="text-text-body hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Contact
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
