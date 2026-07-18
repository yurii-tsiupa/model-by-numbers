export function ProfileSectionHeader({ title, description }: { title: string; description?: string }) {
  return <header className="border-b border-[var(--border)] pb-5"><h1 className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-[var(--text)]">{title}</h1>{description?<p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{description}</p>:null}</header>;
}
