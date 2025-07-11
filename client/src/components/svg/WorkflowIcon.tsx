import { cn } from '~/utils';

export default function WorkflowIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-black dark:text-white', className)}
      aria-hidden={true}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C13.1046 2 14 2.89543 14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2ZM12 8C14.2091 8 16 6.20914 16 4C16 1.79086 14.2091 0 12 0C9.79086 0 8 1.79086 8 4C8 6.20914 9.79086 8 12 8ZM4 10C5.10457 10 6 10.8954 6 12C6 13.1046 5.10457 14 4 14C2.89543 14 2 13.1046 2 12C2 10.8954 2.89543 10 4 10ZM4 16C6.20914 16 8 14.2091 8 12C8 9.79086 6.20914 8 4 8C1.79086 8 0 9.79086 0 12C0 14.2091 1.79086 16 4 16ZM20 10C21.1046 10 22 10.8954 22 12C22 13.1046 21.1046 14 20 14C18.8954 14 18 13.1046 18 12C18 10.8954 18.8954 10 20 10ZM20 16C22.2091 16 24 14.2091 24 12C24 9.79086 22.2091 8 20 8C17.7909 8 16 9.79086 16 12C16 14.2091 17.7909 16 20 16ZM12 18C13.1046 18 14 18.8954 14 20C14 21.1046 13.1046 22 12 22C10.8954 22 10 21.1046 10 20C10 18.8954 10.8954 18 12 18ZM12 24C14.2091 24 16 22.2091 16 20C16 17.7909 14.2091 16 12 16C9.79086 16 8 17.7909 8 20C8 22.2091 9.79086 24 12 24Z"
        fill="currentColor"
      />
      <path
        d="M8.5 6.5L6.5 9.5M17.5 6.5L15.5 9.5M6.5 14.5L8.5 17.5M15.5 14.5L17.5 17.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}