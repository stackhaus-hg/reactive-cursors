// Main application component

// Node imports
import { Route, Routes } from "react-router-dom"; // Page routing with ReactRouter
import { Fragment } from "react";

// Local imports
import Stackhaus from "./pages/StackhausPage";
import DocoPage from "./pages/DocoPage";
import NotFoundPage from "./pages/NotFoundPage";
import Layout from "./components/layout/Layout"; // Layout component that structures our App
import FeaturesPage from "./pages/FeaturesPage";

// Workspace imports
import ReactiveCursor from "reactive-cursors";

// React component App
function App() {
  // Logic (JS)

  // Markup (JSX)
  return (
    <Fragment>
      {/* Import ReactiveCursor Component */}
      <ReactiveCursor />

      {/* New Routing Setup using the Layout component  */}
      {/* Page routing */}
      <Routes>
        <Route path="/" element={<Layout />}>
          {" "}
          {/* Note how the Layout component is used as an element instead of a wrapper */}
          <Route index element={<Stackhaus />} />{" "}
          <Route path="features" element={<FeaturesPage />} />
          <Route path="docs" element={<DocoPage />} />
          {/* Catchall segment ie. Page not found */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Fragment>
  );
}

export default App;
