import Farewell2K26Group from "./Farewell2K26Group";
import FarewellPage from "./FarewellPage";

const farewell2K26Routes = [
	{ path: "/farewell-2k26", component: Farewell2K26Group },
	{ path: "/farewell-2k26/:name", component: FarewellPage },
];

export default farewell2K26Routes;
