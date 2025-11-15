
"use client";

import Link from 'next/link';

export default function AllCode() {
  return (
    <div className="bg-gray-100 text-gray-900 font-sans p-8" dir="ltr">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">All Code Exported</h1>
        <p className="mb-8 text-lg">
          I have created a static <code>index.html</code> file for you. You can access it to easily copy all the project files.
        </p>
        <Link href="/index.html" legacyBehavior>
          <a 
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg text-xl font-semibold hover:bg-primary/90 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open All Code File
          </a>
        </Link>
         <p className="mt-4 text-sm text-muted-foreground">
          Right-click the link and choose "Save Link As..." to download the file directly.
        </p>
      </div>
    </div>
  );
}
