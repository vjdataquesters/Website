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
import Carousel3D from "../components/TechnoVistaComponents/Carousel";
import Credentials from "./Credentials";
import Hit from "./Hit";

const router = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  { path: "/testimonials", component: Testimonials },
  { path: "/events", component: Events },
  { path: "/events/tv24", component: Technovista },
  { path: "/events/:eventname", component: Event },
  { path: "/team", component: Team },
  { path: "/newsletter", component: NewsLetter },
  { path: "/gallery", component: Gallery },
  { path: "/cred", component: Credentials },
  { path: "/register", component: RegistrationForm },
  { path: "*", component: Home },
  { path: "/hit", component: Hit },
];

export default router;
