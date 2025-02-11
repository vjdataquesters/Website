import Home from "./Home";
import About from "./About";
import Events from "./Events";
import Team from "./Team";
import Testimonials from "./Testimonials";
import Event from "../components/Events/Event";
import Technovista from "../components/Events/Technovista";
import Hit3 from "../hit3/Hit3";


const router = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  { path: "/testimonials", component: Testimonials },
  { path: "/events", component: Events },
  { path: "/events/tv24", component: Technovista },
  { path: "/events/:eventname", component: Event },
  { path: "/team", component: Team },
  { path: "*", component: Home },
  { path: "/hit", component: Hit3 },
]

export default router;