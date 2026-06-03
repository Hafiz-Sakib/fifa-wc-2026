import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import Home from "../pages/Home";
import FixturesByTeam from "../pages/FixturesByTeam";
import FixturesByDate from "../pages/FixturesByDate";
import Squads from "../pages/Squads";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      {/* Sticky Navbar */}
      <Navbar />

      {/* Page content */}
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/by-team" element={<FixturesByTeam />} />
          <Route path="/by-date" element={<FixturesByDate />} />
          <Route path="/squads"  element={<Squads />} />
          {/* Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <Footer />

      {/* Scroll to top floating button */}
      <ScrollToTop />
    </BrowserRouter>
  );
}
