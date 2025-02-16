"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchResearchPapers } from "@/app/actions";
import { ArrowDownCircle, ChevronDown, ChevronUp } from "lucide-react";

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
  const [currentPaperIndex, setCurrentPaperIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const paperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);
  const initialLoadComplete = useRef(false);

  const loadMorePapers = async (isInitialLoad = false) => {
    if (loading || (!hasMore && !isInitialLoad)) return;
  
    try {
      setLoading(true);
      
      // Save the current scroll position
      const prevPaper = paperRefs.current[currentPaperIndex];
      const prevOffset = prevPaper?.getBoundingClientRect().top ?? 0;
  
      const response = await fetchResearchPapers(startIndex, currentTopic);
      
      setPapers(prev => [...prev, ...response.papers]);
      setHasMore(response.hasMore);
      setStartIndex(response.nextStart);
      setCurrentTopic(response.papers[0]?.topic);
  
      // Adjust refs array length when papers change
      paperRefs.current = paperRefs.current.slice(0, papers.length + response.papers.length);
  
      // Restore scroll position
      setTimeout(() => {
        if (prevPaper) {
          const newOffset = prevPaper.getBoundingClientRect().top;
          const scrollAdjustment = newOffset - prevOffset;
          containerRef.current?.scrollBy({ top: scrollAdjustment, behavior: "instant" });
        }
      }, 100);
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

    // Ensure we start at the top of the container on first render
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  // Track when the user manually scrolls to stop automatic behavior
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      // Find which paper is most visible
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;
      
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      paperRefs.current.forEach((paperRef, index) => {
        if (paperRef) {
          const paperRect = paperRef.getBoundingClientRect();
          const paperCenter = paperRect.top + paperRect.height / 2;
          const distance = Math.abs(containerCenter - paperCenter);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        }
      });
      
      if (currentPaperIndex !== closestIndex) {
        setCurrentPaperIndex(closestIndex);
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentPaperIndex, papers.length]);

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

  const scrollToPaper = (index: number) => {
    if (index >= 0 && index < papers.length && paperRefs.current[index]) {
      paperRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      setCurrentPaperIndex(index);
    }
  };

  const goToNextPaper = () => {
    if (currentPaperIndex < papers.length - 1) {
      scrollToPaper(currentPaperIndex + 1);
    } else if (hasMore && !loading) {
      // Load more papers if we're at the end
      loadMorePapers(false).then(() => {
        // After loading, go to the next paper
        setTimeout(() => scrollToPaper(currentPaperIndex + 1), 300);
      });
    }
  };

  const goToPrevPaper = () => {
    if (currentPaperIndex > 0) {
      scrollToPaper(currentPaperIndex - 1);
    }
  };

  // Setup intersection observers for each paper to detect when it's in center view
  useEffect(() => {
    const setupPaperObservers = () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      // Only observe the loading element for infinite loading
      if (loadingRef.current) {
        observerRef.current?.observe(loadingRef.current);
      }
    };
    
    setupPaperObservers();
  }, [papers.length]);

  return (
    <div className="relative w-full max-w-xl mx-auto h-[calc(100dvh-13rem)] md:h-[calc(100dvh-16rem)] overflow-hidden px-2 md:px-0">
      <div 
        ref={containerRef}
        className="snap-y snap-mandatory h-full overflow-y-auto scroll-smooth"
      >
        {papers.map((paper, index) => (
          <div
            key={`${paper.title}-${index}`}
            ref={el => {
              paperRefs.current[index] = el;
            }}
            className="snap-start flex items-center justify-center h-full py-2"
          >
            <Card className="w-full shadow-md">
              <CardContent className="p-3 md:p-5 h-[calc(100dvh-16rem)] md:h-[calc(100dvh-19rem)] flex flex-col">
                {formatPaper(paper)}
                
                <div className="mt-3 pt-2 border-t flex justify-between">
                  <p className="text-xs text-muted-foreground">
                    {index + 1} of {papers.length}{hasMore ? "+" : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        
        <div 
          ref={loadingRef} 
          className="h-12 flex items-center justify-center snap-start"
        >
          {loading ? (
            <p className="text-xs md:text-sm text-muted-foreground">Loading more papers...</p>
          ) : hasMore ? (
            <ArrowDownCircle className="w-5 h-5 md:w-6 md:h-6 animate-bounce text-muted-foreground" />
          ) : (
            <p className="text-xs md:text-sm text-muted-foreground">No more papers to load, please refresh</p>
          )}
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="absolute bottom-4 right-4 md:right-8 flex flex-col space-y-2">
        <button 
          onClick={goToPrevPaper}
          disabled={currentPaperIndex === 0}
          className="p-2 rounded-full bg-primary/80 text-primary-foreground disabled:opacity-30"
          aria-label="Previous paper"
        >
          <ChevronUp className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button 
          onClick={goToNextPaper}
          disabled={!hasMore && currentPaperIndex === papers.length - 1}
          className="p-2 rounded-full bg-primary/80 text-primary-foreground disabled:opacity-30"
          aria-label="Next paper"
        >
          <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );
}