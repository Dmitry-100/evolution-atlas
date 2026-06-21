import "./App.css";
import { Suspense, lazy, useEffect, useState, type KeyboardEvent } from "react";
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AtlasPage } from "./pages/AtlasPage";
import { EtherealInk } from "./components/ui/ethereal-ink";
import { OptimizedImage } from "./components/ui/optimized-image";
import { ScrollProgress } from "./components/ui/scroll-progress";
import { TooltipProvider } from "./components/ui/tooltip";

const pageLoaders = {
  about: () =>
    import("./pages/AboutPage").then(({ AboutPage }) => ({
      default: AboutPage,
    })),
  extinctions: () =>
    import("./pages/ExtinctionsPage").then(({ ExtinctionsPage }) => ({
      default: ExtinctionsPage,
    })),
  materials: () =>
    import("./pages/MaterialsPage").then(({ MaterialsPage }) => ({
      default: MaterialsPage,
    })),
  sources: () =>
    import("./pages/SourcesPage").then(({ SourcesPage }) => ({
      default: SourcesPage,
    })),
  theory: () =>
    import("./pages/TheoryPage").then(({ TheoryPage }) => ({
      default: TheoryPage,
    })),
  dinosaurs: () =>
    import("./pages/DinosaursPage").then(({ DinosaursPage }) => ({
      default: DinosaursPage,
    })),
  quiz: () =>
    import("./pages/QuizPage").then(({ QuizPage }) => ({
      default: QuizPage,
    })),
  originOfLife: () =>
    import("./pages/OriginOfLifePage").then(({ OriginOfLifePage }) => ({
      default: OriginOfLifePage,
    })),
  cladogram: () =>
    import("./pages/CladogramPage").then(({ CladogramPage }) => ({
      default: CladogramPage,
    })),
  genetics: () =>
    import("./pages/GeneticsPage").then(({ GeneticsPage }) => ({
      default: GeneticsPage,
    })),
};

const AboutPage = lazy(pageLoaders.about);
const ExtinctionsPage = lazy(pageLoaders.extinctions);
const MaterialsPage = lazy(pageLoaders.materials);
const SourcesPage = lazy(pageLoaders.sources);
const TheoryPage = lazy(pageLoaders.theory);
const DinosaursPage = lazy(pageLoaders.dinosaurs);
const QuizPage = lazy(pageLoaders.quiz);
const OriginOfLifePage = lazy(pageLoaders.originOfLife);
const CladogramPage = lazy(pageLoaders.cladogram);
const GeneticsPage = lazy(pageLoaders.genetics);

const routePreloaders: Record<string, () => Promise<unknown>> = {
  "/theory": pageLoaders.theory,
  "/origin-of-life": pageLoaders.originOfLife,
  "/genetics": pageLoaders.genetics,
  "/cladogram": pageLoaders.cladogram,
  "/extinctions": pageLoaders.extinctions,
  "/dinosaurs": pageLoaders.dinosaurs,
  "/materials": pageLoaders.materials,
  "/about": pageLoaders.about,
  "/quiz": pageLoaders.quiz,
};

function preloadRoute(to: string) {
  void routePreloaders[to]?.();
}

const navItems = [
  { label: "Атлас", to: "/" },
  { label: "Теория эволюции", to: "/theory" },
  { label: "Зарождение жизни", to: "/origin-of-life" },
  { label: "РНК/ДНК", to: "/genetics" },
  { label: "Дерево родства", to: "/cladogram" },
  { label: "Глобальные вымирания", to: "/extinctions" },
  { label: "Вымерли ли динозавры", to: "/dinosaurs" },
  { label: "Дополнительные материалы", to: "/materials" },
  { label: "О проекте", to: "/about" },
  { label: "Проверь себя", to: "/quiz" },
];

const primaryNavItems = navItems.slice(0, 7);
const secondaryNavItems = navItems.slice(7);

function LegacyMaterialRedirect({ cover = false }: { cover?: boolean }) {
  const { fileName } = useParams();
  const assetPath = fileName
    ? `/assets/materials/${cover ? "covers/" : ""}${fileName}`
    : "/materials";

  useEffect(() => {
    window.location.replace(assetPath);
  }, [assetPath]);

  return (
    <section className="document-page">
      <p>
        Открываем материал. Если переход не сработал,{" "}
        <a href={assetPath}>откройте его вручную</a>.
      </p>
    </section>
  );
}

function getNavIndex(pathname: string) {
  const matchingIndex = navItems.findIndex((item) => {
    if (item.to === "/") return pathname === "/";

    return pathname === item.to || pathname.startsWith(`${item.to}/`);
  });

  return matchingIndex >= 0 ? matchingIndex : 0;
}

function AppHeader() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    event.preventDefault();
    const currentIndex = getNavIndex(window.location.pathname);
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + navItems.length) % navItems.length;

    navigate(navItems[nextIndex].to);
  };

  return (
    <header className={isMenuOpen ? "topbar is-menu-open" : "topbar"}>
      <NavLink className="brand" to="/" aria-label="Открыть атлас">
        <OptimizedImage
          className="brand-mark"
          src="/assets/brand/portal-logo-mark.png"
          alt=""
          aria-hidden="true"
        />
        <span className="brand-compact">
          <strong>Достающее звено</strong>
          <small>интерактивный атлас эволюции</small>
        </span>
      </NavLink>
      <button
        type="button"
        className="mobile-menu-button"
        aria-controls="primary-navigation"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        {isMenuOpen ? (
          <X aria-hidden="true" size={24} />
        ) : (
          <Menu aria-hidden="true" size={24} />
        )}
      </button>
      <nav
        id="primary-navigation"
        className="topbar-nav"
        aria-label="Основная навигация"
        onKeyDown={handleNavKeyDown}
      >
        <div className="topbar-nav-row topbar-nav-primary">
          {primaryNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMenuOpen(false)}
              onFocus={() => preloadRoute(item.to)}
              onMouseEnter={() => preloadRoute(item.to)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="topbar-nav-row topbar-nav-secondary">
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMenuOpen(false)}
              onFocus={() => preloadRoute(item.to)}
              onMouseEnter={() => preloadRoute(item.to)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider delayDuration={160}>
        <EtherealInk className="app-ethereal-background" />
        <ScrollProgress />
        <div className="app-shell">
          <AppHeader />
          <main>
            <Suspense
              fallback={
                <section className="route-loading" aria-live="polite">
                  Загружаем раздел...
                </section>
              }
            >
              <Routes>
                <Route path="/" element={<AtlasPage />} />
                <Route path="/theory" element={<TheoryPage />} />
                <Route path="/origin-of-life" element={<OriginOfLifePage />} />
                <Route path="/genetics" element={<GeneticsPage />} />
                <Route path="/cladogram" element={<CladogramPage />} />
                <Route path="/extinctions" element={<ExtinctionsPage />} />
                <Route path="/dinosaurs" element={<DinosaursPage />} />
                <Route path="/materials" element={<MaterialsPage />} />
                <Route
                  path="/materials/:fileName"
                  element={<LegacyMaterialRedirect />}
                />
                <Route
                  path="/materials/covers/:fileName"
                  element={<LegacyMaterialRedirect cover />}
                />
                <Route path="/sources" element={<SourcesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/quiz" element={<QuizPage />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
