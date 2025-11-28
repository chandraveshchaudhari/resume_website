'use client';

import siteConfig from '@/config/config';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Contact() {
  return (
    <div className="py-12 max-w-6xl mx-auto px-4">
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-center mb-8">Contact</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <p className="text-lg mb-4">
            <strong>Email:</strong>{' '}
            <a href={`mailto:${siteConfig.contact.email}`} className="text-blue-500 hover:underline">
              {siteConfig.contact.email}
            </a>
          </p>
          <p className="text-lg mb-4">
            <strong>LinkedIn:</strong>{' '}
            <Link href={siteConfig.contact.linkedin} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
              {siteConfig.contact.linkedin}
            </Link>
          </p>
          <p className="text-lg">
            <strong>GitHub:</strong>{' '}
            <Link href={siteConfig.contact.github} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
              {siteConfig.contact.github}
            </Link>
          </p>
        </div>
      </motion.section>
    </div>
  );
}