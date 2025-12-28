import { supabase } from './supabaseClient';

export const storageService = {
    async uploadFile(bucket: string, workspaceId: string, file: File) {
        const fileExt = file.name.split('.').pop();
        // Sanitize filename: replace non-alphanumeric chars (except . - _) with _
        const sanitizedName = file.name.substring(0, file.name.lastIndexOf('.')).replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
        // Use sanitized original name without timestamp to prevent duplicates (overwrite behavior)
        const fileName = `${sanitizedName}.${fileExt}`;
        const filePath = `${workspaceId}/${fileName}`;

        console.log('DEBUG: Uploading file', { bucket, workspaceId, filePath, file });

        // Supabase storage metadata
        const metadata = {
            originalName: file.name,
            mimetype: file.type,
            size: file.size
        };

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true, // Overwrite existing file with same name
                contentType: file.type,
                metadata: metadata // Store validation metadata
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return {
            id: data.path,
            url: publicUrl,
            path: data.path,
            name: file.name,
            size: file.size,
            type: file.type
        };
    },

    async deleteFile(bucket: string, paths: string | string[]) {
        const filesToDelete = Array.isArray(paths) ? paths : [paths];
        const { error } = await supabase.storage
            .from(bucket)
            .remove(filesToDelete);

        if (error) {
            console.error('Error deleting file(s):', error);
            throw error;
        }
    },

    async moveFile(bucket: string, fromPath: string, toPath: string) {
        const { error } = await supabase.storage
            .from(bucket)
            .move(fromPath, toPath);

        if (error) throw error;
    },

    async createFolder(bucket: string, folderPath: string) {
        // Create a placeholder file to establish the folder
        const { error } = await supabase.storage
            .from(bucket)
            .upload(`${folderPath}/.keep`, new Blob([''], { type: 'text/plain' }));

        if (error) throw error;
    },

    async listFiles(bucket: string, path: string, recursive: boolean = false): Promise<any[]> {
        let allFiles: any[] = [];

        const { data, error } = await supabase.storage
            .from(bucket)
            .list(path, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            });

        if (error) throw error;

        // Process current directory
        for (const item of data) {
            if (item.id === null) {
                // It's a folder
                if (recursive) {
                    const subFiles = await this.listFiles(bucket, `${path}/${item.name}`, true);
                    allFiles = [...allFiles, ...subFiles];
                }
            } else {
                // It's a file
                if (item.name !== '.keep') { // Ignore placeholder files
                    allFiles.push({
                        id: item.id,
                        name: item.metadata?.originalName || item.name,
                        originalName: item.name, // Keep the partial path name/key for logic if needed
                        size: item.metadata?.size || 0,
                        type: item.metadata?.mimetype || 'application/octet-stream',
                        updated_at: item.updated_at,
                        created_at: item.created_at,
                        path: `${path}/${item.name}`,
                        url: supabase.storage.from(bucket).getPublicUrl(`${path}/${item.name}`).data.publicUrl
                    });
                }
            }
        }

        return allFiles;
    },

    async listFolders(bucket: string, path: string): Promise<string[]> {
        const { data, error } = await supabase.storage
            .from(bucket)
            .list(path, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            });

        if (error) throw error;

        const folders: string[] = [];
        for (const item of data) {
            if (item.id === null) {
                // It is a folder
                folders.push(item.name);
            }
        }
        return folders;
    },

    async deleteFolder(bucket: string, folderPath: string) {
        // In Supabase, deleting a "folder" requires deleting all its contents
        const files = await this.listFiles(bucket, folderPath, true);
        const pathsToDelete = files.map(f => f.path);

        // Also need to delete the .keep file if it exists
        pathsToDelete.push(`${folderPath}/.keep`);

        if (pathsToDelete.length > 0) {
            await this.deleteFile(bucket, pathsToDelete);
        }
    }
};
