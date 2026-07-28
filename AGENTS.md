## Themes

- The application supports both Light and Dark themes.
- Every UI change must be verified in both themes.
- Use existing semantic theme tokens and shared variants.
- Do not hardcode dark-only colors.
- Light Theme surfaces such as cards, inputs, selectors, sidebars, and modals should be white, not gray.
- Before adding local color classes, inspect shared components, theme tokens, and `globals.css`.
- Do not duplicate components for separate themes.

## UI changes

- Preserve existing business logic unless the task explicitly requests a behavior change.
- Do not remove existing controls or functionality during redesigns.
- Before styling, find the actual rendered component and inspect its final classes.
- Check shared `Button`, `Card`, `Input`, `Select`, and CVA variants for overriding styles.
- Also inspect `globals.css` and theme token files when local classes do not appear in the browser.
- Avoid unnecessary borders, nested cards, excessive padding, and large vertical gaps.
- Keep hover, focus, selected, active, and disabled states visually distinct.
- Every enabled clickable control must use `cursor-pointer`.
- Disabled controls must use `cursor-not-allowed`.
- Every non-submit button inside a form must explicitly use `type="button"`.

## Simple Mode

- Do not modify Advanced Mode when working on Simple Mode unless explicitly requested.
- Targeting mode belongs to the entire Simple Mode project workflow.
- Use `simpleTargetMode` as the single source of truth.
- `markers` must use the marker workflow and the localized `Add Markers` action.
- `region` must use the region workflow and the localized `Select Paint Area` action.
- Never show a per-detail Markers / Paint Region selector.
- Do not mix marker state and region state.
- Switching targeting mode must clear incompatible workflow data according to the existing project rules.

## References

- Preserve reference upload, selection, visibility, collapse, preview, and delete behavior during redesigns.
- The References section must remain collapsible.
- Do not remove the Show / Showing reference control.
- Empty and populated reference states may have different layouts, but both must preserve existing functionality.

## Stability

- UI updates must not remount the Viewer unnecessarily.
- Do not use unstable keys based on timestamps, mutable objects, selected colors, or generated values.
- Background refetching must not replace existing content with a full loading state.
- Do not introduce route refreshes, form submissions, mutation loops, persistence loops, or Viewer flicker for local UI interactions.
- Preserve camera position and Viewer state during palette, step, detail, marker, and region updates.

## Validation

After code changes:

- verify English and Ukrainian;
- verify Light and Dark themes;
- verify existing interactions still work;
- verify no functionality was removed;
- verify there is no Viewer or sidebar flicker;
- run TypeScript checks;
- run `npm run lint`;
- run `npm run build`;
- run the hardcoded JSX-string audit after UI changes.