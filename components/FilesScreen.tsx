import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Loader2, Upload, Trash2, File as FileIcon, Download, AlertCircle,
  Folder, Plus, HardDrive, Search, X
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';

interface FileItem {
  id: string;
  name: string;
  originalName?: string;
  size: number;
  type: string;
  updated_at: string;
  created_at: string;
  path: string;
  url: string;
}

interface FilesScreenProps {
  activeWorkspaceId: string;
}

// Draggable File Row Component
const FileRow = ({ file, selected, onSelect, onDelete }: { file: FileItem, selected: boolean, onSelect: (path: string) => void, onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: file.path,
    data: { file }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-sidebar-border transition-colors hover:bg-accent-bg group ${isDragging ? 'bg-accent-bg' : ''}`}
      {...listeners}
      {...attributes}
    >
      <td className="p-4 align-middle">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(file.path)}
          className="h-4 w-4 rounded border-sidebar-border text-primary focus:ring-primary"
          onPointerDown={(e) => e.stopPropagation()}
        />
      </td>
      <td className="p-4 align-middle font-medium">
        <div className="flex items-center gap-2">
          <FileIcon className="h-4 w-4 text-text-sub" />
          <span className="truncate max-w-[200px] text-text-main" title={file.name}>{file.name}</span>
        </div>
      </td>
      <td className="p-4 align-middle text-text-sub text-sm">{new Date(file.created_at).toLocaleDateString()}</td>
      <td className="p-4 align-middle text-text-sub text-sm">{(file.size / 1024).toFixed(1)} KB</td>
      <td className="p-4 align-middle text-right" onPointerDown={(e) => e.stopPropagation()}>
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href={file.url}
            download={file.name}
            target="_blank"
            rel="noreferrer"
            className="p-2 hover:bg-white rounded-md transition-colors shadow-subtle border border-sidebar-border"
            title="Download"
          >
            <Download className="h-4 w-4 text-text-sub" />
          </a>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 hover:bg-red-50 rounded-md transition-colors text-red-500 border border-red-100 shadow-subtle"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Droppable Folder Item Component
const FolderItem = ({ name, path, isActive, onClick, onDelete, isMain = false }: {
  name: string,
  path: string,
  isActive: boolean,
  onClick: () => void,
  onDelete?: () => void,
  isMain?: boolean
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: path,
    data: { path, isFolder: true }
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 group/folder
        ${isActive ? 'bg-primary text-white shadow-sm' : 'text-text-sub hover:bg-accent-bg hover:text-text-main'}
        ${isOver ? 'ring-2 ring-primary bg-accent-bg scale-[1.02]' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        {isMain ? <HardDrive className="h-4 w-4 shrink-0" /> : <Folder className="h-4 w-4 shrink-0" />}
        <span className="truncate text-sm font-medium">{name}</span>
      </div>
      {!isMain && onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className={`p-1 rounded hover:bg-white/20 transition-opacity ${isActive ? 'opacity-70 hover:opacity-100' : 'opacity-0 group-hover/folder:opacity-100'}`}
          title="Delete Folder"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export const FilesScreen: React.FC<FilesScreenProps> = ({ activeWorkspaceId }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const workspaceId = activeWorkspaceId;

  const loadData = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const folderList = await storageService.listFolders('workspace-files', workspaceId);
      setFolders(folderList);

      const path = currentFolder ? `${workspaceId}/${currentFolder}` : workspaceId;
      const recursive = currentFolder === null;

      const fileList = await storageService.listFiles('workspace-files', path, recursive);
      setFiles(fileList);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, currentFolder]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !active.data.current?.file) return;

    const file = active.data.current.file as FileItem;
    const targetPath = over.id as string;

    if (targetPath === currentFolder) return;

    let destinationPath = '';
    if (targetPath === 'ROOT') {
      destinationPath = `${workspaceId}/${file.name}`;
    } else {
      destinationPath = `${workspaceId}/${targetPath}/${file.name}`;
    }

    if (file.path === destinationPath) return;

    try {
      setLoading(true);
      await storageService.moveFile('workspace-files', file.path, destinationPath);
      setSuccess(`Moved ${file.name} to ${targetPath === 'ROOT' ? 'Workspace Drive' : targetPath}`);
      await loadData();
    } catch (err: any) {
      console.error('Move failed:', err);
      setError(`Failed to move file: ${err.message}`);
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !workspaceId) return;
    try {
      setLoading(true);
      await storageService.createFolder('workspace-files', `${workspaceId}/${newFolderName}`);
      setSuccess(`Folder "${newFolderName}" created`);
      setNewFolderName('');
      setIsCreatingFolder(false);
      await loadData();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDeleteFolder = async (folderName: string) => {
    if (!confirm(`Are you sure you want to delete folder "${folderName}" and ALL its contents?`)) return;
    try {
      setLoading(true);
      await storageService.deleteFolder('workspace-files', `${workspaceId}/${folderName}`);
      setSuccess(`Folder "${folderName}" deleted`);
      if (currentFolder === folderName) setCurrentFolder(null);
      await loadData();
    } catch (err: any) {
      setError(`Failed to delete folder: ${err.message}`);
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !workspaceId) return;

    setUploading(true);
    setError(null);

    try {
      const uploadPath = currentFolder ? `${workspaceId}/${currentFolder}` : workspaceId;
      await storageService.uploadFile('workspace-files', uploadPath, file);
      setSuccess(`File ${file.name} uploaded successfully`);
      await loadData();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDelete = async (path: string) => {
    try {
      await storageService.deleteFile('workspace-files', path);
      setSuccess('File deleted');
      setFiles(prev => prev.filter(f => f.path !== path));
      setSelectedFiles(prev => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`Delete ${selectedFiles.size} files?`)) return;
    try {
      await storageService.deleteFile('workspace-files', Array.from(selectedFiles));
      setSuccess(`${selectedFiles.size} files deleted`);
      await loadData();
      setSelectedFiles(new Set());
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredFiles = useMemo(() => {
    return files.filter(file =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  const toggleSelect = (path: string) => {
    const next = new Set(selectedFiles);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setSelectedFiles(next);
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) setSelectedFiles(new Set());
    else setSelectedFiles(new Set(filteredFiles.map(f => f.path)));
  };

  if (!workspaceId) return (
    <div className="h-full flex items-center justify-center p-8 text-text-sub">
      No workspace selected
    </div>
  );

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col bg-background-light">
        {/* Header */}
        <header className="border-b border-sidebar-border px-8 py-5 flex items-center justify-between bg-white shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-serif text-text-main">Workspace Files</h1>
            <span className="bg-accent-bg text-text-sub px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              {currentFolder ? currentFolder : 'Drive'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {loading && files.length > 0 && <Loader2 className="animate-spin h-5 w-5 text-primary/50" />}
            {selectedFiles.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors border border-red-100 shadow-subtle"
              >
                <Trash2 size={16} />
                Delete ({selectedFiles.size})
              </button>
            )}
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className={`flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all shadow-card ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                  <span>Upload File</span>
                </div>
              </label>
            </div>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 text-red-600 px-8 py-3 text-sm flex items-center justify-between border-b border-red-100 animate-in fade-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <AlertCircle size={16} />
              <span className="font-medium">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 px-8 py-3 text-sm flex items-center justify-between border-b border-green-100 animate-in fade-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">{success}</span>
            </div>
            <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600 transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-72 border-r border-sidebar-border bg-sidebar-light flex flex-col shrink-0">
            <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-bold text-text-sub uppercase tracking-widest">DRIVE STORAGE</span>
              </div>

              <div className="space-y-1">
                <FolderItem
                  name="Workspace Drive"
                  path="ROOT"
                  isActive={currentFolder === null}
                  isMain={true}
                  onClick={() => setCurrentFolder(null)}
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-[10px] font-bold text-text-sub uppercase tracking-widest">FOLDERS</span>
                </div>
                <div className="space-y-1">
                  {folders.map(folder => (
                    <FolderItem
                      key={folder}
                      name={folder}
                      path={folder}
                      isActive={currentFolder === folder}
                      onClick={() => setCurrentFolder(folder)}
                      onDelete={() => handleDeleteFolder(folder)}
                    />
                  ))}
                </div>

                {isCreatingFolder ? (
                  <div className="px-2 mt-3 animate-in fade-in slide-in-from-left duration-200">
                    <input
                      autoFocus
                      placeholder="New folder name..."
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onBlur={() => { if (!newFolderName) setIsCreatingFolder(false); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateFolder();
                        if (e.key === 'Escape') setIsCreatingFolder(false);
                      }}
                      className="w-full px-3 py-2 text-sm bg-white border border-sidebar-border rounded-lg focus:ring-2 focus:ring-primary outline-none shadow-subtle"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setIsCreatingFolder(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-text-sub hover:text-primary mt-2 w-full text-left font-medium rounded-lg transition-colors hover:bg-accent-bg"
                  >
                    <Plus size={16} /> <span>New Folder</span>
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* File Content Grid */}
          <main className="flex-1 flex flex-col bg-white overflow-hidden p-8">
            <div className="flex-1 flex flex-col bg-white border border-sidebar-border rounded-2xl shadow-card overflow-hidden">
              {/* Table Header / Search */}
              <div className="px-6 py-4 border-b border-sidebar-border flex items-center justify-between bg-sidebar-light">
                <div className="relative w-72 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub group-focus-within:text-primary transition-colors" />
                  <input
                    placeholder="Search in drive..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-sidebar-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all shadow-subtle"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-sub hover:text-primary">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="text-xs text-text-sub font-medium">
                  {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} found
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full border-collapse">
                  <thead className="bg-sidebar-light sticky top-0 z-10 border-b border-sidebar-border">
                    <tr>
                      <th className="p-4 w-10 text-left">
                        <input
                          type="checkbox"
                          checked={filteredFiles.length > 0 && selectedFiles.size === filteredFiles.length}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded border-sidebar-border text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="p-4 text-left text-[10px] font-bold text-text-sub uppercase tracking-widest">Name</th>
                      <th className="p-4 text-left text-[10px] font-bold text-text-sub uppercase tracking-widest">Date Added</th>
                      <th className="p-4 text-left text-[10px] font-bold text-text-sub uppercase tracking-widest">Size</th>
                      <th className="p-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sidebar-border">
                    {loading && files.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                              <Loader2 className="animate-spin h-10 w-10 text-primary" />
                              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full animate-pulse"></div>
                            </div>
                            <p className="text-sm text-text-sub font-medium animate-pulse">Synchronizing with drive...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredFiles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-24 text-center text-text-sub">
                          <div className="flex flex-col items-center gap-5 scale-in">
                            <div className="bg-accent-bg p-6 rounded-[2.5rem] shadow-inner">
                              <Folder className="h-12 w-12 text-text-sub/30" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                              <p className="font-semibold text-text-main text-lg">No files here yet</p>
                              <p className="text-sm max-w-[200px] mx-auto text-text-sub/80">Drop files here or use the upload button to get started.</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredFiles.map((file) => (
                        <FileRow
                          key={file.path}
                          file={file}
                          selected={selectedFiles.has(file.path)}
                          onSelect={toggleSelect}
                          onDelete={() => handleDelete(file.path)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-text-sub uppercase tracking-widest px-2">
              <div>{currentFolder ? `Viewing Folder: ${currentFolder}` : 'Recursive Workspace View'}</div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Connected to Supabase Storage
              </div>
            </div>
          </main>
        </div>
      </div>
    </DndContext>
  );
};