"use client";

import { useQuery } from "@tanstack/react-query";

import { projectQueryKeys } from "../constants/project.constants";
import { getProjects } from "../services/projects.service";

export function useProjects(userId: string | undefined) {
  return useQuery({
    queryKey: projectQueryKeys.list(userId ?? ""),
    queryFn: () => getProjects(userId ?? ""),
    enabled: Boolean(userId),
  });
}