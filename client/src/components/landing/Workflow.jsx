import React from 'react';
import { Database, Users, Cpu, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Workflow = () => {
    return (
        <section id="workflow" className="py-24 px-6 bg-[#F2F8FF]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="heading-font text-3xl font-bold text-[#2D3748] mb-4"
                    >
                        Unified System Workflow
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 max-w-xl mx-auto"
                    >
                        Seamless integration from administration to daily operational delivery.
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
                    className="grid md:grid-cols-4 gap-8 relative"
                >
                    {/* Step 1 */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="flex flex-col items-center text-center group">
                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 group-hover:shadow-md transition-shadow">
                            <Database className="text-[#2D3748]" size={24} />
                        </div>
                        <h3 className="heading-font font-bold mb-2">Admin</h3>
                        <p className="text-sm text-gray-500">Centralized student & staff enrollment</p>
                    </motion.div>

                    {/* Step 2 */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="flex flex-col items-center text-center group">
                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 group-hover:shadow-md transition-shadow">
                            <Users className="text-[#2D3748]" size={24} />
                        </div>
                        <h3 className="heading-font font-bold mb-2">Staff</h3>
                        <p className="text-sm text-gray-500">One-tap session initialization</p>
                    </motion.div>

                    {/* Step 3 */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="flex flex-col items-center text-center group">
                        <div className="w-16 h-16 rounded-full bg-[#85C7F2]/10 shadow-sm flex items-center justify-center mb-6 group-hover:shadow-md transition-shadow">
                            <Cpu className="text-[#2D3748]" size={24} />
                        </div>
                        <h3 className="heading-font font-bold mb-2">AI Engine</h3>
                        <p className="text-sm text-gray-500">Instant facial mapping & verification</p>
                    </motion.div>

                    {/* Step 4 */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="flex flex-col items-center text-center group">
                        <div className="w-16 h-16 rounded-full bg-[#2D3748] shadow-sm flex items-center justify-center mb-6 group-hover:shadow-md transition-shadow">
                            <CheckCircle2 className="text-[#85C7F2]" size={24} />
                        </div>
                        <h3 className="heading-font font-bold mb-2">Reports</h3>
                        <p className="text-sm text-gray-500">Automated ledger & MIS generation</p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Workflow;
