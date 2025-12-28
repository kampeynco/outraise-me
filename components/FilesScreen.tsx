import React, { useState, useEffect, useCallback } from 'react';
import { FileUpload } from "@ark-ui/react/file-upload";
import { Upload, Trash2, FileText, Image, File as FileIcon, Download, FileSpreadsheet, FileArchive, Loader2, Search } from "lucide-react";
import { storageService } from '../services/storageService';

interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
  created_at?: string;
}

interface FilesScreenProps {
  workspaceId: string | null;
}

const getFileExtension = (filename: string) => {
  const ext = filename.split('.').pop()?.toUpperCase();
  return ext || '-';
};

const getFileIcon = (type: string, name: string) => {
  const fileName = name.toLowerCase();

  if (type.startsWith('image/')) {
    return <Image className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
  }
  if (fileName.endsWith('.pdf')) {
    return <FileText className="w-5 h-5 text-red-500 dark:text-red-400" />;
  }
  if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx') || fileName.endsWith('.csv')) {
    return <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />;
  }
  if (fileName.endsWith('.zip') || fileName.endsWith('.rar')) {
    return <FileArchive className="w-5 h-5 text-orange-500 dark:text-orange-400" />;
  }
  if (fileName.endsWith('.doc') || fileName.endsWith('.docx') || fileName.endsWith('.rtf')) {
    return <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
  }

  return <FileIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FilesScreen: React.FC<FilesScreenProps> = ({ workspaceId }) => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await storageService.listFiles('workspace-files', workspaceId);
      // Sort by creation date descending
      setFiles(data.sort((a, b) => {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }));
    } catch (error) {
      console.error('Error loading files:', error);
      // alert('Error loading files: ' + (error as any).message); // Optional: verbose
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    console.log('FilesScreen mounted with workspaceId:', workspaceId);
    loadFiles();
  }, [loadFiles, workspaceId]);

  const handleUpload = async (event: any) => {
    const acceptedFiles = event.acceptedFiles as File[];

    if (!workspaceId) {
      alert("Error: No active workspace found. Please select a workspace.");
      return;
    }

    if (acceptedFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        await storageService.uploadFile('workspace-files', workspaceId, file);
      }
      await loadFiles();
      alert("Upload successful!");
    } catch (error: any) {
      console.error('Error uploading files:', error);
      alert(`Failed to upload files: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (path: string) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      await storageService.deleteFile('workspace-files', path);
      setFiles(prev => prev.filter(f => f.path !== path));
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file.');
    }
  };

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-background-dark p-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-text-main dark:text-white mb-2">Files</h1>
            <p className="text-text-sub dark:text-gray-400">Manage your campaign documents and assets.</p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
            />
          </div>
        </header>

        <FileUpload.Root
          maxFiles={10}
          onFileAccept={handleUpload}
          className="flex flex-col gap-8"
        >
          {/* Upload Area */}
          <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center border border-gray-100 dark:border-gray-700 text-gray-400">
                {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-main dark:text-white">
                  {uploading ? 'Uploading Files...' : 'Upload Documents'}
                </h3>
                <p className="text-sm text-text-sub dark:text-gray-400 mt-0.5">Support for PDF, Images, and Office files.</p>
              </div>
            </div>
            <FileUpload.Trigger
              disabled={uploading}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Select Files
            </FileUpload.Trigger>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-main dark:text-white">
              {loading ? 'Loading Files...' : `Uploaded Files (${filteredFiles.length})`}
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : filteredFiles.length > 0 ? (
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-subtle transition-colors">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <div className="col-span-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </div>
                  <div className="col-span-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </div>
                  <div className="col-span-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Size
                  </div>
                  <div className="col-span-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                    Actions
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredFiles.map((file, index) => (
                    <div key={file.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50 group">
                      {/* Name Column */}
                      <div className="col-span-6 flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700">
                          {file.type.startsWith('image/') ? (
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            getFileIcon(file.type, file.name)
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-text-main dark:text-white truncate block" title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-[10px] text-text-sub dark:text-gray-500 block mt-0.5">
                            Added on {new Date(file.created_at || '').toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Type Column */}
                      <div className="col-span-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {getFileExtension(file.name)}
                        </span>
                      </div>

                      {/* Size Column */}
                      <div className="col-span-2">
                        <span className="text-sm text-text-sub dark:text-gray-400">
                          {formatSize(file.size)}
                        </span>
                      </div>

                      {/* Actions Column */}
                      <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDownload(file.url, file.name)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.path)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 mb-4 text-gray-400">
                  <FileText className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm text-text-main dark:text-white font-medium">
                  {searchQuery ? 'No files match your search' : 'No files uploaded yet'}
                </p>
                <p className="text-xs text-text-sub dark:text-gray-400 mt-1">
                  {searchQuery ? 'Try a different search term' : 'Upload files to see them here'}
                </p>
              </div>
            )}
          </div>

          <FileUpload.HiddenInput />
        </FileUpload.Root>
      </div>
    </div>
  );
};