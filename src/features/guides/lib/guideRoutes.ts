export const guideRoutes = {
  editor: (projectId: string) => `/models/${projectId}`,
  savedGuide: (projectId: string, guideId: string) => `/models/${projectId}/guides/${guideId}`,
} as const;
