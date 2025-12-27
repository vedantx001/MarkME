// src/components/common/Loader.jsx

import { motion } from "framer-motion";

const Loader = ({ size = "medium", label = "" }) => {
  // Size mapping
  const dimensions = {
    small: "w-6 h-6 border-2",
    medium: "w-12 h-12 border-3",
    large: "w-20 h-20 border-4"
  };

  const currentSize = dimensions[size] || dimensions.medium;

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center">
        {/* Outer Pulsing Ring (Signal Effect) */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className={`${currentSize.split(' ')[0]} ${currentSize.split(' ')[1]} rounded-full bg-(--secondary-accent)/20 absolute`}
        />

        {/* Main Rotating Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className={`${currentSize} border-(--secondary-accent) border-t-transparent rounded-full z-10`}
        />

        {/* Inner Scanning Dot */}
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-2 h-2 rounded-full bg-(--secondary-accent) absolute"
        />
      </div>

      {/* Optional Label */}
      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-jakarta text-sm font-bold tracking-widest text-(--primary-accent) uppercase opacity-60"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
};

export default Loader;