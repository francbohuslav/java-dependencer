import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PagesEnum } from "./functions";
import { MainLayout } from "./MainLayout";
import { AnalyzePage } from "./pages/AnalyzePage";
import { CollisionPage } from "./pages/CollisionPage";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={PagesEnum.CollisionPage}
          element={
            <MainLayout>
              <CollisionPage />
            </MainLayout>
          }
        />
        <Route
          path={PagesEnum.AnalyzePage}
          element={
            <MainLayout>
              <AnalyzePage />
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
