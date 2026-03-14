import React, { useState } from "react";
import { Search, User, Calendar, Briefcase, Hash, BookOpen, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../utils/api";

const TRR_REPS = [
  { id: 1, name: "Srishanth", image: "/teamImages/Srishanth-2027.png", phone: "918919776534" },
  { id: 2, name: "Sahasra", image: "/teamImages/Sahasra-2027.png", phone: "919346477090" },
  { id: 3, name: "Shashank", image: "/teamImages/Shashank-2027.png", phone: "918639950475" },
];

export default function Members() {
  const [memberId, setMemberId] = useState("");
  const [memberData, setMemberData] = useState(null);
  const [noDomain, setNoDomain] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setError("");
    setMemberData(null);
    setNoDomain(false);

    if (!memberId.trim()) {
      setError("Please enter a Member ID");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/members/${memberId.trim().toUpperCase()}`);
      const member = response.data.member;

      if (member.domain === null) {
        setNoDomain(true);
        setMemberData(member);
      } else {
        setMemberData(member);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Member ID not found. Please check and try again.");
      } else {
        setError("Failed to fetch member details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen w-full py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0f323f] mb-4 font-[Bricolage Grotesque]">
            Member Lookup
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            View member details
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full flex-1">
              <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 mb-2">
                Member ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="memberId"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., VJDQ2K25049"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f323f] focus:border-transparent transition-all"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-[#0f323f] text-white font-medium rounded-lg hover:bg-[#135168] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#0f323f] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 p-4 rounded-xl border bg-red-50 border-red-100"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <p className="font-medium text-red-700">{error}</p>
              </div>
            </motion.div>
          )}

          {/* No Domain Warning */}
          {noDomain && memberData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 p-4 rounded-xl border bg-blue-50 border-blue-100"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <p className="font-medium text-blue-800">
                  {memberData.name}, you haven't opted for domain division. Please contact the following Team Relation Representatives.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {TRR_REPS.map((rep) => (
                  <div key={rep.id} className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mb-3 overflow-hidden">
                      <img src={rep.image} alt={rep.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{rep.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">TRR</p>
                    <a
                      href={`https://wa.me/${rep.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white font-medium bg-green-500 px-3 py-1 rounded-full hover:bg-green-600 transition-colors"
                    >
                      Contact via WhatsApp
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Member Details Display */}
        {memberData && !noDomain && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="bg-[#0f323f] px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-full">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{memberData.name}</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                    Active Member
                  </span>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-white/60 text-sm uppercase tracking-wide">Member ID</p>
                <p className="text-white font-mono text-xl">{memberData.dqId}</p>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-[#f8f9fa] border border-gray-100">
                  <div className="flex items-center gap-3 mb-2 text-gray-500">
                    <Hash className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wide">Roll Number</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 font-mono">{memberData.rollNumber}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#f8f9fa] border border-gray-100">
                  <div className="flex items-center gap-3 mb-2 text-gray-500">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wide">Branch</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{memberData.branch}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#f8f9fa] border border-gray-100">
                  <div className="flex items-center gap-3 mb-2 text-gray-500">
                    <Layers className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wide">Section</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{memberData.section}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#f8f9fa] border border-gray-100">
                  <div className="flex items-center gap-3 mb-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wide">Batch</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{memberData.batch}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#f8f9fa] border border-gray-100 sm:col-span-2 md:col-span-2">
                  <div className="flex items-center gap-3 mb-2 text-gray-500">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wide">Domain</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{memberData.domain}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
