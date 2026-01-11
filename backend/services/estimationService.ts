import { 
  SemanticVideoClient,
  type MultiVideoTokenEstimate
} from "semantic-video";

const semanticVideoClient = new SemanticVideoClient(process.env.OPENAI_API_KEY || "",);

/**
 * Estimates token usage for multiple video analyses
 */
export async function estimateTokenUsage(configs: any[]): Promise<MultiVideoTokenEstimate> {
  return await semanticVideoClient.estimateMultipleVideosTokens(configs);
}
