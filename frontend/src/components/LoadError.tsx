import React from "react";
export default function LoadError({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="p-4 rounded-xl bg-error/10 border border-error/20 text-error flex gap-3 items-center"
    >
      <span>{message}</span>
      {retry && (
        <button
          className="ml-auto px-3 py-2 rounded-lg border border-error/30"
          onClick={retry}
        >
          Retry
        </button>
      )}
    </div>
  );
}
