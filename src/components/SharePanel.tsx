"use client";

import { useState } from "react";
import html2canvas from "html2canvas";

interface SharePanelProps {
  title: string;
  elementRef: React.RefObject<HTMLDivElement | null>;
  description?: string;
}

export function SharePanel({ title, elementRef, description }: SharePanelProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!elementRef.current) return;

    setIsDownloading(true);
    try {
      // Add a small delay to ensure any hover states are cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(elementRef.current, {
        useCORS: true,
        allowTaint: true,
        height: elementRef.current.offsetHeight,
        width: elementRef.current.offsetWidth,
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `sablier-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareOnX = () => {
    const url = window.location.href;
    const text = description 
      ? `Check out ${title}: ${description} - Sablier Analytics Dashboard`
      : `Check out ${title} on the Sablier Analytics Dashboard`;
    
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        title="Download as image"
        aria-label="Download as image"
      >
        {isDownloading ? (
          <svg className="w-4 h-4 text-gray-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </button>
      
      <button
        onClick={handleShareOnX}
        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Share on X"
        aria-label="Share on X"
      >
        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>
    </div>
  );
}