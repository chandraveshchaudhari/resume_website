'use client';

import siteConfig from '@/config/config';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ExperiencePage() {
  const experience = siteConfig.experience;

  return (
    <main className="py-12">
      {/* Page Title */}
      <motion.h1
        className="text-4xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Experience
      </motion.h1>

      {/* Experience Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {experience.map((exp, index) => (
          <motion.div
            key={index}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Company/Institution Logo */}
            {exp.cardImage && (
              <div className="mb-4 flex justify-center">
                <Image
                  src={exp.cardImage}
                  alt={exp.title}
                  width={80}
                  height={80}
                  className="object-contain rounded-md"
                />
              </div>
            )}

            {/* Title / Role */}
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white text-center">
              {exp.title}
            </h2>

            {/* Place / Company */}
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
              {exp.place}
            </p>

            {/* Duration */}
            <p className="text-md text-gray-600 dark:text-gray-400 mb-2 text-center">
              {exp.time}
            </p>

            {/* Description */}
            {exp.desp && exp.desp.length > 0 && (
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-2">
                {exp.desp.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>
    </main>
  );
}
