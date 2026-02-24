"use client";

interface Props {
  iso: string;
}

export default function FormattedDate({ iso }: Props) {
  return (
    <>
      {new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}
    </>
  );
}
