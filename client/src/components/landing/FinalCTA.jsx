import React from 'react';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const FinalCTA = () => {
    return (
        <section className="py-32 px-6 text-center">
            <div className="max-w-3xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="heading-font text-4xl font-bold text-[#2D3748] mb-8"
                >
                    Modernize Your Institution Today.
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-500 mb-12 text-lg"
                >
                    Join the growing network of forward-thinking institutions implementing the highest standard of automated attendance.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <button className="px-10 py-4 bg-[#85C7F2] text-[#2D3748] font-bold rounded-xl shadow-lg shadow-[#85C7F2]/20 hover:-translate-y-1 transition-all cursor-pointer">
                        Book Official Presentation
                    </button>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <Shield size={16} className="text-green-500" />
                        GDPR & Privacy Compliant
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FinalCTA;
