import { supabase } from "@/integrations/supabase/client";

export interface GovernanceReport {
  id: string;
  created_at: string;
  filename: string;
  file_path: string;
  report_type: string;
  org_name: string;
  findings_count: number;
  savings_total: number;
}

export const ReportHistoryService = {
  /**
   * Fetch all historical governance reports
   */
  async getReports(): Promise<GovernanceReport[]> {
    const { data, error } = await (supabase as any)
      .from("governance_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Could not fetch report history. Table may not exist yet.", error);
      return [];
    }

    return data as GovernanceReport[];
  },

  /**
   * Generate a signed URL for a report in storage
   */
  async getDownloadUrl(filePath: string): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from("governance-reports")
      .createSignedUrl(filePath, 60 * 5); // 5 minute expiry

    if (error) {
      console.error("Error generating signed URL:", error);
      return null;
    }

    return data.signedUrl;
  },

  /**
   * Delete a report from storage and the database
   */
  async deleteReport(id: string, filePath: string): Promise<void> {
    // 1. Delete from database
    const { error: dbError } = await (supabase as any)
      .from("governance_reports")
      .delete()
      .eq("id", id);
    
    if (dbError) throw dbError;

    // 2. Delete from storage
    const { error: stError } = await supabase.storage
      .from("governance-reports")
      .remove([filePath]);

    if (stError) console.warn("Storage removal failed:", stError);
  }
};
