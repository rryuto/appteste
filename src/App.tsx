/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Kanban, 
  BarChart3, 
  Settings, 
  CircleHelp, 
  Plus, 
  Search, 
  Bell, 
  Mail,
  Phone,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  Handshake,
  History,
  Flag,
  MoreHorizontal,
  FileText,
  Video,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  LogIn,
  LogOut,
  User as UserIcon,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from './lib/utils';
import { supabase } from './lib/supabase';
import { User, AuthError } from '@supabase/supabase-js';
import { useCallback } from 'react';

// --- Types ---
type Tab = 'dashboard' | 'contacts' | 'pipeline' | 'analytics';

interface Contact {
  id: string;
  user_id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  status: 'Opportunity' | 'Customer' | 'Lead';
  last_interaction: string;
  interaction_type: string;
  avatar_url?: string;
  created_at?: string;
}

interface Activity {
  id: string;
  user_id: string;
  type: 'opportunity' | 'status' | 'proposal' | 'contract' | 'blueprint' | 'lead';
  title: string;
  timestamp: string;
  user_name: string;
  color: string;
  created_at?: string;
}

interface Task {
  id: string;
  user_id: string;
  title: string;
  priority: 'High' | 'Planning' | 'Review' | 'Drafting';
  due_date: string;
  assigned_to: string;
  assigned_avatar: string;
  meta: string;
  created_at?: string;
}

// --- Mock Data ---
const REVENUE_DATA = [
  { month: 'Jan', actual: 180, target: 200 },
  { month: 'Feb', actual: 160, target: 210 },
  { month: 'Mar', actual: 170, target: 220 },
  { month: 'Apr', actual: 210, target: 230 },
  { month: 'May', actual: 190, target: 240 },
  { month: 'Jun', actual: 260, target: 250 },
  { month: 'Jul', actual: 240, target: 260 },
  { month: 'Aug', actual: 290, target: 270 },
  { month: 'Sep', actual: 280, target: 280 },
];

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const ContactForm = ({ 
  contact, 
  onSubmit, 
  onCancel 
}: { 
  contact?: Contact, 
  onSubmit: (data: Partial<Contact>) => void, 
  onCancel: () => void 
}) => {
  const [formData, setFormData] = useState<Partial<Contact>>(
    contact || {
      name: '',
      role: '',
      company: '',
      email: '',
      phone: '',
      status: 'Lead',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
          <input 
            required
            type="text" 
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="E.g. John Doe"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role</label>
          <input 
            required
            type="text" 
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value })}
            className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="E.g. Principal Architect"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company</label>
        <input 
          required
          type="text" 
          value={formData.company}
          onChange={e => setFormData({ ...formData, company: e.target.value })}
          className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
          placeholder="E.g. Sterling & Associates"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</label>
          <input 
            required
            type="email" 
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="john@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone</label>
          <input 
            required
            type="tel" 
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lifecycle Status</label>
        <select 
          value={formData.status}
          onChange={e => setFormData({ ...formData, status: e.target.value as Contact['status'] })}
          className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
        >
          <option value="Lead">Lead</option>
          <option value="Opportunity">Opportunity</option>
          <option value="Customer">Customer</option>
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-sm transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          {contact ? 'Update Contact' : 'Create Contact'}
        </button>
      </div>
    </form>
  );
};

const Sidebar = ({ activeTab, setActiveTab, onAddNew, onLogout, isOpen, onClose }: { activeTab: Tab, setActiveTab: (t: Tab) => void, onAddNew: () => void, onLogout: () => void, isOpen: boolean, onClose: () => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'pipeline', label: 'Pipeline', icon: Kanban },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "h-screen w-64 fixed left-0 top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl flex flex-col p-4 z-[70] border-r border-slate-200/50 dark:border-slate-800/50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="mb-8 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/20">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEEtmckQGwcjzobusaVpmEGCmPWZLl6w2hlgLwQwPwF42UqMpyDL4Ol5kpgo8IY_HtqYoRY14mjs-KuQucoSC17-dvF3SInh7jfEO-gaoxYJvX2n_ZKWvUPM6PVN2F379JlJ-Pu6wH8Fwt88AB2tXVHNU3sxRZkQxGg7R46tV4xTFWcFfuTTmDuJijPp8smQLrjh28m8_Lb7TtratcC2nOnVbi5U2i3dAw6Es0It0kVqnb08XG718LCZ0jJfOXpteW16_GaA2V8skn" 
                alt="Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-blue-800 dark:text-blue-300">The Architect</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold opacity-70">CRM Suite</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg lg:hidden text-slate-500">
            <X size={20} />
          </button>
        </div>

        <button 
          onClick={() => { onAddNew(); onClose(); }}
          className="mb-8 w-full py-3 px-4 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-transform active:scale-95 hover:scale-[1.02]"
        >
          <Plus size={16} />
          <span className="text-sm">Add New</span>
        </button>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as Tab); onClose(); }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-sans text-sm font-medium tracking-tight",
                activeTab === item.id 
                  ? "text-blue-700 dark:text-blue-400 bg-white/50 dark:bg-slate-800/50 font-bold shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
              )}
            >
              <item.icon size={18} className={activeTab === item.id ? "fill-blue-700/10" : ""} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-200/50 dark:border-slate-800/50 pt-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 transition-colors text-sm font-medium">
            <Settings size={18} />
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 transition-colors text-sm font-medium">
            <CircleHelp size={18} />
            Support
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-bold mt-2 rounded-lg"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

