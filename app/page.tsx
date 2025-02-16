import ScienceSnippets from "@/components/science-snippets"
import { BookOpen } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-4 md:py-8 flex flex-col min-h-[100dvh]">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center text-center mb-6 md:mb-12">
          <div className="flex items-center gap-3 mb-2 md:mb-4">
            <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              ResearchFlow
            </h1>
          </div>
          <p className="text-sm md:text-lg text-muted-foreground max-w-xl px-4">
            Discover cutting-edge computer science research papers with our infinite scrolling feed.
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex justify-center">
          <ScienceSnippets />
        </div>

        {/* Footer */}
        <footer className="py-2 md:py-4 text-center text-xs md:text-sm text-muted-foreground">
          <p>Powered by arXiv API • Updated daily</p>
        </footer>
      </div>
    </main>
  )
}