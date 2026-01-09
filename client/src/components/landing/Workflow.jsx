// src/components/landing/Workflow.jsx
import React from 'react';
import { Database, Users, Cpu, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Workflow = () => {
    const steps = [
        {
            icon: Database,
            title: "Admin",
            desc: "Centralized management of schools, classes, teachers, and student records.",
            color: "bg-white",
            iconColor: "text-[#2D3748]"
        },
        {
            icon: Users,
            title: "Teacher",
            desc: "Teachers capture classroom images to initiate daily attendance.",
            color: "bg-white",
            iconColor: "text-[#2D3748]"
        },
        {
            icon: Cpu,
            title: "AI Engine",
            desc: "Automated face recognition to identify students and mark attendance accurately.",
            color: "bg-[#85C7F2]/50",
            iconColor: "text-[#2D3748]"
        },
        {
            icon: CheckCircle2,
            title: "Reports",
            desc: "System‑generated attendance records and downloadable monthly reports.",
            color: "bg-[#2D3748]",
            iconColor: "text-[#85C7F2]"
        }
    ];

    return (
        <section id="workflow" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-[#F2F8FF] relative overflow-hidden">
            {/* Abstract Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#85C7F2]/20 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#85C7F2]/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="heading-font text-4xl font-bold text-[#2D3748] mb-4"
                    >
                        End‑to‑End Attendance Workflow
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 max-w-xl mx-auto text-lg"
                    >
                        A structured and transparent workflow connecting administration, classrooms, and automated attendance processing.
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
                            transition: { staggerChildren: 0.25 }
                        }
                    }}
                    className="grid md:grid-cols-4 gap-12 relative"
                >
                    {/* SVG Connector Line (Visible on Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 border-t-2 border-dashed border-[#85C7F2]/30 -z-10" />

                    {steps.map((step, index) => (
                        <motion.div 
                            key={index}
                            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }} 
                            className="relative flex flex-col items-center text-center group"
                        >
                            {/* Number Badge */}
                            <div className="absolute -top-4 bg-white border border-[#85C7F2]/30 text-[#2D3748] w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm z-20 group-hover:bg-[#85C7F2] group-hover:text-white transition-colors duration-300">
                                0{index + 1}
                            </div>

                            {/* Icon Container */}
                            <div className={`w-24 h-24 rounded-3xl ${step.color} shadow-lg flex items-center justify-center mb-8 relative z-10 transform transition-all duration-500 group-hover:scale-110`}>
                                <step.icon className={step.iconColor} size={32} />
                            </div>

                            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-transparent group-hover:border-[#85C7F2]/20 group-hover:bg-white transition-all duration-300 shadow-sm group-hover:shadow-xl">
                                <h3 className="heading-font font-bold text-xl mb-3 text-[#2D3748]">{step.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Workflow;