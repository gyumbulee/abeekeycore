interface WhatsAppButtonProps {
  variant?: 'dark' | 'light';
  className?: string;
}

const WHATSAPP_NUMBER = '2349066772894'; // 0906 677 2894 in international format, no leading 0
const WHATSAPP_MESSAGE = "Hi Abeekey, I'd like to know more about your services.";

export default function WhatsAppButton({ variant = 'dark', className = '' }: WhatsAppButtonProps) {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  const styles =
    variant === 'dark'
      ? 'text-white/75 hover:text-white'
      : 'text-navy-secondary hover:text-navy-primary';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Abeekey on WhatsApp"
      className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${styles} ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M12 3a9 9 0 0 0-7.75 13.5L3 21l4.6-1.21A9 9 0 1 0 12 3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 9.3c0-.6.5-1.1 1.1-1.1h.5c.3 0 .6.2.7.5l.6 1.6c.1.3 0 .6-.2.8l-.5.5c.4.9 1.1 1.6 2 2l.5-.5c.2-.2.5-.3.8-.2l1.6.6c.3.1.5.4.5.7v.5c0 .6-.5 1.1-1.1 1.1-3.3 0-6-2.7-6-6Z"
          fill="currentColor"
        />
      </svg>
      WhatsApp
    </a>
  );
}