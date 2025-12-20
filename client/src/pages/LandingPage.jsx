import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Workflow from '../components/landing/Workflow';
import Features from '../components/landing/Features';
import Institutions from '../components/landing/Institutions';
import Roles from '../components/landing/Roles';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#FDFBFF] text-[#0E0E11] selection:bg-[#85C7F2] selection:text-[#2D3748] font-['Inter']">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        .heading-font { font-family: 'Plus Jakarta Sans', sans-serif; }
        .cursor-pointer { cursor: pointer; }
      `}</style>

            <Navbar />
            <Hero />
            <Workflow />
            <Features />
            <Institutions />
            <Roles />
            <FinalCTA />
            <Footer />
        </div>
    );
};

export default LandingPage;
