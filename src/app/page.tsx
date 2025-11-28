'use client';

import siteConfig from '@/config/config';
import Hero from '@/components/Hero';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const animatedText = siteConfig.animatedText;
  const books = siteConfig.books;
  // Use order defined in siteConfig.books (config.ts)

  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % animatedText.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [animatedText]);

  return (
    <div className="py-12">
      {/* Hero Section */}
      <motion.section
        id="home"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Hero animatedText={animatedText[textIndex]} />
      </motion.section>

      {/* Research Section */}
      <motion.section
        id="research"
        className="my-16"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center mb-8">Research Interests</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {siteConfig.research.map((res, index) => (
            <motion.div
              key={index}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              {res.title}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Books Section */}
      <motion.section
        id="books"
        className="my-16"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center mb-8">Books</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {(books ?? []).slice(0, 2).map((book, index: number) => (
            <motion.div
              key={index}
              className="flex flex-col sm:flex-row bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <Image
                src={book.image}
                alt={book.title}
                width={200}
                height={300}
                className="rounded-l-lg object-cover w-full sm:w-1/3 h-48 sm:h-auto"
                onError={() => console.error(`Failed to load book image: ${book.image}`)}
              />
              <div className="p-6 flex-1">
                <h3 className="text-xl font-semibold mb-2">{book.title}</h3>
                <p className="text-lg mb-4">{book.description}</p>
                <Link
                  href={book.link}
                  className="text-blue-500 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Know More
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Projects Section */}
      <motion.section
        id="projects"
        className="my-16"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center mb-8">Projects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {siteConfig.projects.map((project, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
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
              <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
              <p className="text-lg mb-4">{project.description}</p>
              {project.Githublink && (
                <Link
                  href={project.Githublink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline mt-auto"
                >
                  View Project →
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
