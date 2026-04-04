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
  token?: string;
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
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCompletingProfile, setIsCompletingProfile] = useState(false);
  const [tempUser, setTempUser] = useState<CustomUser | null>(null);
  const [newName, setNewName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const countries = [
  { code: '+1', name: "Canada" },
  { code: '+7', name: "Russia" },
  { code: '+20', name: "Egypt" },
  { code: '+27', name: "South Africa" },
  { code: '+30', name: "Greece" },
  { code: '+31', name: "Netherlands" },
  { code: '+32', name: "Belgium" },
  { code: '+33', name: "France" },
  { code: '+34', name: "Spain" },
  { code: '+36', name: "Hungary" },
  { code: '+39', name: "Italy" },
  { code: '+40', name: "Romania" },
  { code: '+41', name: "Switzerland" },
  { code: '+43', name: "Austria" },
  { code: '+44', name: "Guernsey" },
  { code: '+45', name: "Denmark" },
  { code: '+46', name: "Sweden" },
  { code: '+47', name: "Norway" },
  { code: '+48', name: "Poland" },
  { code: '+49', name: "Germany" },
  { code: '+51', name: "Peru" },
  { code: '+52', name: "Mexico" },
  { code: '+53', name: "Cuba" },
  { code: '+54', name: "Argentina" },
  { code: '+55', name: "Brazil" },
  { code: '+56', name: "Chile" },
  { code: '+57', name: "Colombia" },
  { code: '+58', name: "Venezuela, Bolivarian Republic of Venezuela" },
  { code: '+60', name: "Malaysia" },
  { code: '+61', name: "Australia" },
  { code: '+62', name: "Indonesia" },
  { code: '+63', name: "Philippines" },
  { code: '+64', name: "New Zealand" },
  { code: '+65', name: "Singapore" },
  { code: '+66', name: "Thailand" },
  { code: '+77', name: "Kazakhstan" },
  { code: '+81', name: "Japan" },
  { code: '+82', name: "Korea, Republic of South Korea" },
  { code: '+84', name: "Vietnam" },
  { code: '+86', name: "China" },
  { code: '+90', name: "Turkey" },
  { code: '+91', name: "India" },
  { code: '+92', name: "Pakistan" },
  { code: '+93', name: "Afghanistan" },
  { code: '+94', name: "Sri Lanka" },
  { code: '+95', name: "Myanmar" },
  { code: '+98', name: "Iran, Islamic Republic of Persian Gulf" },
  { code: '+211', name: "South Sudan" },
  { code: '+212', name: "Morocco" },
  { code: '+213', name: "Algeria" },
  { code: '+216', name: "Tunisia" },
  { code: '+218', name: "Libyan Arab Jamahiriya" },
  { code: '+220', name: "Gambia" },
  { code: '+221', name: "Senegal" },
  { code: '+222', name: "Mauritania" },
  { code: '+223', name: "Mali" },
  { code: '+224', name: "Guinea" },
  { code: '+225', name: "Cote d'Ivoire" },
  { code: '+226', name: "Burkina Faso" },
  { code: '+227', name: "Niger" },
  { code: '+228', name: "Togo" },
  { code: '+229', name: "Benin" },
  { code: '+230', name: "Mauritius" },
  { code: '+231', name: "Liberia" },
  { code: '+232', name: "Sierra Leone" },
  { code: '+233', name: "Ghana" },
  { code: '+234', name: "Nigeria" },
  { code: '+235', name: "Chad" },
  { code: '+236', name: "Central African Republic" },
  { code: '+237', name: "Cameroon" },
  { code: '+238', name: "Cape Verde" },
  { code: '+239', name: "Sao Tome and Principe" },
  { code: '+240', name: "Equatorial Guinea" },
  { code: '+241', name: "Gabon" },
  { code: '+242', name: "Congo" },
  { code: '+243', name: "Congo, The Democratic Republic of the Congo" },
  { code: '+244', name: "Angola" },
  { code: '+245', name: "Guinea-Bissau" },
  { code: '+246', name: "British Indian Ocean Territory" },
  { code: '+248', name: "Seychelles" },
  { code: '+249', name: "Sudan" },
  { code: '+250', name: "Rwanda" },
  { code: '+251', name: "Ethiopia" },
  { code: '+252', name: "Somalia" },
  { code: '+253', name: "Djibouti" },
  { code: '+254', name: "Kenya" },
  { code: '+255', name: "Tanzania, United Republic of Tanzania" },
  { code: '+256', name: "Uganda" },
  { code: '+257', name: "Burundi" },
  { code: '+258', name: "Mozambique" },
  { code: '+260', name: "Zambia" },
  { code: '+261', name: "Madagascar" },
  { code: '+262', name: "Mayotte" },
  { code: '+263', name: "Zimbabwe" },
  { code: '+264', name: "Namibia" },
  { code: '+265', name: "Malawi" },
  { code: '+266', name: "Lesotho" },
  { code: '+267', name: "Botswana" },
  { code: '+268', name: "Swaziland" },
  { code: '+269', name: "Comoros" },
  { code: '+290', name: "Saint Helena, Ascension and Tristan Da Cunha" },
  { code: '+291', name: "Eritrea" },
  { code: '+297', name: "Aruba" },
  { code: '+298', name: "Faroe Islands" },
  { code: '+299', name: "Greenland" },
  { code: '+ 345', name: "Cayman Islands" },
  { code: '+350', name: "Gibraltar" },
  { code: '+351', name: "Portugal" },
  { code: '+352', name: "Luxembourg" },
  { code: '+353', name: "Ireland" },
  { code: '+354', name: "Iceland" },
  { code: '+355', name: "Albania" },
  { code: '+356', name: "Malta" },
  { code: '+357', name: "Cyprus" },
  { code: '+358', name: "Aland Islands" },
  { code: '+359', name: "Bulgaria" },
  { code: '+370', name: "Lithuania" },
  { code: '+371', name: "Latvia" },
  { code: '+372', name: "Estonia" },
  { code: '+373', name: "Moldova" },
  { code: '+374', name: "Armenia" },
  { code: '+375', name: "Belarus" },
  { code: '+376', name: "Andorra" },
  { code: '+377', name: "Monaco" },
  { code: '+378', name: "San Marino" },
  { code: '+379', name: "Holy See (Vatican City State)" },
  { code: '+380', name: "Ukraine" },
  { code: '+381', name: "Serbia" },
  { code: '+382', name: "Montenegro" },
  { code: '+385', name: "Croatia" },
  { code: '+386', name: "Slovenia" },
  { code: '+387', name: "Bosnia and Herzegovina" },
  { code: '+389', name: "Macedonia" },
  { code: '+420', name: "Czech Republic" },
  { code: '+421', name: "Slovakia" },
  { code: '+423', name: "Liechtenstein" },
  { code: '+500', name: "Falkland Islands (Malvinas)" },
  { code: '+501', name: "Belize" },
  { code: '+502', name: "Guatemala" },
  { code: '+503', name: "El Salvador" },
  { code: '+504', name: "Honduras" },
  { code: '+505', name: "Nicaragua" },
  { code: '+506', name: "Costa Rica" },
  { code: '+507', name: "Panama" },
  { code: '+508', name: "Saint Pierre and Miquelon" },
  { code: '+509', name: "Haiti" },
  { code: '+590', name: "Guadeloupe" },
  { code: '+591', name: "Bolivia, Plurinational State of" },
  { code: '+593', name: "Ecuador" },
  { code: '+594', name: "French Guiana" },
  { code: '+595', name: "Guyana" },
  { code: '+596', name: "Martinique" },
  { code: '+597', name: "Suriname" },
  { code: '+598', name: "Uruguay" },
  { code: '+599', name: "Netherlands Antilles" },
  { code: '+670', name: "Timor-Leste" },
  { code: '+672', name: "Antarctica" },
  { code: '+673', name: "Brunei Darussalam" },
  { code: '+674', name: "Nauru" },
  { code: '+675', name: "Papua New Guinea" },
  { code: '+676', name: "Tonga" },
  { code: '+677', name: "Solomon Islands" },
  { code: '+678', name: "Vanuatu" },
  { code: '+679', name: "Fiji" },
  { code: '+680', name: "Palau" },
  { code: '+681', name: "Wallis and Futuna" },
  { code: '+682', name: "Cook Islands" },
  { code: '+683', name: "Niue" },
  { code: '+685', name: "Samoa" },
  { code: '+686', name: "Kiribati" },
  { code: '+687', name: "New Caledonia" },
  { code: '+688', name: "Tuvalu" },
  { code: '+689', name: "French Polynesia" },
  { code: '+690', name: "Tokelau" },
  { code: '+691', name: "Micronesia, Federated States of Micronesia" },
  { code: '+692', name: "Marshall Islands" },
  { code: '+850', name: "Korea, Democratic People's Republic of Korea" },
  { code: '+852', name: "Hong Kong" },
  { code: '+853', name: "Macao" },
  { code: '+855', name: "Cambodia" },
  { code: '+856', name: "Laos" },
  { code: '+872', name: "Pitcairn" },
  { code: '+880', name: "Bangladesh" },
  { code: '+886', name: "Taiwan" },
  { code: '+960', name: "Maldives" },
  { code: '+961', name: "Lebanon" },
  { code: '+962', name: "Jordan" },
  { code: '+963', name: "Syrian Arab Republic" },
  { code: '+964', name: "Iraq" },
  { code: '+965', name: "Kuwait" },
  { code: '+966', name: "Saudi Arabia" },
  { code: '+967', name: "Yemen" },
  { code: '+968', name: "Oman" },
  { code: '+970', name: "Palestinian Territory, Occupied" },
  { code: '+971', name: "United Arab Emirates" },
  { code: '+972', name: "Israel" },
  { code: '+973', name: "Bahrain" },
  { code: '+974', name: "Qatar" },
  { code: '+975', name: "Bhutan" },
  { code: '+976', name: "Mongolia" },
  { code: '+977', name: "Nepal" },
  { code: '+992', name: "Tajikistan" },
  { code: '+993', name: "Turkmenistan" },
  { code: '+994', name: "Azerbaijan" },
  { code: '+995', name: "Georgia" },
  { code: '+996', name: "Kyrgyzstan" },
  { code: '+998', name: "Uzbekistan" },
  { code: '+1242', name: "Bahamas" },
  { code: '+1246', name: "Barbados" },
  { code: '+1264', name: "Anguilla" },
  { code: '+1268', name: "Antigua and Barbuda" },
  { code: '+1284', name: "Virgin Islands, British" },
  { code: '+1340', name: "Virgin Islands, U.S." },
  { code: '+1441', name: "Bermuda" },
  { code: '+1473', name: "Grenada" },
  { code: '+1649', name: "Turks and Caicos Islands" },
  { code: '+1664', name: "Montserrat" },
  { code: '+1670', name: "Northern Mariana Islands" },
  { code: '+1671', name: "Guam" },
  { code: '+1684', name: "AmericanSamoa" },
  { code: '+1758', name: "Saint Lucia" },
  { code: '+1767', name: "Dominica" },
  { code: '+1784', name: "Saint Vincent and the Grenadines" },
  { code: '+1849', name: "Dominican Republic" },
  { code: '+1868', name: "Trinidad and Tobago" },
  { code: '+1869', name: "Saint Kitts and Nevis" },
  { code: '+1876', name: "Jamaica" },
  { code: '+1939', name: "Puerto Rico" }
];

  useEffect(() => {
    const applyTheme = () => {
      const currentTheme = theme;
      const root = window.document.documentElement;
      
      if (currentTheme === 'dark' || (currentTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
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
      if (!userCheckRes.ok) {
        const text = await userCheckRes.text();
        console.error('User check failed:', userCheckRes.status, text);
        return;
      }
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
      if (!response.ok) {
        const text = await response.text();
        console.error('Fetch todos failed:', response.status, text);
        return;
      }
      
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
    const fullPhone = countryCode.replace('+', '') + phone;
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: fullPhone }),
      });

      if (!response.ok) throw new Error('Failed to send OTP');

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
    const fullPhone = countryCode.replace('+', '') + loginPhone.trim();
    
    try {
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: fullPhone, otp }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error || 'Invalid OTP');
      }

      const { token } = await verifyRes.json();
      
      const response = await fetch(`/api/db/users/${fullPhone}`);
      if (!response.ok) {
        const text = await response.text();
        console.error('Verify OTP: User profile fetch failed:', response.status, text);
        throw new Error('Failed to fetch profile');
      }
      const profile = await response.json();
      
      if (!profile.name) {
        // New user or missing name
        setTempUser({
          uid: fullPhone,
          phoneNumber: fullPhone,
          timezone: 'Asia/Kolkata',
          theme: 'auto',
          timeFormat: '12h',
          token,
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
          token,
        };
        setUser(newUser);
        localStorage.setItem('notendo_user', JSON.stringify(newUser));
        toast.success('Logged in successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !tempUser) return;

    try {
      const response = await fetch(`/api/db/users/${tempUser.uid}`, {
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

      if (!response.ok) {
        const text = await response.text();
        console.error('Complete profile failed:', response.status, text);
        throw new Error('Failed to complete profile');
      }

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
          <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg">Stay organized. Never miss a task.</p>
          
          {!isOtpSent && !isCompletingProfile ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="flex gap-2 w-full">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-[30%] min-w-[90px] px-3 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white"
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
                  placeholder="••••••••••"
                  className="w-[70%] px-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white"
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
                   onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setOtp(value);
                    }}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all text-center tracking-[0.5em] text-2xl font-bold"
                  maxLength={6}
                  inputMode="numeric"
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
              <div 
                className={`flex flex-col space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-700 select-none`}
                onClick={() => setReminderEnabled(!reminderEnabled)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2.5 rounded-xl transition-all ${reminderEnabled ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
                  >
                    {reminderEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">WhatsApp Reminder</span>
                </div>
                {reminderEnabled && (
                  <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
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

              <label className={`relative flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-all ${!selectedFile ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700' : ''}`}>
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-slate-400 block w-full">
                      Upload Image
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
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
              <div key={todo.id} className="relative overflow-hidden rounded-2xl group">
                {/* Swipe Backgrounds - Only on Mobile */}
                {isMobile && (
                  <>
                    <div className={`absolute inset-0 flex items-center justify-between px-8 rounded-2xl transition-opacity duration-200 ${draggingId === todo.id ? 'opacity-100' : 'opacity-0'}`}>
                      {/* Right Swipe (Complete) */}
                      <div className="flex items-center space-x-2 text-emerald-500">
                        <CheckCircle size={24} />
                      </div>
                      {/* Left Swipe (Delete) */}
                      <div className="flex items-center space-x-2 text-rose-500">
                        <Trash2 size={24} />
                      </div>
                    </div>
                    
                    {/* Visual Background Colors */}
                    <div className={`absolute inset-0 flex rounded-2xl overflow-hidden transition-opacity duration-200 ${draggingId === todo.id ? 'opacity-100' : 'opacity-0'}`}>
                      <div className="flex-1 bg-emerald-500/10 dark:bg-emerald-500/5" />
                      <div className="flex-1 bg-rose-500/10 dark:bg-rose-500/5" />
                    </div>
                  </>
                )}

                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  drag={isMobile ? "x" : false}
                  dragConstraints={{ left: -100, right: 100 }}
                  dragElastic={0.1}
                  onDragStart={() => isMobile && setDraggingId(todo.id)}
                  onDragEnd={(_, info) => {
                    if (!isMobile) return;
                    setDraggingId(null);
                    if (info.offset.x < -70) {
                      setShowDeleteConfirm(todo.id);
                    } else if (info.offset.x > 70) {
                      toggleTodo(todo.id, todo.completed);
                    }
                  }}
                  className={`relative z-10 flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all ${todo.completed ? 'opacity-60 grayscale-[0.5]' : ''}`}
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

                  <div className="flex items-center space-x-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    {todo.imageUrl && (
                      <a 
                        href={todo.imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                      >
                        <ImageIcon size={20} />
                      </a>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(todo.id)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              </div>
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