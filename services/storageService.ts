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

    async moveToTrash(bucket: string, workspaceId: string, filePath: string) {
        const fileName = filePath.split('/').pop();
        const deletedAt = new Date().toISOString();
        const trashId = `${Date.now()}_${fileName}`;
        const trashPath = `trash/${workspaceId}/${trashId}`;

        // Get file metadata before moving
        const { data: fileInfo, error: statError } = await supabase.storage
            .from(bucket)
            .list(filePath.substring(0, filePath.lastIndexOf('/')), {
                search: fileName
            });

        if (statError) throw statError;
        const item = fileInfo?.find(f => f.name === fileName);

        // Move in storage
        const { error: moveError } = await supabase.storage
            .from(bucket)
            .move(filePath, trashPath);

        if (moveError) throw moveError;

        // Track in DB
        const { error: dbError } = await supabase
            .from('trash_files')
            .insert({
                workspace_id: workspaceId,
                original_path: filePath,
                file_name: fileName,
                file_size: item?.metadata?.size || 0,
                content_type: item?.metadata?.mimetype,
                trash_path: trashPath,
                deleted_at: deletedAt,
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });

        if (dbError) {
            console.error('Error tracking trash in DB:', dbError);
            // Even if DB fails, the file is in trash folder now
        }
    },

    async restoreFromTrash(bucket: string, trashItemId: string) {
        // Get info from DB
        const { data: trashItem, error: fetchError } = await supabase
            .from('trash_files')
            .select('*')
            .eq('id', trashItemId)
            .single();

        if (fetchError || !trashItem) throw fetchError || new Error('Trash item not found');

        // Move back in storage
        const { error: moveError } = await supabase.storage
            .from(bucket)
            .move(trashItem.trash_path, trashItem.original_path);

        if (moveError) throw moveError;

        // Remove from DB
        await supabase.from('trash_files').delete().eq('id', trashItemId);
    },

    async listTrash(workspaceId: string) {
        const { data, error } = await supabase
            .from('trash_files')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('deleted_at', { ascending: false });

        if (error) throw error;
        return data.map(item => ({
            ...item,
            id: item.id,
            name: item.file_name,
            path: item.trash_path,
            size: item.file_size,
            type: item.content_type,
            updated_at: item.deleted_at
        }));
    },
    async permanentlyDelete(bucket: string, trashItemId: string) {
        // Get info from DB
        const { data: trashItem, error: fetchError } = await supabase
            .from('trash_files')
            .select('*')
            .eq('id', trashItemId)
            .single();

        if (fetchError || !trashItem) throw fetchError || new Error('Trash item not found');

        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from(bucket)
            .remove([trashItem.trash_path]);

        if (storageError) throw storageError;

        // Remove from DB
        await supabase.from('trash_files').delete().eq('id', trashItemId);
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
