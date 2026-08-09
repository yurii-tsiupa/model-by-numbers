import type { GuideTemplateSettings } from "@/features/templates/types/GuideLibraryTemplate";

import { GUIDE_SECTION_REGISTRY, type GuideSectionId } from "../config/guideSectionRegistry";
import type { GuideViewModel } from "./getGuideViewModel";
import type { GuideBrandContentPageLayout, GuideBrandPageLayout } from "../types/GuideBrandLayout";

const sourceFingerprintCache = new Map<string, string>();
const SOURCE_FINGERPRINT_CACHE_LIMIT = 96;

function fingerprintSource(source: string | null | undefined): string {
  if (!source) return "none";
  if (source.startsWith("blob:")) return "blob";
  const cached = sourceFingerprintCache.get(source);
  if (cached) return cached;
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const fingerprint = `${source.length}:${(hash >>> 0).toString(36)}`;
  sourceFingerprintCache.set(source, fingerprint);
  if (sourceFingerprintCache.size > SOURCE_FINGERPRINT_CACHE_LIMIT) {
    const oldest = sourceFingerprintCache.keys().next().value;
    if (oldest) sourceFingerprintCache.delete(oldest);
  }
  return fingerprint;
}

class SignatureBuilder {
  private hash = 2166136261;

  add(value: string | number | boolean | null | undefined): void {
    const text = value == null ? "∅" : String(value);
    for (let index = 0; index < text.length; index += 1) {
      this.hash ^= text.charCodeAt(index);
      this.hash = Math.imul(this.hash, 16777619);
    }
    this.hash ^= 31;
  }

  image(source: string | null | undefined): void {
    this.add(fingerprintSource(source));
  }

  value(): string {
    return (this.hash >>> 0).toString(36);
  }
}

function addTemplate(builder: SignatureBuilder, settings: GuideTemplateSettings): void {
  builder.add(settings.pageFormat);
  builder.add(settings.pageBackground);
  builder.add(settings.textColor);
  builder.add(settings.accentColor);
  builder.add(settings.headingFont);
  builder.add(settings.bodyFont);
  builder.add(settings.monoFont);
  builder.add(settings.dividerStyle);
  builder.add(settings.coverStyle);
  builder.add(settings.spacing);
  builder.add(settings.branding.enabled);
  builder.add(settings.branding.name);
  builder.image(settings.branding.logoUrl);
  builder.add(settings.branding.qrValue);
  for (const link of settings.branding.socialLinks) { builder.add(link.id); builder.add(link.platform); builder.add(link.url); builder.add(link.handle); }
}

function addPageBrandLayout(builder: SignatureBuilder, layout: GuideBrandPageLayout): void {
  for (const settings of Object.values(layout)) {
    builder.add(settings.visible);
    builder.add(settings.position);
    builder.add(settings.size);
    builder.add(settings.alignment);
    builder.add(settings.logoScale);
    builder.add(settings.qrScale);
  }
}

// Kept as a typed boundary so adding another content-page element cannot silently
// disappear from preview cache invalidation.
function addContentPageBrandLayout(builder: SignatureBuilder, layout: GuideBrandContentPageLayout): void {
  for (const settings of Object.values(layout)) { builder.add(settings.visible); builder.add(settings.position); }
}

