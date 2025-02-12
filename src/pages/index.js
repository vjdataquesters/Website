import Home from "./Home";
import About from "./About";
import Events from "./Events";
import Team from "./Team";
import Testimonials from "./Testimonials";
import Event from "../components/Events/Event";
import Technovista from "../components/Events/Technovista";
import Hit from "./Hit";


const router = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  { path: "/testimonials", component: Testimonials },
  { path: "/events", component: Events },
  { path: "/events/tv24", component: Technovista },
  { path: "/events/:eventname", component: Event },
  { path: "/team", component: Team },
  { path: "/hit", component: Hit},
  { path: "*", component: Home },
]

export default router;