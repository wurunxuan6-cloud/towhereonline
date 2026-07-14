import { createClient } from '@supabase/supabase-js';

// Hardcoded for migration script convenience
const supabaseUrl = 'https://fakokuvqtlpijcukvekj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZha29rdXZxdGxwaWpjdWt2ZWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MTk0MzcsImV4cCI6MjA4MzQ5NTQzN30.Xy542SBt6AG_kEAySkHjbggJGZAGIa0wif0yOU0wuFg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const cityConfig = {};

async function migrate() {
    console.log('Starting migration...');
    let order = 0;
    for (const [name, config] of Object.entries(cityConfig)) {
        console.log(`Migrating city: ${name}`);
        // Insert city
        const { data: cityData, error: cityError } = await supabase
            .from('cities')
            .upsert({
                name,
                description: config.description,
                main_image: config.mainImage,
                sort_order: order++
            }, { onConflict: 'name' })
            .select()
            .single();

        if (cityError) {
            console.error(`Error inserting city ${name}:`, cityError);
            continue;
        }

        const cityId = cityData.id;

        // Insert gallery images
        if (config.gallery && config.gallery.length > 0) {
            console.log(`Inserting ${config.gallery.length} images for ${name}`);
            const imageObjects = config.gallery.map((url, index) => ({
                city_id: cityId,
                url,
                sort_order: index
            }));

            const { error: imagesError } = await supabase
                .from('city_images')
                .insert(imageObjects);

            if (imagesError) {
                console.error(`Error inserting images for city ${name}:`, imagesError);
            }
        }
    }
    console.log('Migration completed!');
}

migrate();
