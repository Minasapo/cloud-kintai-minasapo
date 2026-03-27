export default function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.74rem] font-bold tracking-[0.04em] text-slate-500">
      {children}
    </p>
  );
}
