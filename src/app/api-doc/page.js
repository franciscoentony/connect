'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch('/api/doc/')
      .then((res) => res.json())
      .then((data) => setSpec(data));
  }, []);

  if(!spec) return <p>Carregando documentação...</p>;

  return (
  <div className="bg-white min-h-screen text-black p-4 m-0 bg-none!">
    <style jsx global>{`
      body {
        background-color: #ffffff !important;
        color: #000000 !important;
      }
    `}</style>
    <SwaggerUI spec={spec} />
  </div>
);
}