import React, { useState } from 'react';
import {
  UserProfile,
  Task,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  SubTask,
} from '../../types';
import { StorageService } from '../../services/storage';
import { t } from '../../services/translations';
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { AiPlanModal } from '../today/AiPlanModal';

interface KartavyaViewProps {
  profile: UserProfile;
  tasks: Task[];
  onRefreshData: () => void;
}

export const KartavyaView: React.FC<KartavyaViewProps> = ({
  profile,
  tasks,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'scheduler' | 'recovery'>('tasks');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Task creation/edit modal
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [category, setCategory] = useState<TaskCategory>('study');
  const [priority, setPriority] = useState<TaskPriority>('urgent_important');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const [showAiRecovery, setShowAiRecovery] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPurpose('');
    setCategory('study');
    setPriority('urgent_important');
    setEstimatedMinutes(45);
    setDeadline(new Date().toISOString().split('T')[0]);
    setSubtasks([]);
    setNewSubtaskTitle('');
    setEditingTask(null);
    setIsCreatingTask(false);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setPurpose(task.purpose || '');
    setCategory(task.category);
    setPriority(task.priority);
    setEstimatedMinutes(task.estimatedMinutes);
    setDeadline(task.deadline || new Date().toISOString().split('T')[0]);
    setSubtasks(task.subtasks || []);
    setIsCreatingTask(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const task: Task = {
      id: editingTask?.id || `tsk_${Date.now()}`,
      userId: profile.id,
      title: title.trim(),
      description: description.trim() || undefined,
      purpose: purpose.trim() || undefined,
      category,
      priority,
      estimatedMinutes,
      deadline: deadline || undefined,
      subtasks,
      status: editingTask?.status || 'todo',
      createdAt: editingTask?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveTask(task);
    resetForm();
    onRefreshData();
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Delete this duty?')) {
      StorageService.deleteTask(taskId);
      onRefreshData();
    }
  };

  const handleToggleTaskStatus = (task: Task) => {
    const newStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed';
    const updated: Task = {
      ...task,
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
    };
    StorageService.saveTask(updated);
    onRefreshData();
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `sub_${Date.now()}`, title: newSubtaskTitle.trim(), completed: false },
    ]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subId: string) => {
    setSubtasks(
      subtasks.map((st) => (st.id === subId ? { ...st, completed: !st.completed } : st))
    );
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'active' && t.status === 'completed') return false;
    if (filterStatus === 'completed' && t.status !== 'completed') return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  // Deterministic Scheduling calculations
  const totalAllocatedMinutes = tasks
    .filter((t) => t.status !== 'completed')
    .reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
  const totalBudgetMinutes = profile.dailyAvailableHours * 60;
  const isOverbooked = totalAllocatedMinutes > totalBudgetMinutes;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 pb-24 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#263E32] via-[#1F3329] to-[#782F3B] rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-[#C4A264]/40 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D4B274] font-heading">
            <CheckSquare className="w-4 h-4" />
            <span>Kartavya • Sincere Duty & Execution</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#F6F0E5]">
            Responsibility Management Engine
          </h1>
          <p className="text-xs sm:text-sm text-[#F6F0E5]/90 font-serif italic max-w-2xl leading-relaxed">
            “You have right to the action alone, never to its fruit. Execute duties sincerely with clear intention and zero overwhelm.”
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px]">
            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              {tasks.filter((t) => t.status !== 'completed').length} Pending Duties
            </div>
            <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              {totalAllocatedMinutes} mins scheduled / {totalBudgetMinutes} mins daily budget
            </div>
            {isOverbooked && (
              <div className="bg-amber-500/30 text-amber-200 px-3 py-1 rounded-full border border-amber-400/40 flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Overbooked by {totalAllocatedMinutes - totalBudgetMinutes}m</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs & Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2DACB] dark:border-[#2E3833] pb-3">
        <div className="flex gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'tasks'
                ? 'bg-[#782F3B] text-white shadow-sm'
                : 'text-[#716D64] hover:bg-[#EDE7DB] dark:hover:bg-[#252D29]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>All Duties</span>
          </button>
          <button
            onClick={() => setActiveTab('scheduler')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'scheduler'
                ? 'bg-[#782F3B] text-white shadow-sm'
                : 'text-[#716D64] hover:bg-[#EDE7DB] dark:hover:bg-[#252D29]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Schedule Engine</span>
          </button>
          <button
            onClick={() => setShowAiRecovery(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#263E32]/10 hover:bg-[#263E32]/20 text-[#263E32] dark:text-[#A8C7B5] font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C4A264]" />
            <span>Backlog Recovery</span>
          </button>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsCreatingTask(true);
          }}
          className="flex items-center gap-1.5 bg-[#782F3B] hover:bg-[#5E242E] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Duty</span>
        </button>
      </div>

      {/* Filter Bar */}
      {activeTab === 'tasks' && (
        <div className="flex flex-wrap items-center gap-2 bg-[#FBF8F2] dark:bg-[#1A201D] p-3 rounded-2xl border border-[#C4A264]/30 text-xs">
          {/* Search */}
          <div className="flex-1 min-w-[160px] relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#716D64]" />
            <input
              type="text"
              placeholder="Search duties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40 focus:outline-none focus:ring-1 focus:ring-[#782F3B]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40 text-[#1F2421] dark:text-[#F1F4F2]"
          >
            <option value="active">Active Duties</option>
            <option value="completed">Completed Duties</option>
            <option value="all">All Statuses</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40 text-[#1F2421] dark:text-[#F1F4F2]"
          >
            <option value="all">All Categories</option>
            <option value="study">Study</option>
            <option value="professional">Professional</option>
            <option value="family">Family Responsibility</option>
            <option value="personal_dev">Personal Dev</option>
            <option value="sadhana">Sadhana</option>
            <option value="health">Health & Well-being</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40 text-[#1F2421] dark:text-[#F1F4F2]"
          >
            <option value="all">All Priorities</option>
            <option value="urgent_important">Urgent & Important</option>
            <option value="important">Important</option>
            <option value="routine">Routine</option>
            <option value="low">Low</option>
          </select>
        </div>
      )}

      {/* Task List */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 sm:p-5 rounded-2xl bg-[#FBF8F2] dark:bg-[#1A201D] border transition-all ${
                task.status === 'completed'
                  ? 'border-[#E2DACB] dark:border-[#2E3833] opacity-75'
                  : 'border-[#C4A264]/35 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleTaskStatus(task)}
                  className="mt-1 text-[#716D64] hover:text-[#263E32] transition-colors"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-[#263E32] fill-[#263E32]/10" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#782F3B]" />
                  )}
                </button>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`font-bold text-sm sm:text-base text-[#1F2421] dark:text-[#F1F4F2] ${
                        task.status === 'completed' ? 'line-through text-[#716D64]' : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#782F3B]/10 text-[#782F3B] dark:text-[#D4B274]">
                      {task.priority.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EDE7DB] dark:bg-[#252D29] text-[#716D64] capitalize">
                      {task.category}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-[#716D64] dark:text-[#9FA4A1] leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {task.purpose && (
                    <p className="text-[11px] text-[#263E32] dark:text-[#A8C7B5] italic">
                      Purpose: {task.purpose}
                    </p>
                  )}

                  {/* Subtasks */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="pt-2 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#716D64] dark:text-[#9FA4A1]">
                        Milestones ({task.subtasks.filter((s) => s.completed).length}/
                        {task.subtasks.length}):
                      </span>
                      {task.subtasks.map((st) => (
                        <div key={st.id} className="flex items-center gap-2 text-xs">
                          <button
                            onClick={() => {
                              const updatedSub = task.subtasks.map((s) =>
                                s.id === st.id ? { ...s, completed: !s.completed } : s
                              );
                              StorageService.saveTask({ ...task, subtasks: updatedSub });
                              onRefreshData();
                            }}
                            className="text-[#716D64]"
                          >
                            {st.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#263E32]" />
                            ) : (
                              <Circle className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span className={st.completed ? 'line-through text-[#716D64]' : ''}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#716D64] dark:text-[#9FA4A1] pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{task.estimatedMinutes} mins</span>
                    </span>
                    {task.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Due {task.deadline}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Task Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="p-1.5 rounded-lg hover:bg-[#EDE7DB] dark:hover:bg-[#252D29] text-[#716D64]"
                    title="Edit Task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 dark:hover:bg-red-950/30"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="p-8 text-center bg-[#FBF8F2] dark:bg-[#1A201D] rounded-2xl border border-[#E2DACB] dark:border-[#2E3833] space-y-2">
              <CheckSquare className="w-8 h-8 mx-auto text-[#716D64]" />
              <p className="text-sm font-semibold text-[#1F2421] dark:text-[#F1F4F2]">
                No duties matching this filter.
              </p>
              <p className="text-xs text-[#716D64]">
                Create a new duty or adjust your filters.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Scheduler Tab */}
      {activeTab === 'scheduler' && (
        <div className="space-y-4">
          <div className="bg-[#FBF8F2] dark:bg-[#1A201D] p-5 rounded-2xl border border-[#C4A264]/30 space-y-3">
            <h3 className="font-heading font-bold text-base text-[#782F3B] dark:text-[#D4B274]">
              Deterministic Daily Time-Budget Engine
            </h3>
            <p className="text-xs text-[#716D64] dark:text-[#9FA4A1] leading-relaxed">
              Sanjivani never forces an unachievable schedule. We calculate actual minutes required against your chosen daily focus budget ({profile.dailyAvailableHours}h), with an automatic 20% buffer for human renewal and stillness.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/20">
                <span className="text-[#716D64] dark:text-[#9FA4A1]">Daily Available Focus:</span>
                <p className="text-lg font-bold text-[#263E32] dark:text-[#A8C7B5]">
                  {profile.dailyAvailableHours} Hours ({totalBudgetMinutes}m)
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/20">
                <span className="text-[#716D64] dark:text-[#9FA4A1]">Scheduled Duties:</span>
                <p className="text-lg font-bold text-[#782F3B] dark:text-[#D4B274]">
                  {totalAllocatedMinutes} Minutes
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/20">
                <span className="text-[#716D64] dark:text-[#9FA4A1]">Buffer Remaining:</span>
                <p
                  className={`text-lg font-bold ${
                    totalBudgetMinutes - totalAllocatedMinutes >= 0
                      ? 'text-[#263E32] dark:text-[#A8C7B5]'
                      : 'text-amber-600'
                  }`}
                >
                  {totalBudgetMinutes - totalAllocatedMinutes} Minutes
                </p>
              </div>
            </div>

            {isOverbooked && (
              <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Workload Conflict Detected</span>
                </div>
                <p>
                  Your pending duties exceed your healthy focus budget by{' '}
                  {totalAllocatedMinutes - totalBudgetMinutes} minutes. We recommend deferring non-urgent routine tasks to preserve quality of execution.
                </p>
                <button
                  onClick={() => setShowAiRecovery(true)}
                  className="mt-1 bg-amber-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-sm"
                >
                  Launch Backlog Recovery Triage
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Creation / Edit Modal */}
      {isCreatingTask && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#FBF8F2] dark:bg-[#1A201D] border border-[#C4A264]/40 rounded-3xl max-w-lg w-full p-6 text-[#1F2421] dark:text-[#F1F4F2] space-y-4 max-h-[90vh] flex flex-col">
            <h3 className="font-heading font-bold text-lg text-[#782F3B] dark:text-[#D4B274]">
              {editingTask ? 'Edit Duty' : 'Add New Duty'}
            </h3>

            <form onSubmit={handleSaveTask} className="space-y-3 text-xs overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block font-semibold mb-1">Title of Duty *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Calculus Integration by Parts"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40 focus:outline-none focus:ring-1 focus:ring-[#782F3B]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Specific actions or context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40 focus:outline-none focus:ring-1 focus:ring-[#782F3B]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Higher Purpose (Why this matters)</label>
                <input
                  type="text"
                  placeholder="e.g. Exam excellence without anxiety; sincere family service"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40 focus:outline-none focus:ring-1 focus:ring-[#782F3B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                  >
                    <option value="study">Study</option>
                    <option value="professional">Professional</option>
                    <option value="family">Family</option>
                    <option value="personal_dev">Personal Dev</option>
                    <option value="sadhana">Sadhana</option>
                    <option value="community_service">Community Service</option>
                    <option value="health">Health</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                  >
                    <option value="urgent_important">Urgent & Important</option>
                    <option value="important">Important</option>
                    <option value="routine">Routine</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Estimated Minutes</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 30)}
                    className="w-full p-2 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                  />
                </div>
              </div>

              {/* Subtasks Builder */}
              <div className="space-y-1.5 pt-1">
                <label className="block font-semibold">Subtasks / Concrete Milestones</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Solve Q1-Q5 independently"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 p-2 rounded-xl bg-white dark:bg-[#252D29] border border-[#C4A264]/40"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="bg-[#263E32] text-white px-3 py-1.5 rounded-xl text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#252D29] border border-[#E2DACB] dark:border-[#2E3833]"
                  >
                    <span className="truncate">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => setSubtasks(subtasks.filter((s) => s.id !== st.id))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#E2DACB] dark:border-[#2E3833] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-[#716D64] hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#782F3B] hover:bg-[#5E242E] text-white px-5 py-2 rounded-xl font-semibold shadow-md"
                >
                  {editingTask ? 'Save Changes' : 'Create Duty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Backlog Recovery Modal */}
      {showAiRecovery && (
        <AiPlanModal
          mode="recovery"
          isOpen={showAiRecovery}
          onClose={() => setShowAiRecovery(false)}
          tasks={tasks}
          practices={StorageService.getPractices()}
          topicsDue={[]}
          dailyAvailableHours={profile.dailyAvailableHours}
          onApplyPlan={() => onRefreshData()}
        />
      )}
    </div>
  );
};
