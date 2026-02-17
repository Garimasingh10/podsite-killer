'use server';

import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { ThemeConfig } from '@/components/ThemeEngine';
import { revalidatePath } from 'next/cache';

export async function updateSettingsAction(
    podcastId: string,
    update: {
        theme_config?: ThemeConfig;
        page_layout?: string[];
    }
) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { error } = await supabase
        .from('podcasts')
        .update(update)
        .eq('id', podcastId)
        .eq('owner_id', user.id);

    if (error) {
        console.error('Error updating settings:', error);
        throw new Error('Failed to update settings');
    }

    revalidatePath(`/podcasts/${podcastId}/settings`);
    revalidatePath(`/${podcastId}`);

    return { success: true };
}
