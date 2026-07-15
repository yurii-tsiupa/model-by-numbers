"use client";

import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Loader } from "@/components/ui/Loader";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { GuidePreview } from "@/features/guides/components/GuidePreview";
import { useDeleteGeneratedGuide } from "@/features/guides/hooks/useDeleteGeneratedGuide";
import { useGeneratedGuide } from "@/features/guides/hooks/useGeneratedGuides";
import { useProject } from "@/features/models/hooks/useProject";

export default function SavedGuidePage() {
  const params = useParams<{ projectId: string; guideId: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const projectQuery = useProject(params.projectId, user?.uid);
  const guideQuery = useGeneratedGuide(params.guideId);
  const deletion = useDeleteGeneratedGuide(params.projectId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => { if (!authLoading && !user) router.replace("/login"); }, [authLoading, router, user]);

  if (authLoading || !user || projectQuery.isLoading || guideQuery.isLoading) return <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white"><Loader label="Loading saved guide..." /></main>;

  const project = projectQuery.data;
  const guide = guideQuery.data;
  const unavailable = projectQuery.isError || guideQuery.isError || !project || project.userId !== user.uid || !guide || guide.projectId !== params.projectId;
  if (unavailable) return <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white"><section className="max-w-md rounded-3xl border border-white/10 p-8 text-center"><FileQuestion className="mx-auto h-7 w-7 text-orange-400" /><h1 className="mt-4 text-xl font-semibold">Saved guide not found</h1><p className="mt-2 text-sm leading-6 text-neutral-500">This guide is not available in this browser, or you do not have access to its project.</p><Link href={`/models/${params.projectId}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-950"><ArrowLeft className="h-4 w-4" />Back to Editor</Link></section></main>;

  return <><GuidePreview guide={guide.snapshot} savedFileName={guide.fileName} savedPdfBlob={guide.pdfBlob} skipSave onDelete={() => setConfirmDelete(true)} /><ConfirmationModal isOpen={confirmDelete} title={`Delete Guide v${guide.version}?`} description="This locally saved guide and its PDF will be permanently removed from this browser." confirmLabel="Delete Guide" variant="danger" isLoading={deletion.isPending} onClose={() => setConfirmDelete(false)} onConfirm={() => deletion.mutate(guide.id, { onSuccess: () => router.push(`/models/${params.projectId}`) })} /></>;
}
