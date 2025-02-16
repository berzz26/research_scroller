"use server";

import { DOMParser } from "xmldom";

// Define types for better type safety
type ResearchPaper = {
  title: string;
  abstract: string;
  topic: string;
};

type FetchResponse = {
  papers: ResearchPaper[];
  hasMore: boolean;
  nextStart: number;
};

const RESULTS_PER_PAGE = 5;

const topics = [
  "artificial intelligence",
  "machine learning",
  "computer vision",
  "natural language processing",
  "cybersecurity",
  "blockchain",
  "quantum computing",
  "computer graphics",
  "software engineering",
  "human-computer interaction",
];

export async function fetchResearchPapers(
  startIndex: number = 0,
  currentTopic?: string
): Promise<FetchResponse> {
  // Use the provided topic or select a random one
  const topic = currentTopic || topics[Math.floor(Math.random() * topics.length)];
  
  const apiUrl = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
    topic
  )}&start=${startIndex}&max_results=${RESULTS_PER_PAGE}&sortBy=submittedDate&sortOrder=descending`;

  try {
    const response = await fetch(apiUrl, {
      headers: { 
        "User-Agent": "Next.js Research Snippet Fetcher",
        // Add cache control headers to prevent stale data
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
      // Ensure fresh data on each request
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch research papers: ${response.statusText}`);
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const entries = Array.from(xmlDoc.getElementsByTagName("entry")) as Element[];
    
    if (entries.length === 0) {
      return {
        papers: [],
        hasMore: false,
        nextStart: startIndex
      };
    }

    const papers: ResearchPaper[] = entries.map((entry) => ({
      title: entry.getElementsByTagName("title")[0]?.textContent?.trim() ?? "Unknown Title",
      abstract: entry.getElementsByTagName("summary")[0]?.textContent?.trim() ?? "No abstract available.",
      topic: topic
    }));

    // Check if there might be more results
    const hasMore = entries.length === RESULTS_PER_PAGE;

    return {
      papers,
      hasMore,
      nextStart: startIndex + RESULTS_PER_PAGE
    };

  } catch (error) {
    console.error("Error fetching research papers:", error);
    throw new Error("Failed to fetch research papers. Please try again later.");
  }
}