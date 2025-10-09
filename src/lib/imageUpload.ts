import { supabase } from "@/integrations/supabase/client";

/**
 * Upload an image file to Supabase Storage and return its public URL
 * @param file - The image file to upload
 * @param bucket - The storage bucket name (default: 'brand-logos')
 * @returns The public URL of the uploaded image
 */
export const uploadImageToStorage = async (
  file: File,
  bucket: string = 'brand-logos'
): Promise<string> => {
  // Generate a unique filename to avoid conflicts
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  // Upload the file to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading image to storage:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
};
