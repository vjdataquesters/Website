import Home from "./Home";
import About from "./About";
import Events from "./Events";
import Team from "./Team";
import Testimonials from "./Testimonials";
import Event from "../components/Event";
import Technovista from "../components/Technovista";
import NewsLetter from "./NewsLetter";
import Gallery from "./Gallery";
import RegistrationForm from "./RegistrationForm";
import TechnoVista from "./TechnoVista";

const router = [
  { path: "/", component: Home },
  { path: "/technovista",component:TechnoVista},
  { path: "/about", component: About },
  { path: "/testimonials", component: Testimonials },
  { path: "/events", component: Events },
  { path: "/events/tv24", component: Technovista },
  { path: "/events/:eventname", component: Event },
  { path: "/team", component: Team },
  { path: "/newsletter", component: NewsLetter },
  { path: "/gallery", component: Gallery },
  { path: "/register", component: RegistrationForm },
  { path: "*", component: Home },
];

export default router;
