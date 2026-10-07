import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Booking from './pages/Booking.jsx';
import Components from './pages/Components.jsx';
import Home from './pages/Home.jsx';
import MovieDetails from './pages/MovieDetails.jsx';
import NotFound from './pages/NotFound.jsx';
import Profile from './pages/Profile.jsx';
import Sessions from './pages/Sessions.jsx';

/**
 * Routes.
 *   /                    Home
 *   /sessions            Sessions (filters live in the query string)
 *   /movie/:slug         Film page
 *   /booking/:sessionId  Booking modal, drawn over the page it was opened from
 *   /profile             My Profile -> Personal Information
 *   /profile/tickets     My Profile -> My Tickets
 *   /components          Component reference (not linked from the site)
 */
export default function App() {
  const location = useLocation();
  const background = location.state?.background;

  return (
    <>
      <Routes location={background ?? location}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/movie/:slug" element={<MovieDetails />} />
          <Route path="/movies/:slug" element={<MovieAlias />} />
          <Route path="/booking/:sessionId" element={<Booking />} />
          <Route path="/profile" element={<Profile tab="info" />} />
          <Route path="/profile/tickets" element={<Profile tab="tickets" />} />
          <Route path="/components" element={<Components />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      {background && (
        <Routes>
          <Route path="/booking/:sessionId" element={<Booking overlay />} />
          <Route path="*" element={null} />
        </Routes>
      )}
    </>
  );
}

function MovieAlias() {
  const { pathname } = useLocation();
  return <Navigate to={pathname.replace('/movies/', '/movie/')} replace />;
}
