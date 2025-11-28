'use client';

import { useState } from 'react';
import siteConfig from "@/config/config";
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

// ✅ TypeScript interface for research data
interface ResearchItem {
  title: string;
  journal?: string;
  link?: string;
  authors?: string;
  conferences?: string;
  researchYr?: number;
  year?: number;
  image?: string;
  abstract?: string;
  citation?: string | { vancouver?: string; apa?: string };
}

export default function ResearchPage() {
  const research: ResearchItem[] = siteConfig.research || [];

  // State for toggles: keys like "0-abstract" and "0-citation"
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = (index: number, type: 'abstract' | 'citation') => {
    const key = `${index}-${type}`;
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="py-12">
      <motion.h1
        className="text-4xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Research
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {research.map((res, index) => {
          const venue = res.journal ?? res.conferences ?? null;
          const year = res.researchYr ?? res.year ?? null;
          const hasImage = Boolean(res.image);

          return (
            <motion.article
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              whileHover={{ scale: 1.02 }}
              layout
              aria-labelledby={`research-title-${index}`}
            >
                {/* Optional image */}
                {hasImage && (
                    <div className="mb-4 h-40 w-full overflow-hidden rounded-md">
                        <Image
                            src={res.image ?? '/default-image.png'}
                            alt={res.title}
                            width={400}
                            height={250}
                            className="rounded-lg"
                        />
                    </div>
                )}


              <h2
                id={`research-title-${index}`}
                className="text-2xl font-semibold mb-2"
              >
                {res.title}
              </h2>

              {/* Optional authors */}
              {res.authors && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  <strong>Authors:</strong> {res.authors}
                </p>
              )}

              {/* Venue and year */}
              {venue && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>{venue}</strong>
                  {year ? ` • ${year}` : null}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-2">
                {/* Your original Read More link */}
                {res.link && (
                  <Link
                    href={res.link}
                    className="text-blue-500 hover:underline text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read More
                  </Link>
                )}

                {/* Abstract toggle */}
                {res.abstract && (
                  <button
                    onClick={() => toggle(index, 'abstract')}
                    aria-expanded={!!open[`${index}-abstract`]}
                    aria-controls={`abstract-${index}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {open[`${index}-abstract`] ? 'Hide Abstract' : 'Show Abstract'}
                  </button>
                )}

                {/* Citation toggle */}
                {res.citation && (
                  <button
                    onClick={() => toggle(index, 'citation')}
                    aria-expanded={!!open[`${index}-citation`]}
                    aria-controls={`citation-${index}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {open[`${index}-citation`] ? 'Hide Citation' : 'Show Citation'}
                  </button>
                )}
              </div>

              <div className="mt-3">
                <AnimatePresence initial={false}>
                  {open[`${index}-abstract`] && res.abstract && (
                    <motion.section
                      id={`abstract-${index}`}
                      key={`abstract-${index}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28 }}
                      className="overflow-hidden text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-md"
                      role="region"
                      aria-labelledby={`research-title-${index}`}
                    >
                      {res.abstract}
                    </motion.section>
                  )}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                  {open[`${index}-citation`] && res.citation && (
                    <motion.section
                      id={`citation-${index}`}
                      key={`citation-${index}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28 }}
                      className="overflow-hidden text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-md mt-3"
                      role="region"
                      aria-labelledby={`research-title-${index}`}
                    >
                      {typeof res.citation === 'string' ? (
                        <div>{res.citation}</div>
                      ) : (
                        <>
                          {res.citation.vancouver && (
                            <div className="mb-2">{res.citation.vancouver}</div>
                          )}
                          {res.citation.apa && (
                            <div className="mb-2">{res.citation.apa}</div>
                          )}
                        </>
                      )}
                    </motion.section>
                  )}
                </AnimatePresence>
              </div>
            </motion.article>
          );
        })}
      </div>
    </main>
  );
}
