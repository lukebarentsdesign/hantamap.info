import { Github, Twitter, Mail } from "lucide-react";

interface FooterProps {
  lastUpdated?: Date;
}

export function Footer({ lastUpdated }: FooterProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">Hantavirus Tracker</h3>
            <p className="text-sm text-muted-foreground">
              Real-time monitoring of hantavirus outbreaks worldwide. Stay informed about confirmed cases and latest developments.
            </p>
          </div>

          {/* Sources */}
          <div>
            <h4 className="font-semibold mb-4">Data Sources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://www.who.int" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                  World Health Organization (WHO)
                </a>
              </li>
              <li>
                <a href="https://www.cdc.gov" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                  Centers for Disease Control (CDC)
                </a>
              </li>
              <li>
                <a href="https://hantaflow.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                  Hantaflow (CC BY 4.0)
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href="mailto:contact@example.com"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>
            {lastUpdated && (
              <p>Last updated: {formatDate(lastUpdated)}</p>
            )}
            <p>© {currentYear} Hantavirus Tracker. All rights reserved.</p>
          </div>

          <div className="flex gap-6">
            <a href="#" className="hover:text-accent transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              Disclaimer
            </a>
          </div>
        </div>

        {/* Attribution */}
        <div className="mt-8 pt-8 border-t border-border text-xs text-muted-foreground">
          <p>
            Data from <strong>Hantaflow</strong> is licensed under CC BY 4.0. This tracker aggregates information from WHO, CDC, and other public health sources for educational purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
