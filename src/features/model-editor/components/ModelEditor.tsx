import type { Project } from "@/features/models/types/Project";

import { EditorHeader } from "./EditorHeader";
import { ModelViewer } from "./ModelViewer";
import { PartsSidebar } from "./PartsSidebar";

type ModelEditorProps = {
  project: Project;
  userId: string;
};

export function ModelEditor({
  project,
  userId,
}: ModelEditorProps) {
  return (
    <main className="flex min-h-screen flex-col overflow-hidden bg-neutral-950 text-white">
      <EditorHeader project={project} />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <PartsSidebar />

        <ModelViewer
          project={project}
          userId={userId}
        />
      </div>
    </main>
  );
}