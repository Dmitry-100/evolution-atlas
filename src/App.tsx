import "./App.css";
import { useEffect } from "react";
import { BrowserRouter, NavLink, Route, Routes, useParams } from "react-router-dom";
import { AtlasPage } from "./pages/AtlasPage";
import { AboutPage } from "./pages/AboutPage";
import { ExtinctionsPage } from "./pages/ExtinctionsPage";
import { MaterialsPage } from "./pages/MaterialsPage";
import { SourcesPage } from "./pages/SourcesPage";
import { TheoryPage } from "./pages/TheoryPage";
import { DinosaursPage } from "./pages/DinosaursPage";
import { QuizPage } from "./pages/QuizPage";
import { EtherealInk } from "./components/ui/ethereal-ink";
import { ScrollProgress } from "./components/ui/scroll-progress";

function LegacyMaterialRedirect({ cover = false }: { cover?: boolean }) {
  const { fileName } = useParams();
  const assetPath = fileName ? `/assets/materials/${cover ? "covers/" : ""}${fileName}` : "/materials";

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
            <span className="brand-mark" aria-hidden="true" />
            <span>
              <strong>Достающее звено</strong>
              <small>интерактивный атлас эволюции</small>
            </span>
          </NavLink>
          <nav className="topbar-nav" aria-label="Основная навигация">
            <NavLink to="/">Атлас</NavLink>
            <NavLink to="/quiz">Проверь себя</NavLink>
            <NavLink to="/theory">Теория эволюции</NavLink>
            <NavLink to="/extinctions">Глобальные вымирания</NavLink>
            <NavLink to="/dinosaurs">Вымерли ли динозавры</NavLink>
            <NavLink to="/materials">Материалы</NavLink>
            <NavLink to="/sources">Источники</NavLink>
            <NavLink to="/about">О проекте</NavLink>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<AtlasPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/theory" element={<TheoryPage />} />
            <Route path="/extinctions" element={<ExtinctionsPage />} />
            <Route path="/dinosaurs" element={<DinosaursPage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/materials/:fileName" element={<LegacyMaterialRedirect />} />
            <Route path="/materials/covers/:fileName" element={<LegacyMaterialRedirect cover />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
