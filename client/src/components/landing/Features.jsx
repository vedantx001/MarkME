// src/components/landing/Features.jsx
import React from 'react';
import { ScanFace, FileSpreadsheet, BarChart3, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Features = () => {
    const features = [
        {
            icon: ScanFace,
            title: "Face Recognition",
            desc: "Advanced 512-D facial embedding recognition optimized for high-density classroom environments and variable lighting conditions."
        },
        {
            icon: FileSpreadsheet,
            title: "Institutional Data Ingestion",
            desc: "Seamless bulk enrollment via cloud-persistent Excel processing, enabling rapid institutional onboarding with zero local storage footprint."
        },
        {
            icon: BarChart3,
            title: "Predictive Analytics",
            desc: "Clear attendance summaries and trends to help teachers and school authorities monitor student attendance patterns."
        },
        {
            icon: Lock,
            title: "Secure Role-Based Access",
            desc: "Role‑based access control ensuring secure and appropriate system usage for administrators, teachers, and principals."
        }
    ];

    return (
        <section id="features" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 relative overflow-hidden bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="text-[#85C7F2] font-bold text-sm tracking-widest uppercase mb-3"
                    >
                        Capabilities
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="heading-font text-4xl md:text-5xl font-bold text-[#2D3748] mb-6"
                    >
                        Enterprise Infrastructure
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-600 max-w-2xl mx-auto text-lg"
                    >
                        Leveraging high-precision computer vision and secure cloud persistence to modernize institutional workflows.
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
                            transition: { staggerChildren: 0.15 }
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            variants={{ 
                                hidden: { opacity: 0, y: 30 }, 
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } 
                            }}
                            key={index}
                            className="group bg-[#F2F8FF] rounded-2xl p-10 border border-[#85C7F2]/10 hover:border-[#85C7F2]/40 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out"
                        >
                            <div className="w-14 h-14 bg-white rounded-xl shadow-inner flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[#85C7F2] transition-all duration-300">
                                <feature.icon className="w-7 h-7 text-[#2D3748] group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="heading-font text-xl font-bold mb-4 text-[#2D3748] leading-tight group-hover:text-[#85C7F2] transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed font-sans opacity-90">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Features;