"use client";

import type { User } from "firebase/auth";
import { Box, Plus } from "lucide-react";

import { SignOutButton } from "@/components/auth/SignOutButton";

type ModelsHeaderProps = {
  user: User;
  onNewProject: () => void;
};

export function ModelsHeader({
  user,
  onNewProject,
}: ModelsHeaderProps) {
  const fallbackLetter = (
    user.displayName ??
    user.email ??
    "U"
  )
    .charAt(0)
    .toUpperCase();

  return (
    <>
      <header className="border-b border-white/10">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
              <Box className="h-4 w-4 text-orange-400" />
            </div>

            <span className="hidden text-sm font-semibold tracking-tight text-white sm:block">
              Model by Numbers
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden text-right md:block">
              <p className="max-w-48 truncate text-sm font-medium text-white">
                {user.displayName ?? "User"}
              </p>

              <p className="max-w-48 truncate text-xs text-neutral-500">
                {user.email}
              </p>
            </div>

            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={user.displayName ?? "User avatar"}
                referrerPolicy="no-referrer"
                className="h-9 w-9 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-semibold text-white">
                {fallbackLetter}
              </div>
            )}

            <SignOutButton />
          </div>
        </div>
      </header>

      <section className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-medium text-orange-400">
              Workspace
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              My Models
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-400 sm:text-base">
              Manage your 3D models and build clear painting guides for
              every project.
            </p>
          </div>

          <button
            type="button"
            onClick={onNewProject}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
      </section>
    </>
  );
}