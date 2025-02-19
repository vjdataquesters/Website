import Home from "./Home";
import About from "./About";
import Events from "./Events";
import Team from "./Team";
import Testimonials from "./Testimonials";
import Event from "../components/Event";
import Technovista from "../components/Technovista";
import NewsLetter from "./NewsLetter";
import Hit from "../pages/Hit";
import GenerateAllQrs from "./GenerateAllQrs";

const router = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  { path: "/testimonials", component: Testimonials },
  { path: "/events", component: Events },
  { path: "/events/tv24", component: Technovista },
  { path: "/events/:eventname", component: Event },
  { path: "/team", component: Team },
  { path: "/newsletter", component: NewsLetter },
  { path: "/hit", component: Hit },
  { path: "/hitreloadedultrasecretendpoint", component: GenerateAllQrs },
  { path: "*", component: Home },
];

export default router;