const Header = ({ onMenuOpen, user }: { onMenuOpen: () => void, user: User | null }) => {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuOpen}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden text-slate-500 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-full px-4 py-1.5 w-40 md:w-64 lg:w-96 border border-slate-200/50 dark:border-slate-800/50">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 ml-2"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <nav className="hidden lg:flex items-center gap-8">
          <button className="text-blue-700 dark:text-blue-400 border-b-2 border-blue-600 py-5 text-sm font-medium">Recent</button>
          <button className="text-slate-600 dark:text-slate-400 hover:text-slate-900 py-5 text-sm font-medium transition-all">Favorites</button>
        </nav>
        
        <div className="flex items-center gap-2 md:gap-3 border-l border-slate-200/50 dark:border-slate-800/50 pl-3 md:pl-6">
          <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-950"></span>
          </button>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm font-semibold text-slate-700 dark:text-slate-300">{user?.email?.split('@')[0]}</span>
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-sm flex items-center justify-center">
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="User" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon size={16} className="text-slate-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const Dashboard = ({ activities, tasks, user }: { activities: Activity[], tasks: Task[], user: User | null }) => {
  const userName = user?.email?.split('@')[0] || 'Architect';
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1 uppercase">Morning, {userName}</h2>
          <p className="text-sm md:text-base text-slate-500 font-medium">Here's what's happening with your architecture portfolio today.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">Export</button>
          <button className="flex-1 md:flex-none px-4 py-2 text-sm font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center gap-2 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
            <History size={14} />
            Last 30 Days
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: '$1,284,500', change: '+12.5%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'New Leads', value: '156', change: '+48', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Deals Closed', value: '32', change: 'vs 22 last mo', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Deals', value: '18', change: 'Pipeline', icon: Kanban, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((metric, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", metric.bg, metric.color)}>
                <metric.icon size={20} />
              </div>
              <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full", 
                metric.change.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
              )}>
                {metric.change}
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{metric.label}</p>
            <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">{metric.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Revenue Projection</h4>
              <p className="text-sm text-slate-500">Forecasted growth for Q3 and Q4 2024</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span className="text-xs font-bold text-slate-500">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-200"></span>
                <span className="text-xs font-bold text-slate-500">Target</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorActual)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#93c5fd" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Recent Activity</h4>
            <button className="text-slate-400 hover:text-blue-600 transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="space-y-6 relative">
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
            {activities.map((activity) => (
              <div key={activity.id} className="relative flex gap-4">
                <div className={cn("z-10 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm", activity.color)}>
                  {activity.type === 'opportunity' && <TrendingUp size={16} />}
                  {activity.type === 'status' && <History size={16} />}
                  {activity.type === 'proposal' && <Mail size={16} />}
                  {activity.type === 'contract' && <Handshake size={16} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{activity.title}</p>
                  <p className="text-xs text-slate-500">{activity.timestamp} • {activity.user_name}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors border border-slate-100 dark:border-slate-800 rounded-xl">
            View Full History
          </button>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-200/50 dark:border-slate-800/50">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h4 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Tasks Due Soon</h4>
            <p className="text-sm text-slate-500">You have 4 critical deadlines this week</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:shadow-lg transition-all">Create Task</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-transparent hover:border-blue-500/20 transition-all cursor-pointer shadow-sm group">
              <div className="flex items-start justify-between mb-4">
                <span className={cn(
                  "px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded",
                  task.priority === 'High' ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"
                )}>
                  {task.priority}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{task.due_date}</span>
              </div>
              <h5 className="font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">{task.title}</h5>
              <div className="flex items-center gap-2 mb-4">
                {task.assigned_avatar ? (
                  <img src={task.assigned_avatar} alt={task.assigned_to} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {task.assigned_to.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <span className="text-[10px] font-medium text-slate-500">Assigned to: {task.assigned_to}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px]">
                {task.priority === 'Planning' ? <Video size={12} /> : <FileText size={12} />}
                {task.meta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Contacts = ({ 
  contacts, 
  onAdd, 
  onEdit, 
  onDelete,
  onView
}: { 
  contacts: Contact[], 
  onAdd: () => void, 
  onEdit: (c: Contact) => void, 
  onDelete: (id: string) => void,
  onView: (c: Contact) => void
}) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <nav className="flex gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            <span>Directory</span>
            <span className="opacity-30">/</span>
            <span className="text-blue-600">Contact List</span>
          </nav>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-slate-900 dark:text-white">Client Ecosystem</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">Managing <span className="text-blue-600 font-bold">{contacts.length}</span> strategic connections.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold text-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 transition-colors">
            <BarChart3 size={18} />
            Filters
          </button>
          <button 
            onClick={onAdd}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform active:scale-95"
          >
            <Plus size={18} />
            Add Contact
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Company</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Information</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Lifecycle Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Last Interaction</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {contacts.map((contact) => (
                <tr key={contact.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {contact.avatar_url ? (
                        <img src={contact.avatar_url} alt={contact.name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                          contact.status === 'Customer' ? "bg-emerald-50 text-emerald-600" : 
                          contact.status === 'Opportunity' ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
                        )}>
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{contact.name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{contact.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{contact.company}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Mail size={12} />
                        {contact.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone size={12} />
                        {contact.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                      contact.status === 'Opportunity' ? "bg-blue-50 text-blue-600 border-blue-100" :
                      contact.status === 'Customer' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      "bg-slate-50 text-slate-500 border-slate-100"
                    )}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{contact.last_interaction}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{contact.interaction_type}</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onView(contact)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-blue-600 transition-colors" 
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => onEdit(contact)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors" 
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(contact.id)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-red-500 transition-colors" 
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-5 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <p className="text-xs text-slate-500">Showing <span className="font-bold text-slate-900 dark:text-white">1 - {contacts.length}</span> of {contacts.length} entries</p>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Per Page:</label>
              <select className="bg-white dark:bg-slate-900 border-none text-[11px] font-bold rounded-lg py-1 px-3 focus:ring-1 focus:ring-blue-500/20">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-400 transition-colors"><ChevronsLeft size={16} /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-400 transition-colors"><ChevronLeft size={16} /></button>
            <div className="flex items-center px-2 gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-500 font-bold text-xs transition-colors">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-500 font-bold text-xs transition-colors">3</button>
              <span className="px-2 text-slate-400 text-xs">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-500 font-bold text-xs transition-colors">125</button>
            </div>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-400 transition-colors"><ChevronRight size={16} /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-400 transition-colors"><ChevronsRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) onLogin(data.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) onLogin(data.user);
      }
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden"
      >
        <div className="p-8 pb-0 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30 mb-6">
            <Flag size={32} fill="currentColor" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Architect</h2>
          <p className="text-xs font-bold text-blue-600 tracking-[0.2em] uppercase mb-8">CRM Suite Access</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-white ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                placeholder="architect@sterling.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-white ml-1">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            disabled={isLoading}
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                {isSignUp ? 'Create Account' : 'Authenticate'}
              </>
            )}
          </button>

          <div className="pt-4 text-center">
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-slate-500 font-medium hover:text-blue-600 transition-colors"
            >
              {isSignUp ? 'Already have an account? Authenticate' : "Don't have an account? Create one"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);
  const [viewingContact, setViewingContact] = useState<Contact | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;

    const [
      { data: contactsData },
      { data: activitiesData },
      { data: tasksData }
    ] = await Promise.all([
      supabase.from('contacts').select('*').order('created_at', { ascending: false }),
      supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('tasks').select('*').order('created_at', { ascending: false })
    ]);

    if (contactsData) setContacts(contactsData as Contact[]);
    if (activitiesData) setActivities(activitiesData as Activity[]);
    if (tasksData) setTasks(tasksData as Task[]);
  }, [user]);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    const init = async () => {
      await fetchData();
    };
    init();

    // Real-time subscriptions
    const contactsChannel = supabase
      .channel('contacts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => fetchData())
      .subscribe();

    const activitiesChannel = supabase
      .channel('activities-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => fetchData())
      .subscribe();

    const tasksChannel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(contactsChannel);
      supabase.removeChannel(activitiesChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, [user, fetchData]);

  const handleAddContact = async (data: Partial<Contact>) => {
    if (!user) return;

    const { error } = await supabase.from('contacts').insert([{
      ...data,
      user_id: user.id,
      last_interaction: 'Just now',
      interaction_type: 'New Lead Created'
    }]);

    if (error) {
      console.error('Error adding contact:', error);
      return;
    }

    // Log activity
    await supabase.from('activities').insert([{
      user_id: user.id,
      type: 'lead',
      title: `New Lead Added: ${data.name}`,
      timestamp: 'Just now',
      user_name: user.email?.split('@')[0] || 'User',
      color: 'bg-blue-600'
    }]);

    setIsModalOpen(false);
  };

  const handleUpdateContact = async (data: Partial<Contact>) => {
    if (!editingContact || !user) return;

    const { error } = await supabase
      .from('contacts')
      .update(data)
      .eq('id', editingContact.id);

    if (error) {
      console.error('Error updating contact:', error);
      return;
    }

    setIsModalOpen(false);
    setEditingContact(undefined);
  };

  const handleDeleteContact = async () => {
    if (!contactToDelete || !user) return;

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactToDelete);

    if (error) {
      console.error('Error deleting contact:', error);
      return;
    }

    setIsDeleteModalOpen(false);
    setContactToDelete(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const openAddModal = () => {
    setEditingContact(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const openViewModal = (contact: Contact) => {
    setViewingContact(contact);
  };

  const openDeleteModal = (id: string) => {
    setContactToDelete(id);
    setIsDeleteModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-100 selection:text-blue-900">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onAddNew={openAddModal} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <Header onMenuOpen={() => setIsSidebarOpen(true)} user={user} />
      
      <main className="lg:ml-64 pt-24 p-4 md:p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard activities={activities} tasks={tasks} user={user} />
              </motion.div>
            )}
            {activeTab === 'contacts' && (
              <motion.div
                key="contacts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Contacts 
                  contacts={contacts} 
                  onAdd={openAddModal}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  onView={openViewModal}
                />
              </motion.div>
            )}
            {['pipeline', 'analytics'].includes(activeTab) && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[60vh] text-center"
              >
                <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 mb-6">
                  <AlertCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-2 uppercase tracking-tighter">Coming Soon</h3>
                <p className="text-slate-500 max-w-md">We're building the {activeTab} module to give you even more architectural insights. Stay tuned!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            title={editingContact ? 'Edit Contact' : 'Add New Contact'}
          >
            <ContactForm 
              contact={editingContact}
              onSubmit={editingContact ? handleUpdateContact : handleAddContact}
              onCancel={() => setIsModalOpen(false)}
            />
          </Modal>
        )}

        {viewingContact && (
          <Modal 
            isOpen={!!viewingContact} 
            onClose={() => setViewingContact(undefined)} 
            title="Contact Details"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {viewingContact.avatar_url ? (
                  <img src={viewingContact.avatar_url} alt={viewingContact.name} className="w-20 h-20 rounded-2xl object-cover shadow-lg" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 text-2xl font-black shadow-lg">
                    {viewingContact.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div>
                  <h4 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">{viewingContact.name}</h4>
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{viewingContact.role}</p>
                  <p className="text-xs text-slate-500 font-medium">{viewingContact.company}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Email</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{viewingContact.email}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Phone</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{viewingContact.phone}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Last Interaction</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{viewingContact.last_interaction}</p>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">{viewingContact.interaction_type}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setViewingContact(undefined)}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-sm transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setEditingContact(viewingContact);
                    setViewingContact(undefined);
                    setIsModalOpen(true);
                  }}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </Modal>
        )}

        {isDeleteModalOpen && (
          <Modal 
            isOpen={isDeleteModalOpen} 
            onClose={() => setIsDeleteModalOpen(false)} 
            title="Delete Contact"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600">
                <AlertCircle size={24} />
                <p className="text-sm font-medium">Are you sure you want to delete this contact? This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-sm transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteContact}
                  className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Delete
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button 
        onClick={openAddModal}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all z-50"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
