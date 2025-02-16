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
  const initialLoadComplete = useRef(false);

  const loadMorePapers = async (isInitialLoad = false) => {
    if (loading || (!hasMore && !isInitialLoad)) return;
    
    try {
      setLoading(true);
      const response = await fetchResearchPapers(startIndex, currentTopic);
      
      setPapers(prev => [...prev, ...response.papers]);
      setHasMore(response.hasMore);
      setStartIndex(response.nextStart);
      setCurrentTopic(response.papers[0]?.topic);
      
      // Only scroll to top on initial load
      if (isInitialLoad && containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    } catch (error) {
      console.error("Error loading papers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !loading && hasMore && initialLoadComplete.current) {
      loadMorePapers(false);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    if (!initialLoadComplete.current) {
      loadMorePapers(true);
      initialLoadComplete.current = true;
    }

    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0
    };

    observerRef.current = new IntersectionObserver(handleObserver, option);
    
    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    // Remove this line that was resetting scroll position on every useEffect run
    // if (containerRef.current) {
    //   containerRef.current.scrollTop = 0;
    // }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  const formatPaper = (paper: ResearchPaper) => {
    return (
      <div className="flex flex-col h-full">
        <h2 className="text-base md:text-lg font-bold mb-2 md:mb-3 line-clamp-3">
          {paper.title}
        </h2>
        <div className="space-y-2 flex-1 overflow-y-auto">
          <p className="text-xs md:text-sm text-muted-foreground">
            Topic: {paper.topic}
          </p>
          <div className="space-y-1">
            <p className="font-medium text-xs md:text-sm">Abstract:</p>
            <p className="text-xs md:text-sm leading-relaxed">
              {paper.abstract}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-xl mx-auto h-[calc(100dvh-13rem)] md:h-[calc(100dvh-16rem)] overflow-y-auto scroll-smooth px-2 md:px-0"
    >
      <div className="space-y-4 pb-4">
        {papers.map((paper, index) => (
          <div
            key={`${paper.title}-${index}`}
            className="flex items-center mb-4"
          >
            <Card className="w-full shadow-md">
              <CardContent className="p-3 md:p-5 h-[calc(100dvh-15rem)] md:h-[calc(100dvh-18rem)] flex flex-col">
                {formatPaper(paper)}
              </CardContent>
            </Card>
          </div>
        ))}
        
        <div 
          ref={loadingRef} 
          className="h-12 flex items-center justify-center"
        >
          {loading ? (
            <p className="text-xs md:text-sm text-muted-foreground">Loading more papers...</p>
          ) : hasMore ? (
            <ArrowDownCircle className="w-5 h-5 md:w-6 md:h-6 animate-bounce text-muted-foreground" />
          ) : (
            <p className="text-xs md:text-sm text-muted-foreground">No more papers to load</p>
          )}
        </div>
      </div>
    </div>
  );
}