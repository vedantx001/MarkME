// src/components/landing/Features.jsx
import React from 'react';
import { ScanFace, FileSpreadsheet, BarChart3, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Features = () => {
    const features = [
        {
            icon: ScanFace,
            title: "Face Recognition",
            desc: "Advanced AI algorithms that work even in varied lighting conditions."
        },
        {
            icon: FileSpreadsheet,
            title: "Bulk Upload",
            desc: "Quickly import student data using standard Excel or CSV templates."
        },
        {
            icon: BarChart3,
            title: "Analytics",
            desc: "Visual reports and trends to track student regularity automatically."
        },
        {
            icon: Lock,
            title: "Secure Access",
            desc: "Role-based permissions for Admins, Teachers, and Principals."
        }
    ];

    return (
        <section id="features" className="py-24 px-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="heading-font text-3xl md:text-4xl font-bold text-[#2D3748] mb-4"
                    >
                        Key Features
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-600"
                    >
                        Powerful tools designed for educational excellence.
                    </motion.p>
                </div>
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                            key={index}
                            className="bg-[#F2F8FF] rounded-xl p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.08)] transition-all duration-200"
                        >
                            <div className="w-12 h-12 bg-[#85C7F2]/20 rounded-lg flex items-center justify-center mb-6">
                                <feature.icon className="w-6 h-6 text-[#2D3748]" />
                            </div>
                            <h3 className="heading-font text-lg font-bold mb-3 text-[#2D3748]">{feature.title}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed font-sans">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Features;
