# Atlas Layout And Theory Page

## Goal

Improve the atlas ergonomics without losing the strongest idea from the current version: the deep-time scale must clearly show that almost all life history happened before primates.

## User-Facing Changes

- Rename the main heading to: `Человек произошел от обезьяны... а от кого произошла обезьяна?`
- Move the evolution theory/evidence material out of the atlas screen into a top-level `/theory` page and add a `Теория` navigation item.
- Keep the atlas focused on exploration: title, mode controls, time scale, active exhibit card, compact era navigation, and a small link to the theory page.
- Add visible previous/next arrow controls near the time scale. Keyboard arrow navigation should also work when the scale has focus.
- Restore the previous timeline river/specimen artwork as a visual layer inside the deep-time scale while preserving the current linear 4-billion-year math and 98.4% message.

## Layout Direction

The atlas first screen becomes a two-column workbench:

- Main column: interactive axis, compact stage chips, and era navigation.
- Right column: active species/exhibit card.

The old left rail is removed from the primary desktop grid because it made the first screen feel cramped. Era navigation becomes a compact horizontal section under the scale.

## Testing

- E2E verifies `/theory` renders and is linked from the main navigation.
- E2E verifies the atlas title copy.
- E2E verifies visible arrow controls change the active species card.
- E2E verifies keyboard `ArrowRight` works when the deep-time axis is focused.
- Existing build, lint, unit, and responsive e2e checks must remain green.
