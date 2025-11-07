/**
 * SKIP LINKS COMPONENT
 * Accessibility feature for keyboard navigation
 * Allows users to skip to main content
 */

interface SkipLink {
  href: string
  label: string
}

const skipLinks: SkipLink[] = [
  { href: '#main-content', label: 'Pular para conteúdo principal' },
  { href: '#navigation', label: 'Pular para navegação' },
  { href: '#footer', label: 'Pular para rodapé' },
]

export default function SkipLinks() {
  return (
    <div className="skip-links">
      {skipLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="skip-link"
          aria-label={link.label}
        >
          {link.label}
        </a>
      ))}

      <style>{`
        .skip-links {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
        }

        .skip-link {
          position: absolute;
          left: -9999px;
          top: 0;
          padding: 1rem 1.5rem;
          background-color: #8b5cf6;
          color: white;
          text-decoration: none;
          font-weight: 600;
          border-radius: 0 0 0.5rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: left 0.2s ease;
        }

        .skip-link:focus {
          left: 0;
          outline: 3px solid #fbbf24;
          outline-offset: 2px;
        }

        .skip-link:hover {
          background-color: #7c3aed;
        }
      `}</style>
    </div>
  )
}
