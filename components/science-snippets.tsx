"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchResearchPapers } from "@/app/actions";
import { ArrowDownCircle } from "lucide-react";

type ResearchPaper = {
  title: string;
  abstract: string;
  topic: string;
};

export default function ScienceSnippets() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [currentTopic, setCurrentTopic] = useState<string | undefined>();
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);

  const loadMorePapers = async () => {
    if (loading || !hasMore) return;
    
    try {
      setLoading(true);
      const response = await fetchResearchPapers(startIndex, currentTopic);
      
      setPapers(prev => [...prev, ...response.papers]);
      setHasMore(response.hasMore);
      setStartIndex(response.nextStart);
      setCurrentTopic(response.papers[0]?.topic);
      
    } catch (error) {
      console.error("Error loading papers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !loading && hasMore) {
      loadMorePapers();
    }
  }, [loading, hasMore]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0
    };

    observerRef.current = new IntersectionObserver(handleObserver, option);
    
    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  useEffect(() => {
    loadMorePapers();
  }, []);

  const formatPaper = (paper: ResearchPaper) => {
    return (
      <>
        <h2 className="text-xl font-bold mb-4 line-clamp-2">{paper.title}</h2>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Topic: {paper.topic}</p>
          <div className="space-y-2">
            <p className="font-semibold">Abstract:</p>
            <p className="text-sm">{paper.abstract}</p>
          </div>
        </div>
      </>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-2xl mx-auto h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth px-4"
    >
      <div className="py-4 space-y-4">
        {papers.map((paper, index) => (
          <div
            key={`${paper.title}-${index}`}
            className="snap-start min-h-[calc(100vh-2rem)] flex items-center"
          >
            <Card className="w-full">
              <CardContent className="p-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
                {formatPaper(paper)}
              </CardContent>
            </Card>
          </div>
        ))}
        
        <div 
          ref={loadingRef} 
          className="h-20 flex items-center justify-center snap-start"
        >
          {loading ? (
            <p className="text-center">Loading more papers...</p>
          ) : hasMore ? (
            <ArrowDownCircle className="animate-bounce" />
          ) : (
            <p className="text-center text-muted-foreground">No more papers to load</p>
          )}
        </div>
      </div>
    </div>
  );
}