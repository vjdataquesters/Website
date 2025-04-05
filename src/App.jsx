import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import router from "./pages";

import Header from "./components/Header";
import ScrollToTop from "./components/ScrollToTop";
import Loading from "./components/Loading";
import Footer from "./components/Footer";
import { PromoDiv } from "./components/PromoDiv";
import events from "./data/events";

function LayoutWrapper() {
  const { pathname } = useLocation();
  const [load, setLoad] = useState(true);

  // Add paths where layout should be hidden
  const noLayoutRoutes = ["/", "/technovista"];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoad(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const notTV = !noLayoutRoutes.includes(pathname);

  function PromoSection() {
    return (
      pathname !== "/hit" &&
      pathname !== "/hitreloadedultrasecretendpoint" &&
      pathname !== "/register" && (
        <div className="fixed bottom-2 md:bottom-14 right-2 flex flex-col gap-2 z-10">
          {events.upcoming.map((e, i) => (
            <PromoDiv
              key={i}
              eventName={e.name}
              eventLink={e.link}
              eventStatus="upcoming"
            />
          ))}
        </div>
      )
    );
  }

  return (
    <>
      <Analytics />
      {notTV && <Loading load={load} />}
      {notTV && <Header />}
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
      {notTV && <PromoSection />}
      {notTV && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <LayoutWrapper />
    </Router>
  );
}

export default App;
