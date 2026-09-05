import { expect, test } from "@playwright/test";
import { GENOME_COMPARISONS } from "../src/data/genetics";

for (const width of [1440, 820, 391, 320]) {
  test(`genetics reading flow, comparisons and codons at ${width}px`, async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "Explicit responsive viewports.",
    );
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/genetics");
    await expect(page.locator(".genetics-flow > li")).toHaveCount(5);
    await expect(page.locator(".genome-comparison-group")).toHaveCount(3);
    await expect(page.locator(".genetics-evidence-card")).toHaveCount(6);
    await expect(page.locator(".curiosity-card")).toHaveCount(3);
    await expect(page.locator(".genetics-image-zoom")).toHaveCount(9);
    await expect(page.locator(".molecular-scars")).toHaveCount(0);
    for (const comparison of GENOME_COMPARISONS) {
      const card = page
        .locator(".genome-comparison-card")
        .filter({
          has: page.getByRole("heading", {
            name: comparison.titleRu,
            exact: true,
          }),
        });
      await expect(card).toHaveAttribute(
        "data-metric-kind",
        comparison.metricKind,
      );
      await expect(card.locator("strong")).toHaveText(comparison.valueRu);
      await expect(card.locator("small")).toHaveText(comparison.cautionRu);
      await expect(card.locator("a")).toHaveAttribute(
        "href",
        comparison.source.url,
      );
    }
    const layout = await page.evaluate(() => {
      const rows = (selector: string) =>
        new Set(
          [...document.querySelectorAll(selector)].map((e) =>
            Math.round(e.getBoundingClientRect().top),
          ),
        ).size;
      const aligned = (selector: string, fields: string[]) =>
        [...document.querySelectorAll(selector)].every((card, i, cards) =>
          cards.slice(i + 1).every((other) => {
            if (
              Math.abs(
                card.getBoundingClientRect().top -
                  other.getBoundingClientRect().top,
              ) > 1
            )
              return true;
            return fields.every(
              (field) =>
                Math.abs(
                  card.querySelector(field)!.getBoundingClientRect().top -
                    other.querySelector(field)!.getBoundingClientRect().top,
                ) < 1,
            );
          }),
        );
      const headings = [...document.querySelectorAll(".genetics-page h2")].map(
        (e) => {
          const s = getComputedStyle(e);
          return [
            s.fontFamily,
            s.fontSize,
            s.lineHeight,
            s.fontWeight,
            s.marginTop,
            s.marginBottom,
          ].join("|");
        },
      );
      return {
        flowRows: rows(".genetics-flow > li"),
        moleculeRows: rows(".molecule-card"),
        factRows: rows(".curiosity-card"),
        headings: new Set(headings).size,
        evidenceAligned: aligned(".genetics-evidence-card", [
          "img",
          "h3",
          "dl > div:first-child",
          "dl > div:last-child",
          ".genetics-evidence-sources",
        ]),
        comparisonsAligned: aligned(".genome-comparison-card", [
          "h4",
          "strong",
          ".genome-comparison-definition",
          "small",
        ]),
        codonBeforeGallery:
          document.querySelector(".codon-lab")!.getBoundingClientRect().bottom <
          document
            .querySelector(".genetics-molecule-gallery")!
            .getBoundingClientRect().top +
            1,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(layout.flowRows).toBe(width > 720 ? 1 : 5);
    expect(layout.moleculeRows).toBe(width > 720 ? 1 : 3);
    expect(layout.factRows).toBe(width > 720 ? 1 : 3);
    expect(layout.headings).toBe(1);
    expect(layout.evidenceAligned).toBe(true);
    expect(layout.comparisonsAligned).toBe(true);
    expect(layout.codonBeforeGallery).toBe(true);
    expect(layout.overflow).toBe(false);
    await page.screenshot({
      path: testInfo.outputPath(`genetics-top-${width}.png`),
      animations: "disabled",
    });

    const lab = page.locator(".codon-lab");
    for (const [dna, rna, meaning] of [
      ["ATG", "AUG", "метионин / старт"],
      ["GGC", "GGC", "глицин"],
      ["TGG", "UGG", "триптофан"],
      ["TAA", "UAA", "стоп"],
    ]) {
      const choice = lab.getByRole("button", {
        name: `${dna} ${rna}`,
        exact: true,
      });
      await choice.focus();
      await page.keyboard.press("Enter");
      await expect(choice).toHaveAttribute("aria-pressed", "true");
      await expect(lab.locator("button[aria-pressed=true]")).toHaveCount(1);
      await expect(
        lab.locator(".codon-sequence strong").first(),
      ).toHaveAttribute("aria-label", dna);
      await expect(
        lab.locator(".codon-sequence strong").last(),
      ).toHaveAttribute("aria-label", rna);
      await expect(lab.locator(".codon-meaning strong")).toHaveText(meaning);
      await expect(lab.locator(".is-transcribed")).toHaveCount(
        dna === rna ? 0 : 2,
      );
    }
    await expect(lab.locator(".codon-meaning.is-stop svg")).toBeVisible();
    const bounds = await lab.boundingBox();
    expect(bounds!.height).toBeLessThan(650);
    await lab.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: testInfo.outputPath(`genetics-codon-${width}.png`),
      animations: "disabled",
    });

    for (const selector of [
      ".molecule-card .genetics-image-zoom",
      ".genetics-evidence-zoom",
    ]) {
      const trigger = page.locator(selector).first();
      await expect(trigger).toHaveText("");
      await expect(trigger).toHaveCSS("cursor", "zoom-in");
      const src = await trigger.locator("img").getAttribute("src");
      await trigger.click();
      const dialog = page.getByRole("dialog", { name: "Увеличенная схема" });
      await expect(dialog.locator("img")).toHaveAttribute("src", src!);
      await expect(dialog.locator("img")).toHaveCSS("object-fit", "contain");
      await expect
        .poll(() =>
          dialog
            .locator("img")
            .evaluate((img) => (img as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(1000);
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
    }
    for (const [selector, name] of [
      [".genetics-molecule-gallery", "molecules"],
      [".genome-comparison-section", "comparisons"],
      [".genetics-evidence-section", "evidence"],
      [".curiosity-facts", "facts"],
    ]) {
      await page
        .locator(selector)
        .evaluate((e) => e.scrollIntoView({ block: "start" }));
      await page.evaluate(() => window.scrollBy(0, -110));
      for (const img of await page.locator(`${selector} img`).all()) {
        // Only images in the captured viewport need to finish loading.
        const bounds = await img.boundingBox();
        if (bounds && bounds.y < 960)
          await expect
            .poll(() =>
              img.evaluate((e) => (e as HTMLImageElement).naturalWidth),
            )
            .toBeGreaterThan(0);
      }
      await page.screenshot({
        path: testInfo.outputPath(`genetics-${name}-${width}.png`),
        animations: "disabled",
      });
    }
  });
}
