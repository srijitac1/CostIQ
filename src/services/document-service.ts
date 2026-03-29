import { supabase } from "@/integrations/supabase/client";

export interface UserDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  category: string;
  status: "processing" | "verified" | "needs_review";
  storage_path: string;
  uploaded_at: string;
}

export const DocumentService = {
  async getDocuments() {
    try {
      const { data, error } = await (supabase as any)
        .from("user_documents")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        if (error.code === "PGRST116" || error.message.includes("does not exist")) return [];
        throw error;
      }
      return data as UserDocument[];
    } catch (err) {
      console.warn("Documents fetch failed:", err);
      return [];
    }
  },

  async uploadDocument(file: File, category: string) {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `user-uploads/${fileName}`;

    try {
      // 1. Upload to Storage
      const { error: storageError } = await supabase.storage
        .from("governance-reports")
        .upload(filePath, file);

      if (storageError) {
        console.error("Supabase Storage Error:", storageError);
        throw new Error(`Storage Error: ${storageError.message}`);
      }

      // 2. Insert Metadata
      const newDoc = {
        name: file.name,
        type: file.type,
        size: this.fmtBytes(file.size),
        category: category,
        storage_path: filePath,
        status: "processing",
      };

      const { data, error: dbError } = await (supabase as any)
        .from("user_documents")
        .insert([newDoc])
        .select()
        .single();

      if (dbError) {
        console.error("Supabase Database Error:", dbError);
        throw new Error(`Database Error: ${dbError.message}`);
      }
      
      // Simulate AI "verification" delay for the SaaS feel
      if (data) {
        this.triggerProcessingSimulation(data.id);
      }

      return data as UserDocument;
    } catch (err: any) {
      console.error("Document upload failed phase:", err);
      throw err;
    }
  },

  async submitIntake(formData: any) {
    const { error } = await (supabase as any)
      .from("intake_forms")
      .insert([{ 
        org_name: formData.orgName, 
        data: formData,
        submitted_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
  },

  fmtBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },

  async triggerProcessingSimulation(id: string) {
    setTimeout(async () => {
      await (supabase as any)
        .from("user_documents")
        .update({ status: Math.random() > 0.15 ? "verified" : "needs_review" })
        .eq("id", id);
    }, 5000 + Math.random() * 5000);
  }
};
