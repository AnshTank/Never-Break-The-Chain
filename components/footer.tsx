export default function Footer() {
  return (
    <footer className="mt-16 py-8 border-t border-border bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-border"></div>
            <span className="text-xs text-muted-foreground/60">✨</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-border"></div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Built with ❤️ by{" "}
              <a
                href="https://anshtank.me"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-primary/50 hover:decoration-primary"
              >
                Ansh Tank
              </a>
            </p>
            <p className="text-xs text-muted-foreground/70">
              Never break the chain • Keep showing up • Make progress daily
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-border/50"></div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/40"></div>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-border/50"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
