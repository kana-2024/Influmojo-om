'use client';

import { useEffect, useState } from 'react';

export default function EnvDebug() {
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    // Debug environment variables
    setEnvVars({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      // Add any other env vars you want to check
    });
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">Environment Variables Debug</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(envVars, null, 2)}
      </pre>
    </div>
  );
}
