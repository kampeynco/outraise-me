import { supabase } from './supabaseClient';

export interface Form {
    id: string;
    created_at: string;
    entity_id: string;
    title: string;
    slug: string;
    description?: string;
    status: 'draft' | 'active' | 'archived';
    goal_amount?: number;
    settings?: any;
}

export const formService = {
    async getForms(entityId: string) {
        const { data, error } = await supabase
            .from('forms')
            .select('*')
            .eq('entity_id', entityId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Form[];
    },

    async createForm(entityId: string, form: { title: string; slug: string; description?: string }) {
        // Check if slug is available first
        const isAvailable = await this.isSlugAvailable(form.slug);
        if (!isAvailable) {
            throw new Error('This form link is already taken. Please try another one.');
        }

        const { data, error } = await supabase
            .from('forms')
            .insert({
                entity_id: entityId,
                title: form.title,
                slug: form.slug,
                description: form.description,
                status: 'draft'
            })
            .select()
            .single();

        if (error) throw error;
        return data as Form;
    },

    async isSlugAvailable(slug: string) {
        const { count, error } = await supabase
            .from('forms')
            .select('*', { count: 'exact', head: true })
            .eq('slug', slug);

        if (error) throw error;
        return count === 0;
    },

    async getFormById(id: string) {
        const { data, error } = await supabase
            .from('forms')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Form;
    },

    async updateForm(id: string, updates: Partial<Form>) {
        const { data, error } = await supabase
            .from('forms')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Form;
    }
};
