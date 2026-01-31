import { Linkedin, Github, Instagram, Coffee, Globe } from "lucide-react";

export default function Footer() {
  const links = [
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/anshtank9",
      icon: Linkedin,
      hoverColor: "#0077B5",
    },
    {
      name: "GitHub",
      url: "https://github.com/AnshTank",
      icon: Github,
      hoverColor: "#6e7681",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/mr._a_n_s_h_",
      icon: Instagram,
      hoverColor: "#E4405F",
    },
    {
      name: "Portfolio",
      url: "https://anshtank.me",
      icon: Globe,
      hoverColor: "#8B5CF6",
    },
    {
      name: "Buy me a Coffee",
      url: "https://buymeacoffee.com/anshtank9y",
      icon: Coffee,
      hoverColor: "#D4A574",
    },
  ];

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left: Creator Info */}
          <div className="flex flex-col items-center lg:items-start gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Crafted with ⚡ by</span>
              <a
                href="/feedback"
                className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent hover:from-purple-600 hover:via-blue-600 hover:to-purple-600 transition-all duration-500"
              >
                Ansh Tank
              </a>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500 text-center lg:text-left">
              Never break the chain • Keep showing up • Make progress daily
            </p>
          </div>

          {/* Right: Social Links */}
          <div className="flex flex-wrap justify-center gap-3">
            {links.map((link, index) => {
              const Icon = link.icon;
              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: "rgb(248 250 252 / 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${link.hoverColor}15`;
                    e.currentTarget.style.color = link.hoverColor;
                    e.currentTarget.style.borderColor = `${link.hoverColor}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgb(248 250 252 / 1)";
                    e.currentTarget.style.color = "";
                    e.currentTarget.style.borderColor = "";
                  }}
                >
                  <Icon className="w-4 h-4 transition-all duration-300 group-hover:scale-110" />
                  <span>{link.name}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Bottom: Legal Links & Copyright */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              <a href="/terms" className="text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                Terms of Service
              </a>
              <a href="/privacy" className="text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                Privacy Policy
              </a>
              <a href="/contact" className="text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                Contact Support
              </a>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              © {new Date().getFullYear()} Never Break The Chain. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