export function getGuidePreviewSectionSignature(
  sectionId: GuideSectionId,
  viewModel: GuideViewModel,
  templateSettings: GuideTemplateSettings,
): string {
  const builder = new SignatureBuilder();
  const { guide } = viewModel;
  builder.add(sectionId);
  builder.add(viewModel.locale);
  addTemplate(builder, templateSettings);
  addContentPageBrandLayout(builder, templateSettings.branding.contentPagesLayout);
  const contentSectionId = GUIDE_SECTION_REGISTRY.find((section) => section.id === sectionId)?.contentSectionId;
  const relevantBackgroundIds = sectionId === "cover" ? (["cover"] as const) : contentSectionId ? [contentSectionId] : [];
  templateSettings.backgroundItems.forEach((background) => {
    if (background.scope.mode === "none") return;
    if (background.scope.mode === "sections" && !background.scope.sectionIds.some((id) => relevantBackgroundIds.includes(id as never))) return;
    builder.add(background.id); builder.add(background.scope.mode); builder.add(background.scope.mode === "sections" ? background.scope.sectionIds.join(",") : "all"); builder.add(background.opacity); builder.image(background.imageUrl);
  });

  if (sectionId === "cover") {
    builder.add(templateSettings.branding.ctaText);
    for (const link of templateSettings.branding.socialLinks) { builder.add(link.id); builder.add(link.platform); builder.add(link.url); builder.add(link.handle); }
    for (const link of templateSettings.branding.customLinks) { builder.add(link.id); builder.add(link.label); builder.add(link.url); }
    addPageBrandLayout(builder, templateSettings.branding.coverLayout);
    builder.add(guide.title); builder.add(guide.description); builder.add(guide.author);
    builder.add(guide.printerType); builder.add(guide.material); builder.add(guide.baseColor);
    builder.image(guide.images.painted ?? guide.images.base ?? guide.images.original ?? guide.images.numbers);
    builder.add(viewModel.metrics.stepCount); builder.add(viewModel.metrics.usedColorCount); builder.add(viewModel.metrics.targetCount);
    for (const section of viewModel.sections) { builder.add(section.id); builder.add(section.titleKey); }
  } else if (sectionId === "project-overview") {
    builder.add(guide.title); builder.add(guide.description); builder.add(guide.author);
    builder.add(guide.printerType); builder.add(guide.material); builder.add(guide.baseColor);
  } else if (sectionId === "legend") {
    builder.add(viewModel.targetMode);
  } else if (sectionId === "kit") {
    for (const item of viewModel.kitItems) {
      builder.add(item.id); builder.add(item.category); builder.add(item.source); builder.add(item.code); builder.add(item.quantity); builder.add(item.colorHex);
      builder.add(item.source === "default" ? item.nameKey : item.name);
    }
  } else if (sectionId === "model-views") {
    for (const view of viewModel.modelViews) { builder.add(view.id); builder.add(view.labelKey); builder.add(view.captionKey); builder.add(view.caption); builder.image(view.image); }
  } else if (sectionId === "palette") {
    for (const color of viewModel.usedPalette) { builder.add(color.id); builder.add(color.number); builder.add(color.name); builder.add(color.hex); builder.add(color.usageCount); }
  } else if (sectionId === "exploded-view") {
    builder.image(guide.explodedView?.image); builder.add(guide.explodedView?.labelsMode); builder.add(guide.explodedView?.partsCount);
  } else if (sectionId === "references") {
    for (const reference of viewModel.includedReferences) { builder.add(reference.id); builder.add(reference.name); builder.add(reference.type); builder.add(reference.caption); builder.image(reference.dataUrl); }
  } else if (sectionId === "parts-overview") {
    for (const part of viewModel.referencedParts) { builder.add(part.id); builder.add(part.number); builder.add(part.name); builder.add(part.colorNumber); builder.add(part.colorName); builder.add(part.colorHex); }
  } else if (sectionId === "painting-workflow") {
    for (const reference of guide.assetReferences ?? []) { if (reference.kind === "step-preview") { builder.add(reference.assetId); builder.add(reference.contentKey); } }
    for (const step of viewModel.paintingSteps) {
      builder.add(step.id); builder.add(step.order); builder.add(step.title); builder.add(step.instruction); builder.add(step.stageType); builder.add(step.targetSummary);
      builder.add(step.color?.id); builder.add(step.color?.number); builder.add(step.color?.name); builder.add(step.color?.hex);
      for (const preview of step.previews) { builder.add(preview.id); builder.add(preview.label); builder.add(preview.status); if (preview.status === "ready") { builder.add(preview.image.width); builder.add(preview.image.height); if (!preview.image.src.startsWith("blob:")) builder.image(preview.image.src); } }
    }
  } else if (sectionId === "assembly") {
    builder.add(viewModel.settings.includeAssemblyStepImages);
    if (viewModel.assemblyData) {
      builder.add(viewModel.assemblyData.mode);
      for (const part of viewModel.assemblyData.parts) { builder.add(part.id); builder.add(part.number); builder.add(part.name); }
      for (const step of viewModel.assemblyData.steps) { builder.add(step.id); builder.add(step.order); builder.add(step.title); builder.add(step.description); builder.image(step.image); }
      for (const view of viewModel.assemblyData.views) { builder.add(view.id); builder.add(view.labelKey); builder.image(view.image); }
    }
  } else if (sectionId === "finishing") {
    for (const item of viewModel.finishingData?.items ?? []) { builder.add(item.id); builder.add(item.type); builder.add(item.title); builder.add(item.description); builder.add(item.order); builder.image(item.image?.src); }
  } else if (sectionId === "troubleshooting") {
    for (const item of viewModel.troubleshootingData?.items ?? []) {
      builder.add(item.id); builder.add(item.category); builder.add(item.order); builder.add(item.source);
      if (item.source === "default") { builder.add(item.titleKey); builder.add(item.descriptionKey); } else { builder.add(item.title); builder.add(item.description); }
    }
  } else if (sectionId === "back-cover") {
    const data = viewModel.backCoverData;
    builder.add(data?.brandName); builder.image(data?.logoUrl); builder.add(data?.headline); builder.add(data?.description);
    builder.add(data?.websiteUrl); builder.add(data?.socialUrl); builder.add(data?.qrValue); builder.add(data?.ctaText); builder.add(data?.accentColor);
    for (const link of data?.socialLinks ?? []) { builder.add(link.id); builder.add(link.platform); builder.add(link.url); builder.add(link.handle); }
    for (const link of data?.customLinks ?? []) { builder.add(link.id); builder.add(link.label); builder.add(link.url); }
    addPageBrandLayout(builder, templateSettings.branding.backCoverLayout);
  }
  return builder.value();
}
