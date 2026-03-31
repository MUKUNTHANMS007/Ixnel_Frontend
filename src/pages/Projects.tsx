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
  const [newName, setNewName] = useState('');
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <LogIn className="w-8 h-8 text-indigo-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Sign in to view projects</h2>
          <p className="text-neutral-500">Your saved 3D scenes will appear here.</p>
        </div>
        <button
          onClick={() => onNavigate('signin')}
          className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="w-full relative bg-white text-neutral-900 min-h-screen">
      <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <section className="relative pt-8 pb-24 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          
          {/* Profile Quick View (Claude/ChatGPT Style) */}
          <div className="mb-12 p-6 bg-neutral-50 border border-neutral-100 rounded-[24px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/20">
                {user?.name?.[0].toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">{user?.name}</h2>
                <p className="text-sm text-neutral-500">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="text-left md:text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Available Credits</p>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500 fill-current" />
                  <span className="text-2xl font-black text-neutral-900">1,250</span>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('pricing')}
                className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold hover:bg-neutral-50 transition-all shadow-sm"
              >
                Top up
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">My Projects</h1>
              </div>
              <p className="text-neutral-500">Your saved 3D scenes and workspaces.</p>
            </div>

            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {/* New Project Modal */}
          {showNew && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-6 border border-indigo-200 bg-indigo-50/50 rounded-2xl flex items-center gap-4"
            >
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Scene name..."
                className="flex-1 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-neutral-900"
              />
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create
              </button>
              <button
                onClick={() => setShowNew(false)}
                className="px-4 py-2.5 text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && projects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <Box className="w-8 h-8 text-neutral-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-700 mb-1">No projects yet</h3>
                <p className="text-sm text-neutral-400">Create your first 3D scene to get started.</p>
              </div>
              <button
                onClick={() => setShowNew(true)}
                className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors text-sm"
              >
                Create Project
              </button>
            </div>
          )}

          {/* Project Grid */}
          {!isLoading && projects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {projects.map((project, i) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => handleLoadProject(project)}
                  className="group p-5 bg-white border border-neutral-200 rounded-2xl cursor-pointer hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all"
                >
                  {/* Preview thumbnail */}
                  <div className="w-full h-32 mb-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-neutral-100 flex items-center justify-center overflow-hidden">
                    <div className="grid grid-cols-3 gap-2 opacity-30">
                      {[...Array(9)].map((_, j) => (
                        <div key={j} className="w-6 h-6 rounded bg-indigo-300" style={{ opacity: Math.random() * 0.8 + 0.2 }} />
                      ))}
                    </div>
                  </div>

                  <h3 className="font-semibold text-neutral-900 mb-1 group-hover:text-indigo-600 transition-colors truncate">
                    {project.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Clock className="w-3 h-3" />
                    {new Date(project.updatedAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </div>

                  <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-xs text-neutral-400">
                      {((project.sceneData as { keyframes?: unknown[] })?.keyframes?.length ?? 0)} objects
                    </span>
                    <span className="text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open →
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
