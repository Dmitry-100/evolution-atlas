import { describe, expect, it } from "vitest";

import appSource from "../App.tsx?raw";
import deepTimeAxisSource from "../components/atlas/DeepTimeAxis.tsx?raw";
import eraNavigationSource from "../components/atlas/EraNavigation.tsx?raw";
import journeyControlsSource from "../components/atlas/JourneyControls.tsx?raw";
import quizPanelSource from "../components/atlas/QuizPanel.tsx?raw";
import tourPlayerSource from "../components/tour/TourPlayer.tsx?raw";
import darwinGuideSource from "../components/ai/DarwinGuide.tsx?raw";
import darwinWelcomeSource from "../components/tour/DarwinWelcome.tsx?raw";
import imageLightboxSource from "../components/ui/image-lightbox.tsx?raw";
import dinosaursPageSource from "../pages/DinosaursPage.tsx?raw";

describe("accessibility policy", () => {
  it("adds global skip navigation and live quiz feedback", () => {
    expect(appSource).toContain("skip-to-content");
    expect(appSource).toContain('id="main-content"');
    expect(quizPanelSource).toContain('role="status"');
    expect(quizPanelSource).toContain('aria-live="polite"');
    expect(quizPanelSource).toContain("aria-disabled");
  });

  it("keeps timeline keyboard navigation to one owner and exposes readable slider values", () => {
    expect(deepTimeAxisSource).toContain("stopPropagation()");
    expect(deepTimeAxisSource).toContain("aria-valuetext");
    expect(deepTimeAxisSource).not.toContain("max={1000}");
  });

  it("manages focus for dialogs and lightboxes", () => {
    for (const source of [
      darwinGuideSource,
      darwinWelcomeSource,
      imageLightboxSource,
    ]) {
      expect(source).toContain("previousFocusRef");
      expect(source).toContain("Escape");
      expect(source).toContain("focus()");
    }
    expect(imageLightboxSource).toContain("Tab");
  });

  it("uses abortable client requests for AI-powered surfaces", () => {
    expect(darwinGuideSource).toContain("fetchWithTimeout");
    expect(darwinWelcomeSource).toContain("fetchWithTimeout");
  });

  it("respects reduced motion and avoids over-announcing autoplay progress", () => {
    expect(journeyControlsSource).toContain("prefers-reduced-motion");
    expect(journeyControlsSource).toContain("aria-live={effectiveIsPlaying ? undefined : \"polite\"}");
  });

  it("exposes completion affordances for tours and era navigation", () => {
    expect(tourPlayerSource).toContain("goPrevious");
    expect(tourPlayerSource).toContain("Назад");
    expect(eraNavigationSource).toContain("aria-current");
  });

  it("does not change the active dinosaur stage merely by focusing a dot", () => {
    expect(dinosaursPageSource).not.toContain("onFocus={() => setActiveStageId");
  });
});
