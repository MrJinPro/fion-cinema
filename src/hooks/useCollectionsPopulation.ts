import { supabase } from '@/integrations/supabase/client';

export const useCollectionsPopulation = () => {
  const checkCollectionsStatus = async () => {
    try {
      const { count: collectionsCount } = await supabase
        .from('curated_collections')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: itemsCount } = await supabase
        .from('collection_items')
        .select('*', { count: 'exact', head: true });

      return {
        collectionsCount: collectionsCount || 0,
        itemsCount: itemsCount || 0,
        needsPopulation: (collectionsCount || 0) > 0 && (itemsCount || 0) === 0,
      };
    } catch (error) {
      console.error('Error checking collections status:', error);
      return {
        collectionsCount: 0,
        itemsCount: 0,
        needsPopulation: false,
      };
    }
  };

  const triggerCollectionsPopulation = async () => {
    console.log('🚀 Triggering curated collections population...');

    try {
      const { data, error } = await supabase.functions.invoke('populate-collections', {
        body: { trigger: 'auto' },
      });

      if (error) {
        console.error('❌ Error triggering collections population:', error);
        return { success: false, error };
      }

      console.log('✅ Collections population triggered successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Failed to trigger collections population:', error);
      return { success: false, error };
    }
  };

  return {
    checkCollectionsStatus,
    triggerCollectionsPopulation,
  };
};
