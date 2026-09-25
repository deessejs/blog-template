export function GlobalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto container px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <div className="relative border border-border bg-background rounded-none">
        {children}
      </div>
    </div>
  )
}
