'use client';

import siteConfig from '@/config/config';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function ProjectsPage() {
  const projects = siteConfig.projects;

  return (
    <main className="py-12">
      {/* Page Title */}
      <motion.h1
        className="text-4xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Projects
      </motion.h1>

      {/* Empty state */}
      {projects.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No projects available at the moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Project Image */}
              {project.cardImage && (
                <div className="mb-4 w-full h-40 relative rounded-md overflow-hidden">
                  <Image
                    src={project.cardImage}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Project Title */}
              <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                {project.title}
              </h2>

              {/* Project Description */}
              {project.description && (
                <p className="text-md text-gray-700 dark:text-gray-300 mb-4 flex-grow">
                  {project.description}
                </p>
              )}

              {/* Project Link */}
              {project.Githublink && (
                <Link
                  href={project.Githublink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium mt-auto"
                >
                  View Project →
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
