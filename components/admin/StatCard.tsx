type Props = {
  title: string;
  value: string | number;
};

export default function StatCard({ title, value }: Props) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg transition-all hover:border-red-500/40 hover:bg-zinc-900">
      <p className="text-sm text-zinc-400">{title}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">{value}</h2>
    </div>
  );
}
