// src/app/education/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import siteConfig from "@/config/config";
import { getAsset } from "@/config/config";
import type { Certification } from "@/types";
import { getThumbnailPath } from "@/lib/cert-thumbnails";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* -------------------------------------------------------------------------- */
/*  Proper type for Specialization – NO `any`                                 */
/* -------------------------------------------------------------------------- */
type SubCertificate = {
  name: string;
  file: string;
};

type Specialization = {
  title: string;
  cardImage?: string;
  file?: string;
  certificates: SubCertificate[];
};

const isSpecialization = (cert: Certification): cert is Specialization =>
  "certificates" in cert && Array.isArray((cert as Specialization).certificates);

export default function EducationPage() {
  const allCerts = siteConfig.certifications ?? [];

  const [filter, setFilter] = useState<"all" | "specialization" | "individual">("all");
  const [selectedSpec, setSelectedSpec] = useState<Specialization | null>(null);

  const filteredCerts = allCerts.filter((cert) => {
    if (filter === "specialization") return isSpecialization(cert);
    if (filter === "individual") return !isSpecialization(cert) && "file" in cert;
    return true;
  });

  function CertificateThumb({ cert, alt }: { cert: Certification; alt: string }) {
    // Build a queue of candidate sources to try in order.
    const isImgPathLocal = (p?: string) => !!p && /\.(png|jpe?g|webp|avif|svg)$/i.test(p);

    const queue: string[] = [];

    // Try to get thumbnail for the certificate file (individual or first in specialization)
    let sourceFile: string | undefined;
    if (!isSpecialization(cert) && "file" in cert && cert.file) {
      sourceFile = cert.file;
    } else if (isSpecialization(cert) && cert.certificates.length > 0) {
      sourceFile = cert.certificates[0].file;
    }

    if (sourceFile) {
      // Extract just the filename (remove the /images/education/Certifications/ prefix if present)
      const filename = sourceFile.split('/').pop();
      if (filename) {
        const thumbPath = getThumbnailPath(filename);
        if (thumbPath) {
          queue.push(getAsset(thumbPath));
        }
      }
      // Also try the original if it's an image
      if (isImgPathLocal(sourceFile)) {
        queue.push(sourceFile);
      }
    }

    // Try cardImage if it exists and is a real image (not generic download)
    if (cert.cardImage && isImgPathLocal(cert.cardImage)) {
      queue.push(cert.cardImage);
    }

    // Final fallback: generic download icon
    queue.push(getAsset('images/education/Certifications/download.svg'));

    const [attempt, setAttempt] = useState(0);
    const src = queue[attempt] || getAsset('images/education/Certifications/download.svg');

    return (
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain rounded-lg"
        onError={() => {
          if (attempt < queue.length - 1) {
            setAttempt((a) => a + 1);
          }
        }}
      />
    );
  }

  return (
    <main className="py-12">
      {/* Formal Education Section */}
      <section className="mb-16">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Education
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6 md:px-12">
          {(siteConfig.education ?? []).map((edu, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-lg transition p-6 border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex flex-col items-center text-center">
                {edu.image && (
                  <div className="w-24 h-24 relative mb-4">
                    <Image
                      src={edu.image}
                      alt={edu.institution}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-2">{edu.degree}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{edu.institution}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">{edu.year}</p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  {edu.description.map((desc, i) => (
                    <li key={i} className="leading-relaxed">
                      {desc}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MOOCs & Certifications Section */}
      <section>
        <motion.h1
          className="text-4xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          MOOCs & Certifications
        </motion.h1>

        <div className="flex justify-center gap-4 mb-10">
          {(["all", "specialization", "individual"] as const).map((key) => (
            <Button
              key={key}
              variant={filter === key ? "default" : "outline"}
              onClick={() => setFilter(key)}
            >
              {key === "all"
                ? "All"
                : key === "specialization"
                ? "Specializations"
                : "Individual Courses"}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 md:px-12">
          {filteredCerts.map((cert, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-lg transition p-5 cursor-pointer border border-gray-200 dark:border-gray-700"
              onClick={() => {
                if (isSpecialization(cert)) {
                  setSelectedSpec(cert);
                } else if ("file" in cert) {
                  window.open(cert.file, "_blank");
                }
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 relative mb-4">
                  <CertificateThumb cert={cert} alt={cert.title} />
                </div>

                <h3 className="text-lg font-semibold mb-2">{cert.title}</h3>
                {isSpecialization(cert) ? (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">View specialization details</p>
                    {"file" in cert && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // open the combined specialization pdf if present
                          // cert is a specialization here
                          const s = cert as Specialization;
                          if (s.file) window.open(s.file, "_blank");
                        }}
                      >
                        View Full Specialization
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="link"
                    className="text-blue-600 dark:text-blue-400 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      if ("file" in cert) {
                        window.open(cert.file, "_blank");
                      }
                    }}
                  >
                    View Certificate
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {selectedSpec && (
          <Dialog open={!!selectedSpec} onOpenChange={() => setSelectedSpec(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedSpec.title}</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-3 mt-4">
                {selectedSpec.certificates.map((subCert, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <span>{subCert.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(subCert.file, "_blank")}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
              {selectedSpec.file && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="default"
                    onClick={() => window.open(selectedSpec.file, "_blank")}
                  >
                    View Full Specialization Certificate
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </section>
    </main>
  );
}