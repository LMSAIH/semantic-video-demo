import { getSupportedModels } from "semantic-video";
import { DEFAULT_CONFIG } from "../utils/examples";
import { fileExists } from "../utils/fileUtils";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  validatedConfigs: any[];
}

/**
 * Validates an array of video analysis configurations
 */
export async function validateConfigs(configs: any[]): Promise<ValidationResult> {
  const supportedModels = getSupportedModels();
  const validationErrors: string[] = [];
  
  const validatedConfigs = await Promise.all(configs.map(async (config: any, index: number) => {
    // Check required videoPath
    if (!config.videoPath) {
      validationErrors.push(`Config ${index}: videoPath is required`);
      return null;
    }

    // Check if file exists
    const exists = fileExists(config.videoPath);
    if (!exists) {
      validationErrors.push(`Config ${index}: File "${config.videoPath}" does not exist`);
      return null;
    }

    // Validate model if provided
    if (config.model && !supportedModels.includes(config.model)) {
      validationErrors.push(
        `Config ${index}: Invalid model "${config.model}". Supported models: ${supportedModels.join(', ')}`
      );
      return null;
    }

    // Build validated config with defaults
    return {
      videoPath: config.videoPath,
      numPartitions: config.numPartitions || DEFAULT_CONFIG.numPartitions,
      prompt: config.prompt || DEFAULT_CONFIG.prompt,
      quality: config.quality || DEFAULT_CONFIG.quality,
      scale: config.scale || DEFAULT_CONFIG.scale,
      model: config.model || DEFAULT_CONFIG.model
    };
  }));

  // Filter out null entries from failed validations
  const cleanConfigs = validatedConfigs.filter((c: any) => c !== null);

  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors,
    validatedConfigs: cleanConfigs
  };
}
