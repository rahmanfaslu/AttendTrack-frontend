import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Camera from '../components/Camera';
import api from '../api/axios';
import {
  MapPin, Clock, LogIn, LogOut, History, Power,
  CheckCircle, XCircle, AlertCircle, Building2, Navigation
} from 'lucide-react';

const SHOP = { lat: 9.9312, lng: 76.2673 };

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000, toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function formatTime(t) {
  if (!t) return null;
  return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [todayRecord, setTodayRecord] = useState(null);
  const [showCamera, setShowCamera] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchToday = useCallback(async () => {
    try {
      const { data } = await api.get('/attendance/today');
      setTodayRecord(data);
    } catch { }
  }, []);

  useEffect(() => { fetchToday(); }, [fetchToday]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported.');
      return;
    }
    const id = navigator.geolocation.watchPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        setDistance(haversine(latitude, longitude, SHOP.lat, SHOP.lng));
        setLocationError('');
      },
      () => setLocationError('Location access denied.'),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const submitAttendance = async (type, blob) => {
    if (!location) return setMessage({ type: 'error', text: 'GPS location not available.' });
    if (distance > 100) return setMessage({ type: 'error', text: `You are ${distance}m from the shop. Move closer to mark attendance.` });
    if (!blob) return setMessage({ type: 'error', text: 'No photo captured.' });

    setLoading(true);
    setMessage(null);

    try {
      const form = new FormData();
      form.append('latitude', String(location.latitude));
      form.append('longitude', String(location.longitude));
      form.append('image', blob, 'selfie.jpg');
      const { data } = await api.post(`/attendance/${type}`, form);
      setMessage({ type: 'success', text: data.message });
      setTodayRecord(data.record);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to mark attendance.' });
    } finally {
      setLoading(false);
      setShowCamera(null);
    }
  };

  const nearShop = distance !== null && distance <= 300;
  const canCheckIn = !todayRecord?.checkIn?.time;
  const canCheckOut = todayRecord?.checkIn?.time && !todayRecord?.checkOut?.time;

  const today = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="min-h-screen bg-[#F4F6F9]">

      {/* Top Nav */}
      <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0F1923] rounded-lg flex items-center justify-center">
              <Building2 size={15} color="white" />
            </div>
            <span className="font-semibold text-[#0F1923] tracking-wide text-sm">AttendTrack</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/history"
              className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#0F1923] px-3 py-2 rounded-lg hover:bg-[#F4F6F9] transition">
              <History size={15} />
              <span className="hidden sm:inline">History</span>
            </Link>
            <button onClick={logout}
              className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition">
              <Power size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">

        {/* Greeting + Clock */}
        <div className="bg-[#0F1923] rounded-2xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#6B7A8D] text-xs font-medium uppercase tracking-widest mb-1">{today}</p>
              <h2 style={{ fontFamily: 'Poppins'   }}
                className="text-3xl mb-1">Good day, {user?.name}</h2>
              <p className="text-[#6B7A8D] text-sm">ID: {user?.userId}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-light tabular-nums">{ }</p>
              <p className="text-[#6B7A8D] text-xs mt-1">Current time</p>
            </div>
          </div>
        </div>

        {/* Location Status */}
        <div className={`rounded-2xl p-5 border flex items-center gap-4 ${locationError ? 'bg-amber-50 border-amber-200'
            : nearShop ? 'bg-green-50 border-green-200'
              : distance === null ? 'bg-white border-[#E5E7EB]'
                : 'bg-red-50 border-red-200'
          }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${locationError ? 'bg-amber-100'
              : nearShop ? 'bg-green-100'
                : distance === null ? 'bg-[#F4F6F9]'
                  : 'bg-red-100'
            }`}>
            {locationError ? <AlertCircle size={18} className="text-amber-600" />
              : nearShop ? <CheckCircle size={18} className="text-green-600" />
                : distance === null ? <Navigation size={18} className="text-[#9CA3AF]" />
                  : <XCircle size={18} className="text-red-500" />}
          </div>
          <div className="flex-1 min-w-0">
            {locationError ? (
              <>
                <p className="text-sm font-medium text-amber-800">Location unavailable</p>
                <p className="text-xs text-amber-600 mt-0.5">{locationError}</p>
              </>
            ) : distance === null ? (
              <>
                <p className="text-sm font-medium text-[#374151]">Acquiring GPS signal...</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Please wait</p>
              </>
            ) : nearShop ? (
              <>
                <p className="text-sm font-medium text-green-800">Within shop range</p>
                <p className="text-xs text-green-600 mt-0.5">You are {distance}m from the shop — attendance allowed</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-red-700">Outside shop range</p>
                <p className="text-xs text-red-500 mt-0.5">You are {distance}m away. Move within 100m to mark attendance.</p>
              </>
            )}
          </div>
          {distance !== null && (
            <div className="text-right flex-shrink-0">
              <p className={`text-2xl font-semibold tabular-nums ${nearShop ? 'text-green-700' : 'text-red-600'}`}>
                {distance}<span className="text-sm font-normal">m</span>
              </p>
            </div>
          )}
        </div>

        {/* Today's Record */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-widest mb-4">Today's Attendance</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F4F6F9] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <LogIn size={14} className="text-[#9CA3AF]" />
                <span className="text-xs text-[#6B7280] font-medium">Check In</span>
              </div>
              {todayRecord?.checkIn?.time ? (
                <>
                  <p className="text-xl font-semibold text-[#0F1923] tabular-nums">{formatTime(todayRecord.checkIn.time)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-xs text-green-600">Recorded</span>
                  </div>
                </>
              ) : (
                <p className="text-xl font-light text-[#D1D5DB]">--:--</p>
              )}
            </div>

            <div className="bg-[#F4F6F9] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <LogOut size={14} className="text-[#9CA3AF]" />
                <span className="text-xs text-[#6B7280] font-medium">Check Out</span>
              </div>
              {todayRecord?.checkOut?.time ? (
                <>
                  <p className="text-xl font-semibold text-[#0F1923] tabular-nums">{formatTime(todayRecord.checkOut.time)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-xs text-blue-600">Recorded</span>
                  </div>
                </>
              ) : (
                <p className="text-xl font-light text-[#D1D5DB]">--:--</p>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`rounded-xl px-4 py-3 flex items-center gap-3 text-sm border ${message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-600'
            }`}>
            {message.type === 'success'
              ? <CheckCircle size={16} className="flex-shrink-0" />
              : <XCircle size={16} className="flex-shrink-0" />}
            {message.text}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          
          <button
            disabled={!canCheckIn || !nearShop || loading}
            onClick={() => { setMessage(null); setShowCamera('checkin'); }}
            className="bg-[#0F1923] hover:bg-[#1a2a3a] disabled:opacity-40 disabled:cursor-not-allowed
              text-white rounded-2xl py-5 font-medium text-sm transition flex flex-col items-center gap-2">
            {loading && showCamera === 'checkin'
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <LogIn size={20} />}
            <span>Check In</span>
          </button>

          <button
            disabled={!canCheckOut || !nearShop || loading}
            onClick={() => { setMessage(null); setShowCamera('checkout'); }}
            className="bg-white hover:bg-[#F4F6F9] disabled:opacity-40 disabled:cursor-not-allowed
              text-[#0F1923] border border-[#E5E7EB] rounded-2xl py-5 font-medium text-sm transition flex flex-col items-center gap-2">
            {loading && showCamera === 'checkout'
              ? <span className="w-5 h-5 border-2 border-[#0F1923]/20 border-t-[#0F1923] rounded-full animate-spin" />
              : <LogOut size={20} />}
            <span>Check Out</span>
          </button>
        </div>

        {/* Shop Location Info */}
        <div className="flex items-center gap-2 px-1">
          <MapPin size={13} className="text-[#9CA3AF] flex-shrink-0" />
          <p className="text-xs text-[#9CA3AF]">
            Shop: {SHOP.lat}, {SHOP.lng} · 100m radius
          </p>
        </div>
      </main>

      {showCamera && (
        <Camera
          onCapture={blob => submitAttendance(showCamera, blob)}
          onCancel={() => setShowCamera(null)}
          distance={distance}
        />
      )}
    </div>
  );
}