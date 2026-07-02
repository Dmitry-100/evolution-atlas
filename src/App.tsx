import "./App.css";
import { Suspense, lazy, useEffect, useState, type KeyboardEvent } from "react";
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  BookOpen,
  Dna,
  FileText,
  Fingerprint,
  FlaskConical,
  GitFork,
  HelpCircle,
  Home,
  Info,
  Menu,
  ScanSearch,
  UsersRound,
  Waves,
  X,
  type LucideIcon,
} from "lucide-react";
import { AtlasPage } from "./pages/AtlasPage";
import { EtherealInk } from "./components/ui/ethereal-ink";
import {
  ExpandableTabs,
  type ExpandableTabItem,
} from "./components/ui/expandable-tabs";
import { OptimizedImage } from "./components/ui/optimized-image";
import { ScrollProgress } from "./components/ui/scroll-progress";
import { TooltipProvider } from "./components/ui/tooltip";
import { RouteErrorBoundary } from "./components/ui/route-error-boundary";
import { TourPlayer } from "./components/tour/TourPlayer";
import {
  DARWIN_TOUR_MENU_EVENT,
  DarwinWelcome,
} from "./components/tour/DarwinWelcome";

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
  bodyMap: () =>
    import("./pages/BodyMapPage").then(({ BodyMapPage }) => ({
      default: BodyMapPage,
    })),
  genetics: () =>
    import("./pages/GeneticsPage").then(({ GeneticsPage }) => ({
      default: GeneticsPage,
    })),
  primates: () =>
    import("./pages/PrimatesPage").then(({ PrimatesPage }) => ({
      default: PrimatesPage,
    })),
  notFound: () =>
    import("./pages/NotFoundPage").then(({ NotFoundPage }) => ({
      default: NotFoundPage,
    })),
  darwinGuide: () =>
    import("./components/ai/DarwinGuide").then(({ DarwinGuide }) => ({
      default: DarwinGuide,
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
const BodyMapPage = lazy(pageLoaders.bodyMap);
const GeneticsPage = lazy(pageLoaders.genetics);
const PrimatesPage = lazy(pageLoaders.primates);
const NotFoundPage = lazy(pageLoaders.notFound);
const DarwinGuide = lazy(pageLoaders.darwinGuide);

const routePreloaders: Record<string, () => Promise<unknown>> = {
  "/primates": pageLoaders.primates,
  "/theory": pageLoaders.theory,
  "/origin-of-life": pageLoaders.originOfLife,
  "/genetics": pageLoaders.genetics,
  "/cladogram": pageLoaders.cladogram,
  "/body-map": pageLoaders.bodyMap,
  "/extinctions": pageLoaders.extinctions,
  "/dinosaurs": pageLoaders.dinosaurs,
  "/materials": pageLoaders.materials,
  "/about": pageLoaders.about,
  "/quiz": pageLoaders.quiz,
};

function preloadRoute(to: string) {
  void routePreloaders[to]?.();
}

type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { label: "Атлас", to: "/", icon: Home },
  { label: "Приматы → человек", to: "/primates", icon: UsersRound },
  { label: "Теория эволюции", to: "/theory", icon: BookOpen },
  { label: "Зарождение жизни", to: "/origin-of-life", icon: FlaskConical },
  { label: "РНК/ДНК", to: "/genetics", icon: Dna },
  { label: "Дерево родства", to: "/cladogram", icon: GitFork },
  { label: "Карта признаков", to: "/body-map", icon: ScanSearch },
  { label: "Глобальные вымирания", to: "/extinctions", icon: Waves },
  { label: "Вымерли ли динозавры", to: "/dinosaurs", icon: Fingerprint },
  { label: "Дополнительные материалы", to: "/materials", icon: FileText },
  { label: "О проекте", to: "/about", icon: Info },
  { label: "Проверь себя", to: "/quiz", icon: HelpCircle },
];

const navTabs = navItems.reduce<ExpandableTabItem[]>(
  (tabs, item) => {
    if (item.to === "/materials") tabs.push({ type: "separator" });
    tabs.push({ title: item.label, icon: item.icon, href: item.to });
    return tabs;
  },
  [],
);

function getTabIndexFromNavIndex(navIndex: number) {
  const navItem = navItems[navIndex];
  if (!navItem) return 0;

  const tabIndex = navTabs.findIndex(
    (tab) => tab.type !== "separator" && tab.href === navItem.to,
  );
  return tabIndex >= 0 ? tabIndex : 0;
}

function getNavItemFromTabIndex(tabIndex: number | null) {
  if (tabIndex === null) return null;
  const tab = navTabs[tabIndex];
  if (!tab || tab.type === "separator") return null;

  return navItems.find((item) => item.to === tab.href) ?? null;
}

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
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTourMenuOpen, setIsTourMenuOpen] = useState(false);
  const activeNavIndex = getNavIndex(location.pathname);
  const activeTabIndex = getTabIndexFromNavIndex(activeNavIndex);

  useEffect(() => {
    function openTourMenu() {
      setIsMenuOpen(true);
      setIsTourMenuOpen(true);
    }

    window.addEventListener(DARWIN_TOUR_MENU_EVENT, openTourMenu);
    return () => window.removeEventListener(DARWIN_TOUR_MENU_EVENT, openTourMenu);
  }, []);

  const handleNavKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    event.preventDefault();
    const currentIndex = getNavIndex(window.location.pathname);
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + navItems.length) % navItems.length;

    navigate(navItems[nextIndex].to);
  };

  const handleNavChange = (tabIndex: number | null) => {
    const item = getNavItemFromTabIndex(tabIndex);
    if (!item) return;

    setIsMenuOpen(false);
    setIsTourMenuOpen(false);
    navigate(item.to);
  };

  const handleNavIntent = (tabIndex: number) => {
    const item = getNavItemFromTabIndex(tabIndex);
    if (item) preloadRoute(item.to);
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
        <ExpandableTabs
          tabs={navTabs}
          selectedIndex={activeTabIndex}
          collapsible={false}
          onChange={handleNavChange}
          onIntent={handleNavIntent}
        />
        <DarwinWelcome
          isOpen={isTourMenuOpen}
          onOpenChange={setIsTourMenuOpen}
          onTourStart={() => setIsMenuOpen(false)}
        />
      </nav>
    </header>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <main id="main-content">
      <RouteErrorBoundary resetKey={location.pathname}>
        <Suspense
          fallback={
            <section className="route-loading" aria-live="polite">
              Загружаем раздел...
            </section>
          }
        >
          <Routes>
            <Route path="/" element={<AtlasPage />} />
            <Route path="/primates" element={<PrimatesPage />} />
            <Route path="/theory" element={<TheoryPage />} />
            <Route path="/origin-of-life" element={<OriginOfLifePage />} />
            <Route path="/genetics" element={<GeneticsPage />} />
            <Route path="/cladogram" element={<CladogramPage />} />
            <Route path="/body-map" element={<BodyMapPage />} />
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
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider delayDuration={160}>
        <EtherealInk className="app-ethereal-background" />
        <ScrollProgress />
        <div className="app-shell">
          <a className="skip-to-content" href="#main-content">
            Перейти к содержимому
          </a>
          <AppHeader />
          <AppRoutes />
          <TourPlayer />
          <Suspense fallback={null}>
            <RouteErrorBoundary resetKey="darwin-guide">
              <DarwinGuide />
            </RouteErrorBoundary>
          </Suspense>
        </div>
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
