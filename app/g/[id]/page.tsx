export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-gold/60 font-display text-xl">Group: {id}</p>
    </main>
  );
}
