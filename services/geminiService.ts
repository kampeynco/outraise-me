import { supabase } from "./supabaseClient";

/**
 * Generates a response from the Gemini AI model.
 * Now routed through a Supabase Edge Function for improved security.
 */
export const generateResponse = async (prompt: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini', {
      body: { prompt }
    });

    if (error) {
      console.error("Error calling Gemini Edge Function:", error);
      return `Error: ${error.message}`;
    }

    return data?.text || "No response generated.";
  } catch (error) {
    console.error("Exception calling Gemini Edge Function:", error);
    throw error;
  }
};
