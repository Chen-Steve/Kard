interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="flex items-center justify-center h-screen text-red-500">
    {message}
  </div>
);

export default ErrorMessage; 