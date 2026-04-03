import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle, Bell, BellOff, Image as ImageIcon, Send, Loader2, LogOut, LogIn, Upload, X, User as UserIcon } from 'lucide-react';
import { Todo } from './types';
import { sendWhatsAppText, sendWhatsAppImage } from './services/whatsapp';
import { uploadFile } from './services/upload';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

// Simple Custom Auth for NoteNDo
interface CustomUser {
  uid: string;
  phoneNumber: string;
  name?: string;
  timezone?: string;
  theme?: 'light' | 'dark' | 'auto';
  timeFormat?: '12h' | '24h';
}

const timezones = [
  "Asia/Kolkata",
  "UTC",
  "America/New_York",
  "Europe/London",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Asia/Dubai",
  "Asia/Singapore",
];

export default function App() {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileTimezone, setProfileTimezone] = useState('Asia/Kolkata');
  const [profileTheme, setProfileTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [profileTimeFormat, setProfileTimeFormat] = useState<'12h' | '24h'>('12h');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  
  // Login states
  const [loginPhone, setLoginPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCompletingProfile, setIsCompletingProfile] = useState(false);
  const [tempUser, setTempUser] = useState<CustomUser | null>(null);
  const [newName, setNewName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const countries = [
    { code: '+91', name: 'India' },
    { code: '+1', name: 'USA' },
    { code: '+44', name: 'UK' },
    { code: '+61', name: 'Australia' },
    { code: '+971', name: 'UAE' },
    { code: '+65', name: 'Singapore' },
  ];

  useEffect(() => {
    const applyTheme = () => {
      const currentTheme = theme;
      const root = window.document.documentElement;
      
      console.log('Applying theme:', currentTheme);
      if (currentTheme === 'dark' || (currentTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
        console.log('Added dark class');
      } else {
        root.classList.remove('dark');
        console.log('Removed dark class');
      }
    };

    applyTheme();
    
    // Listen for system theme changes if set to auto
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'auto') {
        applyTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    // Check local storage for existing session
    const savedUser = localStorage.getItem('notendo_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      // Sync theme from user object if available
      if (parsedUser.theme) {
        setTheme(parsedUser.theme);
        setProfileTheme(parsedUser.theme);
      }
    }
    
    const savedTheme = localStorage.getItem('notendo_theme') as 'light' | 'dark' | 'auto';
    if (savedTheme && !savedUser) { // Only fallback to local theme if no user session
      setTheme(savedTheme);
      setProfileTheme(savedTheme);
    }
    
    setAuthLoading(false);
  }, []);

  const fetchTodos = async () => {
    if (!user) return;
    try {
      // Check if account still exists
      const userCheckRes = await fetch(`/api/db/users/${user.uid}`);
      const userData = await userCheckRes.json();
      
      if (!userData || Object.keys(userData).length === 0) {
        // Account deleted or suspended
        handleLogout();
        toast.error('Account Suspended', {
          duration: 5000,
          icon: '🚫'
        });
        return;
      }

      const response = await fetch(`/api/db/todos?userId=${user.uid}`);
      const data = await response.json();
      if (data && !data.error) {
        const todoList = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }));
        setTodos(todoList.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setTodos([]);
        if (data && data.error) {
          console.error('Database error:', data.error);
        }
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setAuthLoading(false);
      return;
    }

    fetchTodos();
    const interval = setInterval(fetchTodos, 5000); // Poll every 5s for updates
    return () => clearInterval(interval);
  }, [user]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = loginPhone.trim();
    if (!phone) return;

    // Basic validation: must be digits and reasonable length
    if (!/^\d{8,12}$/.test(phone)) {
      toast.error('Please enter a valid WhatsApp number (8-12 digits)');
      return;
    }

    setIsLoggingIn(true);
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const fullPhone = countryCode.replace('+', '') + phone;
    
    try {
      await sendWhatsAppText(
        fullPhone,
        `Your NoteNDo login OTP is: ${generatedOtp}. Do not share it with anyone.`
      );
      setSentOtp(generatedOtp);
      setIsOtpSent(true);
      toast.success('OTP sent to your WhatsApp!');
    } catch (error) {
      toast.error('Failed to send OTP. Please check the number.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === sentOtp) {
      const fullPhone = countryCode.replace('+', '') + loginPhone.trim();
      
      try {
        const response = await fetch(`/api/db/users/${fullPhone}`);
        const profile = await response.json();
        
        if (!profile.name) {
          // New user or missing name
          setTempUser({
            uid: fullPhone,
            phoneNumber: fullPhone,
            timezone: 'Asia/Kolkata',
            theme: 'auto',
            timeFormat: '12h',
          });
          setIsCompletingProfile(true);
        } else {
          // Existing user
          const newUser: CustomUser = {
            uid: fullPhone,
            phoneNumber: fullPhone,
            name: profile.name,
            timezone: profile.timezone || 'Asia/Kolkata',
            theme: profile.theme || 'auto',
            timeFormat: profile.timeFormat || '12h',
          };
          setUser(newUser);
          localStorage.setItem('notendo_user', JSON.stringify(newUser));
          toast.success('Logged in successfully!');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback for error
        setTempUser({
          uid: fullPhone,
          phoneNumber: fullPhone,
          timezone: 'Asia/Kolkata',
          theme: 'auto',
          timeFormat: '12h',
        });
        setIsCompletingProfile(true);
      }
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !tempUser) return;

    try {
      await fetch(`/api/db/users/${tempUser.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          timezone: 'Asia/Kolkata',
          phoneNumber: tempUser.phoneNumber,
          theme: 'auto',
          timeFormat: '12h',
        }),
      });

      const newUser: CustomUser = {
        ...tempUser,
        name: newName.trim(),
        theme: 'auto',
        timeFormat: '12h',
      };

      setUser(newUser);
      localStorage.setItem('notendo_user', JSON.stringify(newUser));
      toast.success('Account created successfully!');
      setIsCompletingProfile(false);
      setTempUser(null);
      setNewName('');
    } catch (error) {
      toast.error('Failed to create account');
    }
  };

  const closeProfile = () => {
    const savedTheme = localStorage.getItem('notendo_theme') as 'light' | 'dark' | 'auto' || 'auto';
    setTheme(savedTheme);
    setProfileTheme(savedTheme);
    setShowProfile(false);
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const profileData = { 
        name: profileName, 
        timezone: profileTimezone,
        timeFormat: profileTimeFormat,
        theme: profileTheme
      };
      
      await fetch(`/api/db/users/${user.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      
      // Update theme locally
      setTheme(profileTheme);
      localStorage.setItem('notendo_theme', profileTheme);
      
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('notendo_user', JSON.stringify(updatedUser));
      toast.success('Profile updated!');
      setShowProfile(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileTimezone(user.timezone || 'Asia/Kolkata');
      setProfileTimeFormat(user.timeFormat || '12h');
      if (user.theme) {
        setProfileTheme(user.theme);
        setTheme(user.theme);
      }
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('notendo_user');
    setIsOtpSent(false);
    setSentOtp(null);
    setOtp('');
    setLoginPhone('');
    toast.success('Logged out');
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !user) return;

    setLoading(true);
    try {
      let uploadedImageUrl = '';
      if (selectedFile) {
        setUploading(true);
        uploadedImageUrl = await uploadFile(selectedFile);
        setUploading(false);
      }

      const todoData: any = {
        userId: user.uid,
        text: newTodo,
        completed: false,
        createdAt: Date.now(),
        reminderEnabled,
        reminderSent: false,
      };

      if (reminderEnabled) {
        todoData.phoneNumber = user.phoneNumber;
        todoData.reminderDate = reminderDate;
        todoData.reminderTime = reminderTime;
      }
      if (uploadedImageUrl) {
        todoData.imageUrl = uploadedImageUrl;
      }

      const response = await fetch('/api/db/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
      });

      if (!response.ok) throw new Error('Failed to save todo');
      
      await fetchTodos(); // Refresh list

      if (reminderEnabled) {
        toast.success('Task added! Reminder scheduled.');
      } else {
        toast.success('Task added!');
      }

      setNewTodo('');
      setReminderDate('');
      setReminderTime('');
      setReminderEnabled(false);
      setSelectedFile(null);
      setLoading(false);
      setUploading(false);
    } catch (error) {
      console.error('Error adding todo:', error);
      toast.error('Failed to add task');
      setLoading(false);
      setUploading(false);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      await fetch(`/api/db/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
      await fetchTodos();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    if (user?.timeFormat === '24h') return timeStr;
    
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const deleteTodo = async (id: string) => {
    try {
      await fetch(`/api/db/todos/${id}`, {
        method: 'DELETE',
      });
      await fetchTodos();
      toast.success('Task deleted');
      setShowDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800 text-center max-w-md w-full"
        >
          <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-200 dark:shadow-none">
            <CheckCircle className="text-white" size={48} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">NoteNDo</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg">Organize your life with smart WhatsApp reminders.</p>
          
          {!isOtpSent && !isCompletingProfile ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="flex space-x-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                >
                  {countries.map(c => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  required
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="WhatsApp Number"
                  className="flex-1 px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center space-x-3 shadow-lg disabled:opacity-50"
              >
                {isLoggingIn ? <Loader2 className="animate-spin" /> : <Send size={24} />}
                <span>{isLoggingIn ? 'Sending OTP...' : 'Send OTP'}</span>
              </button>
            </form>
          ) : isOtpSent && !isCompletingProfile ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all text-center tracking-[0.5em] text-2xl font-bold"
                  maxLength={6}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center space-x-3 shadow-lg"
              >
                <CheckCircle size={24} />
                <span>Verify & Login</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOtpSent(false)}
                className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline"
              >
                Change Number
              </button>
            </form>
          ) : (
            <form onSubmit={handleCompleteProfile} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="What's your name?"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all text-center text-xl font-bold"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center space-x-3 shadow-lg"
              >
                <UserIcon size={24} />
                <span>Complete Account</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <Toaster position="top-right" />
      
      <div className="max-w-2xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div className="text-left">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              NoteNDo
            </motion.h1>
            <p className="text-slate-500 dark:text-slate-400">Hello, {user.name || user.phoneNumber}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowProfile(true)}
              className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="Profile"
            >
              <UserIcon size={24} />
            </button>
            <button
              onClick={handleLogout}
              className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={24} />
            </button>
          </div>
        </header>

        <section className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none p-8 mb-10 border border-slate-100 dark:border-slate-800">
          <form onSubmit={addTodo} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all text-xl"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setReminderEnabled(!reminderEnabled)}
                    className={`p-2.5 rounded-xl transition-all ${reminderEnabled ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
                  >
                    {reminderEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                  </button>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">WhatsApp Reminder</span>
                </div>
                {reminderEnabled && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <div className="relative flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-2.5 bg-slate-200 dark:bg-slate-700 text-slate-500 rounded-xl">
                  <Upload size={20} />
                </div>
                <div className="flex-1 truncate">
                  {selectedFile ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                        {selectedFile.name}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setSelectedFile(null)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="text-sm font-medium text-slate-400 cursor-pointer block w-full">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !newTodo.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading || uploading ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
              <span>{uploading ? 'Uploading Image...' : loading ? 'Adding Task...' : 'Add Task'}</span>
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <AnimatePresence mode="popLayout">
            {todos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all ${todo.completed ? 'opacity-60 grayscale-[0.5]' : ''}`}
              >
                <div className="flex items-center space-x-5 flex-1">
                  <button
                    onClick={() => toggleTodo(todo.id, todo.completed)}
                    className={`transition-all transform hover:scale-110 ${todo.completed ? 'text-emerald-500' : 'text-slate-200 dark:text-slate-700 hover:text-indigo-500'}`}
                  >
                    {todo.completed ? <CheckCircle size={32} /> : <Circle size={32} />}
                  </button>
                  <div className="flex-1">
                    <p className={`text-xl font-semibold text-slate-900 dark:text-white ${todo.completed ? 'line-through text-slate-400 dark:text-slate-600' : ''}`}>
                      {todo.text}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      {todo.reminderEnabled && (
                        <div className="flex flex-wrap gap-2">
                          {(todo.reminderDate || todo.reminderTime) && (
                            <span className="flex items-center text-xs text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">
                              <Bell size={12} className="mr-1" />
                              {todo.reminderDate ? todo.reminderDate.split('-').reverse().join('/') : ''} {formatTime(todo.reminderTime)}
                            </span>
                          )}
                        </div>
                      )}
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {todo.createdAt && !isNaN(new Date(todo.createdAt).getTime()) 
                          ? new Date(todo.createdAt).toLocaleDateString('en-GB') 
                          : 'No Date'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {todo.imageUrl && (
                    <a 
                      href={todo.imageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <ImageIcon size={20} />
                    </a>
                  )}
                  <button
                    onClick={() => setShowDeleteConfirm(todo.id)}
                    className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {todos.length === 0 && !loading && (
            <div className="text-center py-24 bg-white/50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="bg-slate-200 dark:bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="text-slate-400 dark:text-slate-600" size={40} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-xl">Your list is empty.</p>
              <p className="text-slate-400 dark:text-slate-500">Add a task to get started!</p>
            </div>
          )}
        </section>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Profile Settings</h3>
                <button onClick={closeProfile} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={updateProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Display Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Your Name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Timezone</label>
                  <select
                    value={profileTimezone}
                    onChange={(e) => setProfileTimezone(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    {timezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Theme</label>
                    <select
                      value={profileTheme}
                      onChange={(e) => {
                        const newTheme = e.target.value as any;
                        setProfileTheme(newTheme);
                        setTheme(newTheme);
                      }}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Time Format</label>
                    <select
                      value={profileTimeFormat}
                      onChange={(e) => setProfileTimeFormat(e.target.value as any)}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                      <option value="12h">12h</option>
                      <option value="24h">24h</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-indigo-100 dark:shadow-none text-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center border border-slate-100 dark:border-slate-800"
            >
              <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/20 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-100 dark:shadow-none">
                <Trash2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Delete Task?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg leading-relaxed">This action cannot be undone. Are you sure you want to remove this task?</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-6 py-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all text-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteTodo(showDeleteConfirm)}
                  className="flex-1 px-6 py-5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-200 dark:shadow-none text-lg"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
