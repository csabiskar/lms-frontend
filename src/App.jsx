import React, { useEffect, useState } from "react";
import { AppProvider, Frame, Navigation, Spinner, Page, Banner } from "@shopify/polaris";
import { BrowserRouter, Routes, Route, useLocation, Link as ReactRouterLink } from "react-router-dom";
import en from "@shopify/polaris/locales/en.json";
import { getToken } from "./shopify";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Students from "./pages/Students";
import Enrollments from "./pages/Enrollments";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function LinkComponent({ children, url = '', external, ref, ...rest }) {
  if (external || /^(?:[a-z][a-z\d+.-]*:|\/\/)/.test(url)) {
    return (
      <a target="_blank" rel="noopener noreferrer" href={url} ref={ref} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <ReactRouterLink to={url} ref={ref} {...rest}>
      {children}
    </ReactRouterLink>
  );
}

function Layout() {
  const location = useLocation();
  return (
    <Frame
      navigation={
        <Navigation location={location.pathname}>
          <Navigation.Section
            items={[
              { url: "/", label: "Dashboard", selected: location.pathname === "/" },
              { url: "/courses", label: "Courses", selected: location.pathname === "/courses" },
              { url: "/students", label: "Students", selected: location.pathname === "/students" },
              { url: "/enrollments", label: "Enrollments", selected: location.pathname === "/enrollments" },
            ]}
          />
        </Navigation>
      }
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/students" element={<Students />} />
        <Route path="/enrollments" element={<Enrollments />} />
      </Routes>
    </Frame>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const params = new URLSearchParams(window.location.search);
        const shop = params.get("shop");
        const host = params.get("host");

        if (!shop || !host) {
          setError("Please open this app from within your Shopify Admin. (Missing shop or host parameters)");
          return;
        }

        const token = await getToken();

        const res = await fetch(`${BACKEND_URL}/api/auth/token-exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shop, sessionToken: token }),
        });

        if (!res.ok) throw new Error("Token exchange failed");
        setReady(true);
      } catch (err) {
        console.error(err);
        setError("Could not connect to the app. Please reload the page.");
      }
    }
    init();
  }, []);

  return (
    <BrowserRouter>
      <AppProvider i18n={en} linkComponent={LinkComponent}>
        {error ? (
          <Page><Banner tone="critical">{error}</Banner></Page>
        ) : !ready ? (
          <Page>
            <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
              <Spinner accessibilityLabel="Loading app" size="large" />
            </div>
          </Page>
        ) : (
          <Layout />
        )}
      </AppProvider>
    </BrowserRouter>
  );
}
