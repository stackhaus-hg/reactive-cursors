// Main application component

// Node imports
import { Route, Routes } from "react-router-dom"; // Page routing with ReactRouter
import { Fragment } from "react";

// Local imports
import Stackhaus from "./pages/StackhausPage";
import DocoPage from "./pages/DocoPage";
import NotFoundPage from "./pages/NotFoundPage";
import Layout from "./components/layout/Layout"; // Layout component that structures our App

// Workspace imports
import ReactiveCursor from "reactive-cursors";

// React component App
function App() {
  // Logic (JS)

  // Markup (JSX)
  return (
    <Fragment>
      {/* Import ReactiveCursor Component */}
      <ReactiveCursor
        layers={[
          { SVG: "square", fill:"blue", stroke:"cyan", strokeSize: 40, size: { width: 5, height: 5 } },
          { SVG: "circle", fill:"black", stroke:"orangered", strokeSize: 5, size: { width: 60, height: 60 }, delay: 10 },
        ]}
        showSystemCursor={false}
        mixBlendMode="normal"
      />

      {/* New Routing Setup using the Layout component  */}
      {/* Page routing */}
      <Routes>
        <Route path="/" element={<Layout />}>
          {" "}
          {/* Note how the Layout component is used as an element instead of a wrapper */}
          {/* Remaining routes are nested (and so are children of the Layout route as well as also inheriting the path of the parent) */}
          <Route index element={<Stackhaus />} />{" "}
          {/* Use index rather than path='/' */}
          <Route path="doco" element={<DocoPage />} />
          {/* Catchall segment ie. Page not found */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Fragment>
  );
}

export default App;
