import "./App.css";
import { useEffect } from "react";
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { AtlasPage } from "./pages/AtlasPage";
import { AboutPage } from "./pages/AboutPage";
import { ExtinctionsPage } from "./pages/ExtinctionsPage";
import { MaterialsPage } from "./pages/MaterialsPage";
import { SourcesPage } from "./pages/SourcesPage";
import { TheoryPage } from "./pages/TheoryPage";
import { DinosaursPage } from "./pages/DinosaursPage";
import { QuizPage } from "./pages/QuizPage";
import { OriginOfLifePage } from "./pages/OriginOfLifePage";
import { CladogramPage } from "./pages/CladogramPage";
import { GeneticsPage } from "./pages/GeneticsPage";
import { EtherealInk } from "./components/ui/ethereal-ink";
import { ScrollProgress } from "./components/ui/scroll-progress";

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
        Открываем файл: <a href={assetPath}>{assetPath}</a>
      </p>
    </section>
  );
}

function App() {
  return (
    <BrowserRouter>
      <EtherealInk className="app-ethereal-background" />
      <ScrollProgress />
      <div className="app-shell">
        <header className="topbar">
          <NavLink className="brand" to="/" aria-label="Открыть атлас">
            <img
              className="brand-wordmark"
              src="/assets/brand/portal-logo.png"
              alt=""
              aria-hidden="true"
            />
            <span className="brand-compact" aria-hidden="true">
              <img
                className="brand-mark"
                src="/assets/brand/portal-logo-mark.png"
                alt=""
              />
              <span>
                <strong>Достающее звено</strong>
                <small>интерактивный атлас эволюции</small>
              </span>
            </span>
          </NavLink>
          <nav className="topbar-nav" aria-label="Основная навигация">
            <NavLink to="/">Атлас</NavLink>
            <NavLink to="/theory">Теория эволюции</NavLink>
            <NavLink to="/origin-of-life">Зарождение жизни</NavLink>
            <NavLink to="/genetics">РНК/ДНК</NavLink>
            <NavLink to="/cladogram">Дерево родства</NavLink>
            <NavLink to="/extinctions">Глобальные вымирания</NavLink>
            <NavLink to="/dinosaurs">Вымерли ли динозавры</NavLink>
            <NavLink to="/materials">Материалы</NavLink>
            <NavLink to="/sources">Источники</NavLink>
            <NavLink to="/about">О проекте</NavLink>
            <NavLink to="/quiz">Проверь себя</NavLink>
          </nav>
        </header>
        <main>
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
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
