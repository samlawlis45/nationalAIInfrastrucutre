"use client";

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

const DEMOS = [
  { 
    name: "Well-to-Inference Calculator", 
    description: "Full lifecycle carbon accounting", 
    href: "/demo/well-to-inference" 
  },
  { 
    name: "Curtailment Capture", 
    description: "Route to renewable peaks", 
    href: "/demo/curtailment-capture" 
  },
  { 
    name: "Carbon-Aware Routing", 
    description: "Multi-region dispatch", 
    href: "/demo/carbon-aware-routing" 
  },
  { 
    name: "GeoGate", 
    description: "AI capability governance", 
    href: "/demo/geogate",
    className: "text-purple-400"
  },
  { 
    name: "Authenticity Gate", 
    description: "Deepfake governance", 
    href: "/demo/authenticity-gate",
    className: "text-amber-400"
  },
  { 
    name: "Attribution Lineage", 
    description: "Provenance & royalties", 
    href: "/demo/attribution-lineage" 
  },
  { 
    name: "Grid to Supply", 
    description: "Supply chain orchestration", 
    href: "/demo/grid2supply",
    className: "text-cyan-400",
    borderTop: true
  },
  { 
    name: "BIOLOOP-RNG", 
    description: "Circular attribution for agriculture", 
    href: "/demo/bioloop-rng",
    className: "text-emerald-400"
  },
  { 
    name: "Grid to Care", 
    description: "Rural health microgrids", 
    href: "/demo/grid-to-care",
    className: "text-red-400"
  },
  { 
    name: "AQUATREATY", 
    description: "Constitutional water control plane", 
    href: "/demo/aquatreaty",
    className: "text-cyan-400"
  },
  { 
    name: "AthleteGate", 
    description: "NIL governance for college sports", 
    href: "/demo/athletegate",
    className: "text-blue-400"
  }
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
    <nav className="bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link href="/" className="text-blue-400 font-bold text-xl tracking-tight">
              National AI Infrastructure
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <button onClick={() => scrollToSection('genesis')} className="text-slate-300 hover:text-white text-sm transition-colors">
                Genesis Alignment
              </button>
              
              <button onClick={() => scrollToSection('technology')} className="text-slate-300 hover:text-white text-sm transition-colors">
                Technology
              </button>
              
              {/* Dropdown */}
              <div className="relative group">
                <button 
                    className="text-slate-300 group-hover:text-white text-sm flex items-center gap-1 transition-colors"
                    onClick={() => setIsDemoOpen(!isDemoOpen)}
                    onMouseEnter={() => setIsDemoOpen(true)}
                >
                  Demos
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {/* Dropdown Content */}
                <div 
                    className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
                    onMouseLeave={() => setIsDemoOpen(false)}
                >
                  {DEMOS.map((demo, index) => (
                    <Link
                      key={demo.name}
                      href={demo.href}
                      className={`block px-4 py-3 hover:bg-slate-800 ${index === 0 ? 'rounded-t-lg' : ''} ${index === DEMOS.length - 1 ? 'rounded-b-lg' : ''} ${demo.borderTop ? 'border-t border-slate-700' : ''}`}
                    >
                      <div className="font-medium text-white">{demo.name}</div>
                      <div className="text-xs text-white">{demo.description}</div>
                    </Link>
                  ))}
                </div>
              </div>

              <button onClick={() => scrollToSection('contact')} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition text-white">
                Contact
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-slate-900 inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
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
                className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Genesis Alignment
            </button>
            <button 
                onClick={() => scrollToSection('technology')}
                className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Technology
            </button>
            <div className="px-3 py-2 text-slate-500 font-medium text-sm">Demos</div>
            {DEMOS.map((demo) => (
                <Link
                    key={demo.name}
                    href={demo.href}
                    className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium pl-6"
                    onClick={() => setIsOpen(false)}
                >
                    {demo.name}
                </Link>
            ))}
            <button 
                onClick={() => scrollToSection('contact')}
                className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Contact
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
