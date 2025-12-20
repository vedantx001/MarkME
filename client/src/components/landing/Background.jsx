import React from 'react';

const Background = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, rgba(45,55,72,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}></div>

        {/* Strategic Nodes */}
        <svg className="absolute inset-0 w-full h-full">
            <defs>
                <filter id="softGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Node Connections - Very Thin */}
            <line x1="15%" y1="20%" x2="25%" y2="45%" stroke="#85C7F2" strokeOpacity="0.05" strokeWidth="1" />
            <line x1="25%" y1="45%" x2="10%" y2="60%" stroke="#85C7F2" strokeOpacity="0.05" strokeWidth="1" />
            <line x1="80%" y1="15%" x2="70%" y2="35%" stroke="#85C7F2" strokeOpacity="0.05" strokeWidth="1" />
            <line x1="70%" y1="35%" x2="85%" y2="55%" stroke="#85C7F2" strokeOpacity="0.05" strokeWidth="1" />

            {/* Circular Nodes */}
            <circle cx="15%" cy="20%" r="6" fill="#85C7F2" fillOpacity="0.08" />
            <circle cx="25%" cy="45%" r="8" fill="#85C7F2" fillOpacity="0.06" />
            <circle cx="10%" cy="60%" r="5" fill="#85C7F2" fillOpacity="0.07" />
            <circle cx="80%" cy="15%" r="7" fill="#85C7F2" fillOpacity="0.08" />
            <circle cx="70%" cy="35%" r="9" fill="#85C7F2" fillOpacity="0.05" />
            <circle cx="85%" cy="55%" r="6" fill="#85C7F2" fillOpacity="0.07" />
            <circle cx="50%" cy="85%" r="10" fill="#85C7F2" fillOpacity="0.04" />
        </svg>
    </div>
);

export default Background;
