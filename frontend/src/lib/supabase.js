import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to upload files
export const uploadFile = async (file, bucket = 'uploads') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { filePath, publicUrl };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Helper function to save upload metadata to database
export const saveUploadMetadata = async (metadata) => {
  try {
    const { data, error } = await supabase
      .from('uploads')
      .insert([metadata])
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error saving upload metadata:', error);
    throw error;
  }
};

// Helper function to get all uploads
export const getUploads = async () => {
  try {
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching uploads:', error);
    throw error;
  }
};

// Helper function to delete an upload
export const deleteUpload = async (id, filePath, bucket = 'uploads') => {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (storageError) {
      throw storageError;
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('uploads')
      .delete()
      .eq('id', id);

    if (dbError) {
      throw dbError;
    }

    return true;
  } catch (error) {
    console.error('Error deleting upload:', error);
    throw error;
  }
};
