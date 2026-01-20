import React, { useState } from 'react';
import { Search, User, Calendar, Briefcase, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Members() {
  const [memberId, setMemberId] = useState('');
  const [memberData, setMemberData] = useState(null);
  const [error, setError] = useState('');

  // State for storing the full member database
  const [membersDatabase, setMembersDatabase] = useState({});
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('/Members/VJDQ_2028_members.csv');
        const text = await response.text();

        // Parse CSV
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const db = {};

        // Start from index 1 to skip header
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;

          // Handle potential commas in fields by using a regex or simple split if simple CSV
          // Assuming simple CSV based on file content viewed
          const values = lines[i].split(',');

          if (values.length >= 4) {
            const name = values[0].trim();
            const id = values[1].trim().toUpperCase();
            const batch = values[2].trim();
            const domain = values[3].trim();

            if (id) {
              db[id] = { name, batch, domain };
            }
          }
        }

        setMembersDatabase(db);
        setLoading(false);
      } catch (err) {
        console.error("Error loading members data:", err);
        setError("Failed to load member database.");
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleSearch = () => {
    setError('');
    setMemberData(null);

    if (!memberId.trim()) {
      setError('Please enter a Member ID');
      return;
    }

    const member = membersDatabase[memberId.toUpperCase()];

    if (member) {
      setMemberData(member);
    } else {
      setError('Member ID not found. Please check and try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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
                  placeholder="e.g., VJDQ2K25999"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f323f] focus:border-transparent transition-all"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="w-full md:w-auto px-8 py-3 bg-[#0f323f] text-white font-medium rounded-lg hover:bg-[#135168] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#0f323f]"
            >
              Search
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center border border-red-100"
            >
              <span className="mr-2">⚠️</span> {error}
            </motion.div>
          )}
        </div>

        {/* Member Details Display */}
        {memberData && (
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
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {memberData.name}
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                    Active Member
                  </span>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-white/60 text-sm uppercase tracking-wide">Member ID</p>
                <p className="text-white font-mono text-xl">{memberId.toUpperCase()}</p>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-[#f8f9fa] border border-gray-100">
                  <div className="flex items-center gap-3 mb-2 text-gray-500">
                    <Hash className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wide">ID</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 font-mono">
                    {memberId.toUpperCase()}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#f8f9fa] border border-gray-100">
                  <div className="flex items-center gap-3 mb-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wide">Batch</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {memberData.batch}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#f8f9fa] border border-gray-100">
                  <div className="flex items-center gap-3 mb-2 text-gray-500">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wide">Domain</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {memberData.domain}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
