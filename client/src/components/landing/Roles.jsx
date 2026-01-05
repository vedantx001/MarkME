// src/components/landing/Roles.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Roles = () => {
    return (
        <section id="roles" className="py-24 px-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="heading-font text-3xl md:text-4xl font-bold text-[#2D3748] mb-4"
                    >
                        Roles & Responsibilities
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-600"
                    >
                        Tailored experiences for every member of the institution.
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
                                staggerChildren: 0.2
                            }
                        }
                    }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    {/* Admin */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }} className="p-1 rounded-2xl bg-linear-to-b from-gray-200 to-transparent">
                        <div className="bg-white p-8 rounded-[calc(1rem-1px)] h-full shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="heading-font text-xl font-bold mb-4 text-[#2D3748]">The Admin</h3>
                            <ul className="space-y-4 text-sm text-gray-600 font-sans">
                                <li className="flex gap-2"><span>•</span> Manages school database and student enrollment.</li>
                                <li className="flex gap-2"><span>•</span> Oversees system health and technical setup.</li>
                                <li className="flex gap-2"><span>•</span> Assigns roles and permissions to staff.</li>
                            </ul>
                        </div>
                    </motion.div>
                    {/* Teacher */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }} className="p-1 rounded-2xl bg-linear-to-b from-[#85C7F2] to-transparent">
                        <div className="bg-white p-8 rounded-[calc(1rem-1px)] h-full shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="heading-font text-xl font-bold mb-4 text-[#2D3748]">The Teacher</h3>
                            <ul className="space-y-4 text-sm text-gray-600 font-sans">
                                <li className="flex gap-2"><span>•</span> Initiates classroom attendance via mobile/tablet.</li>
                                <li className="flex gap-2"><span>•</span> Validates exceptions (e.g., student late entry).</li>
                                <li className="flex gap-2"><span>•</span> Views immediate class attendance summaries.</li>
                            </ul>
                        </div>
                    </motion.div>
                    {/* Principal */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }} className="p-1 rounded-2xl bg-linear-to-b from-[#2D3748] to-transparent">
                        <div className="bg-white p-8 rounded-[calc(1rem-1px)] h-full shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="heading-font text-xl font-bold mb-4 text-[#2D3748]">The Principal</h3>
                            <ul className="space-y-4 text-sm text-gray-600 font-sans">
                                <li className="flex gap-2"><span>•</span> Monitors school-wide attendance metrics.</li>
                                <li className="flex gap-2"><span>•</span> Generates monthly reports for government audits.</li>
                                <li className="flex gap-2"><span>•</span> Tracks teacher and student punctuality trends.</li>
                            </ul>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Roles;
