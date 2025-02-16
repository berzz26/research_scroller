import ScienceSnippets from "@/components/science-snippets"
import { BookOpen } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              ResearchFlow
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-xl">
             
            Swipe through abstracts from top researchers around the world.
          </p>
        </div>

        {/* Main Content */}
        <div className="flex justify-center">
          <ScienceSnippets />
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>Powered by arXiv API • Updated daily with new research</p>
        </footer>
      </div>
    </main>
  )
}