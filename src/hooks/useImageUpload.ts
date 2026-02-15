import { useState } from "react";
import { supabase } from "../lib/supabase";

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (
    file: File,
    bucket: string = "products",
  ): Promise<string | null> => {
    try {
      setUploading(true);
      setError(null);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err: any) {
      setError(err.message || "Error uploading image");
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, error };
}
