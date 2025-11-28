'use client';

import React, { useRef } from 'react';
import siteConfig from '@/config/config';
import { useReactToPrint } from 'react-to-print';
import Image from 'next/image';

export default function ResumePage() {
  // ✅ define ref inside component
  const resumeRef = useRef<HTMLDivElement>(null);

  // ✅ useReactToPrint with contentRef
  const handlePrint = useReactToPrint({
    contentRef: resumeRef, // Pass the ref directly, not a callback
    documentTitle: `${siteConfig.personal.name}-Resume`,
    pageStyle: `
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `,
  });

  return (
    <div className="py-12 max-w-4xl mx-auto px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Resume</h1>

      <button
        onClick={handlePrint}
        className="mb-8 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Download PDF
      </button>

      <div
        ref={resumeRef}
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md print:bg-white print:text-black"
      >
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="w-24 h-24 relative mr-6">
            <Image
              src={siteConfig.personal.image}
              alt={siteConfig.personal.name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{siteConfig.personal.name}</h1>
            <p className="text-lg">{siteConfig.personal.title}</p>
            <p className="text-md text-gray-600 dark:text-gray-300">
              {siteConfig.personal.location}
            </p>
            <p className="text-md text-gray-600 dark:text-gray-300">
              Email: {siteConfig.contact.email}
            </p>
          </div>
        </div>

        {/* Summary */}
        {siteConfig.personal.tagline && (
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Summary</h2>
            <p>{siteConfig.personal.tagline}</p>
          </section>
        )}

        {/* Education */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Education</h2>
          {siteConfig.education.map((edu, idx) => (
            <div key={idx} className="mb-3">
              <h3 className="font-semibold">{edu.degree}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {edu.institution} | {edu.year}
              </p>
              {edu.description && (
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                  {edu.description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>

        {/* Experience */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Experience</h2>
          {siteConfig.experience.map((exp, idx) => (
            <div key={idx} className="mb-3">
              <h3 className="font-semibold">{exp.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {exp.place} | {exp.time}
              </p>
              <ul
                className="list-disc list-inside text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: exp.desp }}
              />
            </div>
          ))}
        </section>

        {/* Projects */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Projects</h2>
          {siteConfig.projects.map((project, idx) => (
            <div key={idx} className="mb-3">
              <h3 className="font-semibold">{project.title}</h3>
              <p>{project.description}</p>
              {project.Githublink && (
                <a
                  href={project.Githublink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  GitHub Link
                </a>
              )}
            </div>
          ))}
        </section>

        {/* Research */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Research</h2>
          {siteConfig.research.map((res, idx) => (
            <div key={idx} className="mb-3">
              <h3 className="font-semibold">{res.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {res.authors} | {res.conferences} | {res.researchYr}
              </p>
              <p>{res.abstract}</p>
              {res.link && (
                <a
                  href={res.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Read Paper
                </a>
              )}
            </div>
          ))}
        </section>

        {/* Books */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Books</h2>
          {siteConfig.books.map((book, idx) => (
            <div key={idx} className="mb-3">
              <h3 className="font-semibold">{book.title}</h3>
              <p>{book.description}</p>
              {book.link && (
                <a
                  href={book.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Know More
                </a>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}