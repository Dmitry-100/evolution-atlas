import "./App.css";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { AtlasPage } from "./pages/AtlasPage";
import { AboutPage } from "./pages/AboutPage";
import { ExtinctionsPage } from "./pages/ExtinctionsPage";
import { MaterialsPage } from "./pages/MaterialsPage";
import { SourcesPage } from "./pages/SourcesPage";
import { TheoryPage } from "./pages/TheoryPage";

function App() {
  return (
    <BrowserRouter>
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
            <NavLink to="/theory">Теория эволюции</NavLink>
            <NavLink to="/extinctions">Глобальные вымирания</NavLink>
            <NavLink to="/materials">Материалы</NavLink>
            <NavLink to="/sources">Источники</NavLink>
            <NavLink to="/about">О проекте</NavLink>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<AtlasPage />} />
            <Route path="/theory" element={<TheoryPage />} />
            <Route path="/extinctions" element={<ExtinctionsPage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
