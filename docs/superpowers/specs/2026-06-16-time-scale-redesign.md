# Time Scale Redesign Spec

## Goal

Make the atlas immediately communicate the central idea: humans are part of a young primate branch, and almost all of life's history happened before primates appeared.

## Approved Direction

Use a two-scale museum atlas:

- The main atlas uses a monumental 4-billion-year axis where the pre-primate span is visually dominant and primates are a tiny highlighted segment at the far right.
- The "Приматы крупно" mode uses a separate primate-only visual axis made from primate portraits/specimen cards rather than reusing the whole-life river background.
- The headline becomes: "Человек произошел от обезьяны? А от кого произошли обезьяны? Как отвечает на это теория эволюции."
- A new section explains what "theory" means in science and summarizes evidence for evolution.
- Stage imagery should become source-backed where possible, stored locally, with source/license/credit metadata.

## Visual Reference

Generated concept:

`/Users/Sotnikov/.codex/generated_images/019ec590-d450-7893-a6f5-51ac73551ca6/ig_029d4a350bb6ad7c016a313c5cb3c081918ad63f7304fbf0f0.png`

## Acceptance Criteria

- The first viewport visually labels that approximately 98% of the 4-billion-year story passed before primates.
- The primate mode shows a primate-specific axis with image nodes.
- Every stage has a local image and non-empty metadata: credit, license, source URL, alt text.
- The evidence section includes fossils, molecular data, comparative anatomy, embryology, biogeography, and observed evolution.
- Desktop and mobile e2e tests cover the new title, both modes, image changes, no horizontal overflow, and evidence section rendering.
