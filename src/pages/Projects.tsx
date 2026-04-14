import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Plus, Clock, Box, Loader2, LogIn, Sparkles } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import { useEditorStore } from '../store/editorStore';

interface ProjectsPageProps {
  onNavigate: (page: string) => void;
}

export default function Projects({ onNavigate }: ProjectsPageProps) {
  const { projects, listProjects, loadProject, createProject } = useProjectStore();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const[newName, setNewName] = useState('');
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      listProjects().finally(() => setIsLoading(false));
    }
  }, [isAuthenticated, listProjects]);

  const handleLoadProject = (project: (typeof projects)[number]) => {
    // Clear existing editor state first
    const editorState = useEditorStore.getState();
    const existingIds = editorState.keyframes.map(kf => kf.id);
    existingIds.forEach(id => editorState.removeKeyframe(id));

    loadProject(project);
    onNavigate('editor');
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const success = await createProject(newName.trim());
    if (success) {
      setShowNew(false);
      setNewName('');
      onNavigate('editor');
    }
    setCreating(false);
  };

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

  return (
    <div className="w-full relative bg-neutral-950 text-white min-h-screen">
      <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-[#00AAFF]/10 blur-[120px] rounded-full pointer-events-none" />

      <section className="relative pt-8 pb-24 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          
          {/* Profile Quick View */}
          <div className="mb-12 p-6 bg-white/[0.02] border border-white/5 rounded-[24px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#00AAFF]/20 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#00AAFF] flex items-center justify-center text-neutral-950 font-black text-xl shadow-lg shadow-[#00AAFF]/25">
                {user?.name?.[0].toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <p className="text-sm text-neutral-400">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="text-left md:text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">Available Credits</p>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00AAFF] fill-current" />
                  <span className="text-2xl font-black text-white">1,250</span>
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
              className="mb-10 p-6 border border-white/10 bg-black/40 backdrop-blur-xl rounded-2xl flex flex-col sm:flex-row items-center gap-4 shadow-2xl shadow-black"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/50 to-transparent" />

              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Scene name..."
                className="flex-1 w-full px-5 py-3 bg-black/60 border border-white/10 rounded-xl outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] text-white placeholder:text-neutral-600 transition-all font-medium"
              />
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleCreate}
                  disabled={creating || !newName.trim()}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold hover:bg-white transition-all disabled:opacity-50 disabled:hover:bg-[#00AAFF]"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create
                </button>
                <button
                  onClick={() => setShowNew(false)}
                  className="px-5 py-3 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-[#00AAFF]" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && projects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-5 text-center bg-white/[0.01] border border-white/5 rounded-[32px] border-dashed">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Box className="w-10 h-10 text-[#00AAFF]/50" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
                <p className="text-sm text-neutral-400">Create your first 3D scene to get started.</p>
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
          {!isLoading && projects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project, i) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -6 }}
                  onClick={() => handleLoadProject(project)}
                  className="group p-5 bg-white/[0.02] border border-white/5 rounded-[24px] cursor-pointer hover:border-[#00AAFF]/30 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-[#00AAFF]/10 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Subtle top glow on hover */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/0 to-transparent group-hover:via-[#00AAFF]/50 transition-all duration-500" />

                  {/* Preview thumbnail */}
                  <div className="w-full h-36 mb-5 rounded-xl bg-gradient-to-br from-black/60 to-black/20 border border-white/5 flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-[#00AAFF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="grid grid-cols-3 gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
                      {[...Array(9)].map((_, j) => (
                        <div key={j} className="w-6 h-6 rounded-md bg-[#00AAFF]" style={{ opacity: Math.random() * 0.8 + 0.2 }} />
                      ))}
                    </div>
                  </div>

                  <h3 className="font-bold text-white mb-2 group-hover:text-[#00AAFF] transition-colors truncate text-lg">
                    {project.name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5 text-[#00AAFF]" />
                    {new Date(project.updatedAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-600">
                      {((project.sceneData as { keyframes?: unknown[] })?.keyframes?.length ?? 0)} OBJECTS
                    </span>
                    <span className="text-xs font-black text-[#00AAFF] opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1">
                      OPEN SCENE <Sparkles className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </motion.div>
      </section>
    </div>
  );
}