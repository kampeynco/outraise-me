import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        console.log('Starting cleanup of expired trash files...')

        // Fetch expired trash items
        const { data: expiredItems, error: fetchError } = await supabase
            .from('trash_files')
            .select('*')
            .lte('expires_at', new Date().toISOString())

        if (fetchError) {
            throw fetchError
        }

        if (!expiredItems || expiredItems.length === 0) {
            console.log('No expired items to clean up.')
            return new Response(JSON.stringify({ message: 'No expired items found' }), {
                headers: { 'Content-Type': 'application/json' },
            })
        }

        console.log(`Found ${expiredItems.length} expired items. Cleaning up...`)

        const results = []

        for (const item of expiredItems) {
            try {
                // Delete from storage
                const { error: storageError } = await supabase.storage
                    .from('workspace-files')
                    .remove([item.trash_path])

                if (storageError) {
                    console.error(`Error deleting file from storage: ${item.trash_path}`, storageError)
                    results.push({ id: item.id, status: 'error', reason: 'storage', error: storageError.message })
                    continue
                }

                // Delete from DB
                const { error: dbError } = await supabase
                    .from('trash_files')
                    .delete()
                    .eq('id', item.id)

                if (dbError) {
                    console.error(`Error deleting record from DB: ${item.id}`, dbError)
                    results.push({ id: item.id, status: 'error', reason: 'db', error: dbError.message })
                } else {
                    results.push({ id: item.id, status: 'success' })
                }
            } catch (err) {
                console.error(`Unexpected error cleaning up item ${item.id}:`, err)
                results.push({ id: item.id, status: 'error', reason: 'unexpected', error: err.message })
            }
        }

        const successCount = results.filter(r => r.status === 'success').length
        const failCount = results.length - successCount

        console.log(`Cleanup finished. Success: ${successCount}, Failed: ${failCount}`)

        return new Response(JSON.stringify({
            message: 'Cleanup completed',
            processed: results.length,
            successCount,
            failCount,
            details: results
        }), {
            headers: { 'Content-Type': 'application/json' },
        })

    } catch (error) {
        console.error('Cleanup job failed:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
})
