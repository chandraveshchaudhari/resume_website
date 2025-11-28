import siteConfig from "@/config/config";
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 py-4 mt-12">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} {siteConfig.personal.name}. All rights reserved.</p>
        <p className="mt-2">
          <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-blue-500 mx-2">Email</a> |
          <Link href={siteConfig.contact.linkedin} className="hover:text-blue-500 mx-2">LinkedIn</Link> |
          <Link href={siteConfig.contact.github} className="hover:text-blue-500 mx-2">GitHub</Link>
        </p>
      </div>
    </footer>
  );
}