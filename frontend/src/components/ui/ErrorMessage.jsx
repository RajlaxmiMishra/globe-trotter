import React from 'react';
export default function ErrorMessage({ message }) {
  if (!message) return null;
  return <p className="text-rose text-xs mt-1">{message}</p>;
}
