import { supabase } from './supabaseClient';
import { Database } from '../types/supabase';

// Mapping types to new schema if strict typing was available, but using 'any' for now or inferring
// assuming supabaseClient has generic types or we rely on loose typing for the transition

export const workspaceService = {
    // Renamed to match intent, but keeping method name for compatibility or updating if I update callers
    // I will keep method names compatible with App.tsx and OnboardingWizard.tsx for now,
    // but change implementation.

    async createWorkspace(name: string, userId: string) {
        // Calls the new RPC 'create_entity'
        // Expecting RPC to return the ID directly or an object?
        // The RPC returns UUID. Supabase rpc call returns { data, error }.
        // data will be the UUID value.

        const { data: entityId, error } = await supabase
            .rpc('create_entity', { name, type: 'organization' });

        if (error) throw error;

        // Fetch the created entity to return consistent object
        const { data: entity, error: fetchError } = await supabase
            .from('entities')
            .select('*')
            .eq('id', entityId)
            .single();

        if (fetchError) throw fetchError;
        return entity;
    },

    async inviteMembers(entityId: string, emails: string[], invitedBy: string) {
        if (emails.length === 0) return;

        const invites = emails.map((email) => ({
            entity_id: entityId,
            email,
            role: 'member',
            invited_by: invitedBy,
        }));

        const { error } = await supabase
            .from('entity_invites')
            .insert(invites);

        if (error) throw error;
    },

    async getUserWorkspaces(userId: string) {
        // Query entity_members instead of workspace_members
        const { data, error } = await supabase
            .from('entity_members')
            .select(`
        entity_id,
        role,
        entities:entity_id (
            id,
            name,
            created_at,
            type
        )
      `)
            .eq('user_id', userId);

        if (error) throw error;

        // Map back to a structure the frontend expects (id, name, etc.)
        // data is { entity_id, role, entities: { ... } }
        return data
            .filter(d => d.entities) // Filter out any null entities (e.g. from RLS restriction)
            .map(d => {
                // @ts-ignore
                const entity = d.entities;
                return {
                    id: entity.id,
                    name: entity.name,
                    created_at: entity.created_at,
                    type: entity.type,
                    role: d.role
                };
            });
    }
};

