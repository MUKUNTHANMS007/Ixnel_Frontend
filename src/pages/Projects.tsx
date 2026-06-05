// pages/Projects.tsx

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  Plus, 
  Clock, 
  Box, 
  Loader2, 
  LogIn, 
  Sparkles, 
  Shield, 
  Calendar,
  Trash2,
  X,
  AlertTriangle
} from 'lucide-react';
import { useEditorStore } from '../store/editorStore';

import { projectAPI } from '../lib/project_api';
import type { Project } from '../lib/project_api';
import type { User as UserType, UserProfile } from '../lib/api';

interface ProjectsPageProps {
  onNavigate: (page: string) => void;
  isAuthenticated: boolean;
  user: UserType | null;
  profile: UserProfile | null;
}

export default function Projects({ onNavigate, isAuthenticated, user, profile }: ProjectsPageProps) {
  // ─ Local React State ──────────────────────────────────────────────────────
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default to 'local' since cloud sync is disabled for now [1.2.4]
  const [storageMode, setStorageMode] = useState<'cloud' | 'local'>('local');

  // ─ Deletion Overlay States [1.2.4] ────────────────────────────────────────
  const [pendingDeleteProject, setPendingDeleteProject] = useState<Project | null>(null);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // ─ Load Projects ──────────────────────────────────────────────────────────
  const loadProjectsList = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectAPI.getProjects();
      if (response.success && response.data) {
        setProjects(response.data.projects || []);
      } else {
        setError(response.error || 'Failed to load projects list.');
      }
    } catch (err) {
      console.error('[Projects] Error fetching projects:', err);
      setError('A connection error occurred while loading projects.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProjectsList();
       if (localStorage.getItem('triggerNewProjectModal') === 'true') {
        localStorage.removeItem('triggerNewProjectModal'); // Clear trigger [1.2.4]
        setShowNew(true); // Open the creation modal immediately [1.2.4]
      }
    }
  }, [isAuthenticated]);

  // ─ Open Active Workspace ──────────────────────────────────────────────────
  const handleLoadProject = (project: Project) => {
    const editorState = useEditorStore.getState();
    const existingIds = editorState.keyframes.map(kf => kf.id);
    existingIds.forEach(id => editorState.removeKeyframe(id));

    localStorage.setItem('activeProjectId', project.id);
    onNavigate('editor');
  };

  // ─ Create Project ─────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);

    try {
      const response = await projectAPI.createProject(newName.trim(), storageMode);
      setCreating(false);

      if (response.success && response.data) {
        setShowNew(false);
        setNewName('');
        setStorageMode('local'); // Reset to default
        
        localStorage.setItem('activeProjectId', response.data.id);
        onNavigate('editor');
      } else {
        setError(response.error || 'Failed to create project.');
      }
    } catch (err) {
      setCreating(false);
      setError('A connection error occurred.');
    }
  };

  // ─ Execute Project Deletion [1.2.4] ────────────────────────────────────────
  const handleFinalDelete = async () => {
    if (!pendingDeleteProject || deleteInput !== pendingDeleteProject.name) return;
    
    setIsDeleting(true);
    setError(null);

    try {
      const response = await projectAPI.deleteProject(pendingDeleteProject.id);
      setIsDeleting(false);

      if (response.success) {
        setPendingDeleteProject(null);
        setDeleteInput('');
        loadProjectsList(); // Instantly reloads the active list [1.2.4]
      } else {
        setError(response.error || 'Failed to delete project.');
      }
    } catch (err) {
      setIsDeleting(false);
      setError('A connection error occurred.');
    }
  };

  // ─ SCREEN 1: Guest/Unauthenticated State ─────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-6 text-center px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00AAFF]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 w-20 h-20 rounded-3xl bg-[#00AAFF]/10 border border-[#00AAFF]/20 flex items-center justify-center shadow-lg shadow-[#00AAFF]/20">
          <LogIn className="w-10 h-10 text-[#00AAFF]" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white mb-2">Sign in to view projects</h2>
          <p className="text-neutral-400">Your saved 3D scenes will appear here.</p>
        </div>
        <button
          onClick={() => onNavigate('signin')}
          className="relative z-10 px-8 py-3.5 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold text-sm tracking-wide hover:bg-white transition-all shadow-lg shadow-[#00AAFF]/25 hover:shadow-white/10 hover:scale-105 active:scale-95"
        >
          Sign In
        </button>
      </div>
    );
  }

  const availableCredits = profile ? profile.credits - profile.reserved_credits : 0;

  // ─ SCREEN 2: Authenticated Projects Workspace ─────────────────────────────
  return (
    <div className="w-full relative bg-neutral-950 text-white min-h-screen select-none">
      <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-[#00AAFF]/10 blur-[120px] rounded-full pointer-events-none" />

      <section className="relative pt-8 pb-24 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          
          {/* Profile Quick View */}
          <div className="mb-12 p-6 bg-white/[0.02] border border-white/5 rounded-[24px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#00AAFF]/20 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#00AAFF] flex items-center justify-center text-neutral-950 font-black text-xl shadow-lg shadow-[#00AAFF]/25">
                {profile?.username?.[0].toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{profile?.username}</h2>
                <p className="text-sm text-neutral-400">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="text-left md:text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Available Credits</p>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00AAFF] fill-current" />
                  <span className="text-2xl font-black text-white">{availableCredits}</span>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('pricing')}
                className="px-5 py-2.5 bg-transparent border border-[#00AAFF]/30 rounded-xl text-sm font-bold text-[#00AAFF] hover:bg-[#00AAFF]/10 transition-all shadow-sm"
              >
                Top up
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-[#00AAFF]/10 border border-[#00AAFF]/20 flex items-center justify-center shadow-lg shadow-[#00AAFF]/10">
                  <FolderOpen className="w-6 h-6 text-[#00AAFF]" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">My Projects</h1>
              </div>
              <p className="text-neutral-400">Your saved 3D scenes and workspaces.</p>
            </div>

            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold text-sm tracking-wide hover:bg-white transition-all shadow-lg shadow-[#00AAFF]/25 hover:shadow-white/10 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {/* New Project Modal */}
          {showNew && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mb-10 p-6 border border-white/10 bg-black/40 backdrop-blur-xl rounded-2xl flex flex-col gap-6 shadow-2xl shadow-black relative"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/50 to-transparent" />

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="Scene name..."
                  className="flex-1 w-full px-5 py-3 bg-black/60 border border-white/10 rounded-xl outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] text-white placeholder:text-neutral-600 transition-all font-medium"
                />

                {/* Storage Mode Selector (Cloud Sync Disabled temporarily) [1.2.4] */}
                <div className="flex bg-neutral-900 border border-white/10 p-1 rounded-xl w-full sm:w-auto relative group">
                  <button
                    disabled
                    type="button"
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-xs font-bold text-neutral-600 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Cloud Sync
                  </button>
                  <button
                    type="button"
                    onClick={() => setStorageMode('local')}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 bg-red-500 text-white shadow-md"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Local
                  </button>
                  
                  {/* Tooltip explaining cloud sync is coming soon [1.2.4] */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-neutral-900 text-neutral-300 text-[10px] px-3 py-1.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap z-50">
                    ☁ Hybrid Cloud Sync is coming soon! Local Privacy enabled [1.2.4].
                  </div>
                </div>
              </div>

              <p className="text-xs text-neutral-500 font-medium -mt-2">
                {storageMode === 'cloud' 
                  ? '✓ Cloud Sync: Assets are securely synced to your cloud account, letting you continue your workspace on any device.' 
                  : '⚠ Local Privacy: Assets remain strictly in browser RAM. Zero server-side uploads or storage overhead. Refreshing will clear local frames.'}
              </p>

              <div className="flex items-center justify-end gap-3 w-full border-t border-white/5 pt-4">
                <button
                  onClick={() => setShowNew(false)}
                  className="px-5 py-3 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newName.trim()}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold hover:bg-white transition-all disabled:opacity-50 disabled:hover:bg-[#00AAFF]"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Project
                </button>
              </div>
            </motion.div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-3 items-center font-medium animate-in fade-in">
              <span className="text-lg">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-[#00AAFF]" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!projects || projects.length === 0) && (
            <div className="flex flex-col items-center justify-center py-24 gap-5 text-center bg-white/[0.01] border border-white/5 rounded-[32px] border-dashed">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Box className="w-10 h-10 text-[#00AAFF]/50" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
                <p className="text-sm text-neutral-400">Create your first animation workspace to get started.</p>
              </div>
              <button
                onClick={() => setShowNew(true)}
                className="px-6 py-3 bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-xl font-bold transition-all text-sm mt-2"
              >
                Create Project
              </button>
            </div>
          )}

          {/* Project Grid */}
          {!isLoading && projects && projects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -6 }}
                  onClick={() => handleLoadProject(project)}
                  className="group p-5 bg-white/[0.02] border border-white/5 rounded-[24px] cursor-pointer hover:border-[#00AAFF]/30 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-[#00AAFF]/10 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/0 to-transparent group-hover:via-[#00AAFF]/50 transition-all duration-500" />

                  {/* Preview thumbnail */}
                  <div className="w-full h-36 mb-5 rounded-xl bg-gradient-to-br from-black/60 to-black/20 border border-white/5 flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-[#00AAFF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {project.storage_mode === 'local' ? (
                      <div className="text-center p-4">
                        <Shield className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Privacy Mode</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
                        {[...Array(9)].map((_, j) => (
                          <div key={j} className="w-6 h-6 rounded-md bg-[#00AAFF]" style={{ opacity: Math.random() * 0.8 + 0.2 }} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Title, Storage Badge, and Hoverable Trash Delete Button [1.2.4] */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="font-bold text-white group-hover:text-[#00AAFF] transition-colors truncate text-lg">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {/* Delete project button (with stop propagation check) [1.2.4] */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents workspace loading
                          setPendingDeleteProject(project);
                        }}
                        className="p-1 hover:bg-red-500/10 rounded-md text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase border ${
                        project.storage_mode === 'local'
                          ? 'bg-red-500/10 border-red-500/25 text-red-400'
                          : 'bg-green-500/10 border-green-500/25 text-green-400'
                      }`}>
                        {project.storage_mode}
                      </span>
                    </div>
                  </div>

                  {/* Metadata session logs */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#00AAFF]" />
                      <span>Last edited: {new Date(project.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-600">
                      {project.storage_mode === 'local' ? 'LOCAL WORKSPACE' : 'CLOUD WORKSPACE'}
                    </span>
                    <span className="text-xs font-black text-[#00AAFF] opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1">
                      OPEN WORKSPACE <Sparkles className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* ─── OVERLAY: Double-Confirm Delete Modal (Copy-Paste Friendly) [1.2.4] ─── */}
      {pendingDeleteProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          {/* Added select-text to allow highlighting text inside the modal [1.2.4] */}
          <div className="relative w-full max-w-md p-8 bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl space-y-6 overflow-hidden select-text">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            
            <div className="flex justify-between items-center pb-4 border-b border-white/10 select-none">
              <h3 className="text-xl font-black text-white">Delete Project</h3>
              <button 
                onClick={() => { setPendingDeleteProject(null); setDeleteInput(''); }} 
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center select-none">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>

              <div className="space-y-1.5 text-center">
                <p className="text-neutral-300 text-sm font-semibold select-none">Are you absolutely sure?</p>
                <p className="text-neutral-400 text-xs leading-relaxed select-none">
                  This will permanently delete the project{' '}
                  {/* Added select-text & cursor-text to allow highlighting the project name [1.2.4] */}
                  <strong className="text-white select-text cursor-text">
                    "{pendingDeleteProject.name}"
                  </strong>
                  , including all its associated assets, timeline frames, and rendering jobs. This action is irreversible.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-neutral-400 text-xs select-none">
                  Please type the project name{' '}
                  {/* Added select-text & cursor-text to allow highlighting the project name [1.2.4] */}
                  <strong className="text-red-400 select-text cursor-text">
                    {pendingDeleteProject.name}
                  </strong>{' '}
                  to confirm:
                </p>
                <input
                  autoFocus
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder={pendingDeleteProject.name}
                  className="w-full px-5 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500 transition-all font-semibold text-center"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5 select-none">
              <button
                onClick={() => { setPendingDeleteProject(null); setDeleteInput(''); }}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalDelete}
                disabled={deleteInput !== pendingDeleteProject.name || isDeleting}
                className="flex-1 py-3 bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Project'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}