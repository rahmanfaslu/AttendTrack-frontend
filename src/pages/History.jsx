import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { ArrowLeft, LogIn, LogOut, CheckCircle, Clock, MapPin, Building2 } from 'lucide-react';

function formatTime(t) {
  return t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
}
function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
function duration(checkIn, checkOut) {
  if (!checkIn || !checkOut) return null;
  const diff = Math.round((new Date(checkOut) - new Date(checkIn)) / 60000);
  const h = Math.floor(diff / 60), m = diff % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function History() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/attendance/user/${user?._id || user?.userId}`)
      .then(({ data }) => setRecords(data))
      .finally(() => setLoading(false));
  }, []);

  const complete = records.filter(r => r.checkIn?.time && r.checkOut?.time).length;

  return (
    <div className="min-h-screen bg-[#F4F6F9]">

      {/* Nav */}
      <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link to="/" className="w-8 h-8 rounded-lg bg-[#F4F6F9] hover:bg-[#E5E7EB] flex items-center justify-center transition">
            <ArrowLeft size={15} className="text-[#374151]" />
          </Link>
          <div className="flex items-center gap-2">
            <Building2 size={15} className="text-[#9CA3AF]" />
            <span className="text-sm font-medium text-[#0F1923]">Attendance History</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Days', value: records.length, icon: <Clock size={14} /> },
            { label: 'Complete', value: complete, icon: <CheckCircle size={14} /> },
            { label: 'Incomplete', value: records.length - complete, icon: <LogOut size={14} /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white border border-[#E5E7EB] rounded-2xl p-4">
              <div className="flex items-center gap-1.5 text-[#9CA3AF] mb-2">{icon}<span className="text-xs">{label}</span></div>
              <p className="text-2xl font-semibold text-[#0F1923]">{value}</p>
            </div>
          ))}
        </div>

        {/* Records */}
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="w-6 h-6 border-2 border-[#E5E7EB] border-t-[#0F1923] rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 text-center">
            <Clock size={28} className="text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#6B7280]">No attendance records yet</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Check in at the shop to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(r => {
              const dur = duration(r.checkIn?.time, r.checkOut?.time);
              const done = r.checkIn?.time && r.checkOut?.time;
              return (
                <div key={r._id} className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-[#0F1923]">{formatDate(r.date)}</p>
                      {dur && <p className="text-xs text-[#9CA3AF] mt-0.5">Duration: {dur}</p>}
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      done ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {done ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Check In */}
                    <div className="bg-[#F4F6F9] rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <LogIn size={12} className="text-[#9CA3AF]" />
                        <span className="text-xs text-[#6B7280]">Check In</span>
                      </div>
                      <p className={`text-base font-semibold tabular-nums ${r.checkIn?.time ? 'text-[#0F1923]' : 'text-[#D1D5DB]'}`}>
                        {formatTime(r.checkIn?.time)}
                      </p>
                      {r.checkIn?.image && (
                        <img src={`http://localhost:5000${r.checkIn.image}`} alt="check-in"
                          className="w-8 h-8 rounded-lg object-cover mt-2" />
                      )}
                    </div>

                    {/* Check Out */}
                    <div className="bg-[#F4F6F9] rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <LogOut size={12} className="text-[#9CA3AF]" />
                        <span className="text-xs text-[#6B7280]">Check Out</span>
                      </div>
                      <p className={`text-base font-semibold tabular-nums ${r.checkOut?.time ? 'text-[#0F1923]' : 'text-[#D1D5DB]'}`}>
                        {formatTime(r.checkOut?.time)}
                      </p>
                      {r.checkOut?.image && (
                        <img src={`http://localhost:5000${r.checkOut.image}`} alt="check-out"
                          className="w-8 h-8 rounded-lg object-cover mt-2" />
                      )}
                    </div>
                  </div>

                  {r.checkIn?.latitude && (
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#F3F4F6]">
                      <MapPin size={11} className="text-[#D1D5DB]" />
                      <p className="text-xs text-[#9CA3AF]">
                        {r.checkIn.latitude.toFixed(5)}, {r.checkIn.longitude.toFixed(5)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}