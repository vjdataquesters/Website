import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SubmissionsPanel from "../components/SubmissionsPanel";

export default function SSDSubmissions() {
  const [searchParams] = useSearchParams();
  const initialRoll = searchParams.get("roll") ?? "";

  return (
    <div className="pt-20 min-h-screen bg-blue-50/70">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#135168] mb-1">
              Summer System Design
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Problems & Submissions
            </h1>
          </div>
          <Link
            to="/events/SSD"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </Link>
        </div>

        <SubmissionsPanel initialRoll={initialRoll} />
      </div>
    </div>
  );
}
