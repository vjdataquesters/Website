import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import PropTypes from "prop-types";
import router from "./pages";

import Header from "./components/Header";
import ConvergenceMarquee from "./components/ConvergenceMarquee";
import ScrollToTop from "./components/ScrollToTop";
import Loading from "./components/Loading";
import Footer from "./components/Footer";

function DynamicComponent({ Component, blacklist = [], ...props }) {
  const { pathname: currentPath } = useLocation();

  return (
    <>
      {!blacklist.some((path) => path === currentPath) && (
        <Component {...props} />
      )}
    </>
  );
}

DynamicComponent.propTypes = {
  Component: PropTypes.elementType.isRequired,
  blacklist: PropTypes.arrayOf(PropTypes.string),
};

// Spacer that reserves the height of the fixed marquee banner (~38px)
function MarqueeSpacer() {
  return <div aria-hidden="true" className="h-[38px]" />;
}

function App() {
  const [load, setLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoad(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const loadingAnimationBlacklist = [
    "/hit",
    "/hit-gen-qr-ultrasecretendpoint",
    "/register",
    "/register/ssd",
    "/events/SSD/submissions",
  ];
  const headerBlacklist = [
    "/hit",
    "/register",
    "/register/ssd",
    "/farewell-2k26",
  ];

  return (
    <Router>
      <Analytics />
      <DynamicComponent
        Component={Loading}
        blacklist={loadingAnimationBlacklist}
        load={load}
      />
      <DynamicComponent Component={Header} blacklist={headerBlacklist} />
      <DynamicComponent
        Component={ConvergenceMarquee}
        blacklist={headerBlacklist}
      />
      <DynamicComponent
        Component={MarqueeSpacer}
        blacklist={headerBlacklist}
      />
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-blue-50/70">
        <Routes>
          {router.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={<route.component />}
            />
          ))}
        </Routes>
      </div>
      <DynamicComponent Component={Footer} blacklist={headerBlacklist} />
    </Router>
  );
}

export default App;
