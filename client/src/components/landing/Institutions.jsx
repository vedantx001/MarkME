import React from 'react';
import { CheckCircle2, School } from 'lucide-react';
import { motion } from 'framer-motion';

const Institutions = () => {
    return (
        <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="py-24 px-6 bg-[#2D3748] text-white rounded-[2rem] mx-6"
        >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
                <div className="flex-1">
                    <div className="text-[#85C7F2] font-bold tracking-widest text-xs uppercase mb-4">Resilience First</div>
                    <h2 className="heading-font text-4xl font-bold mb-6">Engineered for Challenging Environments</h2>
                    <p className="text-gray-300 mb-8 leading-relaxed">
                        We understand that technology must work everywhere, not just in urban tech hubs. Our system is optimized for low-bandwidth rural schools and high-traffic government offices.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3">
                            <CheckCircle2 size={18} className="text-[#85C7F2]" />
                            <span>Offline edge processing for rural connectivity</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle2 size={18} className="text-[#85C7F2]" />
                            <span>Zero-training UI for immediate staff adoption</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle2 size={18} className="text-[#85C7F2]" />
                            <span>Compatible with standard tablet and PC hardware</span>
                        </li>
                    </ul>
                </div>
                <div className="flex-1 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-full bg-[#85C7F2]/20 flex items-center justify-center">
                            <School className="text-[#85C7F2]" size={20} />
                        </div>
                        <div>
                            <div className="font-bold">Public Sector Ready</div>
                            <div className="text-xs text-gray-400">Trusted by 14+ State Departments</div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: "75%" }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-[#85C7F2]"
                            ></motion.div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                <div className="text-2xl font-bold text-[#85C7F2]">99.8%</div>
                                <div className="text-[10px] uppercase tracking-wider text-gray-400">Match Rate</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                <div className="text-2xl font-bold text-[#85C7F2]">0.4s</div>
                                <div className="text-[10px] uppercase tracking-wider text-gray-400">Latency</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
};

export default Institutions;
