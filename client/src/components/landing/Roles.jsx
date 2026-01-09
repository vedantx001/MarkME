// src/components/landing/Roles.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, BookOpen, Building } from 'lucide-react';

const Roles = () => {
    const rolesData = [
        {
            title: "The Admin",
            icon: ShieldCheck,
            gradient: "from-gray-400",
            bulletColor: "bg-gray-400",
            items: [
                "Manages school setup, classes, teachers, and student records.",
                "Configures and maintains the attendance system for the institution.",
                "Assigns user roles and access permissions across the platform."
            ]
        },
        {
            title: "The Teacher",
            icon: BookOpen,
            gradient: "from-[#85C7F2]",
            bulletColor: "bg-[#85C7F2]",
            items: [
                "Captures classroom images using a mobile device to record daily attendance.",
                "Reviews and corrects attendance records when required.",
                "Accesses real‑time attendance summaries for assigned classes."
            ]
        },
        {
            title: "The Principal",
            icon: Building,
            gradient: "from-[#4A5568]",
            bulletColor: "bg-[#c4d7ed]",
            items: [
                "Monitors attendance records across all classes in the school.",
                "Accesses consolidated monthly attendance reports for administrative review.",
                "Reviews attendance trends to support academic planning and oversight."
            ]
        }
    ];

    return (
        <section id="roles" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="heading-font text-4xl md:text-5xl font-bold text-[#2D3748] mb-6"
                    >
                        Defined User Roles
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-600 text-lg max-w-2xl mx-auto"
                    >
                        Clearly defined access and responsibilities for each role within the school system.
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
                            transition: { staggerChildren: 0.2 }
                        }
                    }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-10"
                >
                    {rolesData.map((role, index) => (
                        <motion.div 
                            key={index}
                            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }} 
                            className={`p-[2px] rounded-3xl bg-linear-to-b ${role.gradient} to-transparent group hover:shadow-2xl hover:shadow-[#85C7F2]/10 transition-all duration-500`}
                        >
                            <div className="bg-white p-10 rounded-[calc(1.5rem-2px)] h-full flex flex-col">
                                {/* Role Header */}
                                <div className="flex items-center gap-4 mb-8">
                                    <div className={`p-3 rounded-xl ${role.bulletColor} bg-opacity-10 text-[#2D3748] group-hover:scale-110 transition-transform duration-300`}>
                                        <role.icon size={28} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="heading-font text-2xl font-bold text-[#2D3748]">{role.title}</h3>
                                </div>

                                {/* Role Responsibilities */}
                                <ul className="space-y-6 flex-1">
                                    {role.items.map((item, idx) => (
                                        <li key={idx} className="flex gap-4 group/item">
                                            <div className="mt-1.5 shrink-0">
                                                <div className={`w-2 h-2 rounded-full ${role.bulletColor} group-hover/item:scale-150 transition-transform`} />
                                            </div>
                                            <span className="text-[15px] text-gray-600 leading-relaxed font-sans">
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                
                                {/* Subtle Bottom Accent */}
                                <div className={`mt-10 h-1 w-12 rounded-full ${role.bulletColor} opacity-20`} />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Roles;