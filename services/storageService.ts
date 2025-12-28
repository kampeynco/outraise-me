import { supabase } from './supabaseClient';

export const storageService = {
    async uploadFile(bucket: string, workspaceId: string, file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${workspaceId}/${fileName}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

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

    async deleteFile(bucket: string, path: string) {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    },

    async listFiles(bucket: string, workspaceId: string) {
        const { data, error } = await supabase.storage
            .from(bucket)
            .list(workspaceId, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' },
            });



        if (error) throw error;

        return data.map(file => ({
            id: `${workspaceId}/${file.name}`,
            name: file.name,
            size: file.metadata.size,
            type: file.metadata.mimetype,
            updated_at: file.updated_at,
            path: `${workspaceId}/${file.name}`,
            url: supabase.storage.from(bucket).getPublicUrl(`${workspaceId}/${file.name}`).data.publicUrl
        }));
    }
};
