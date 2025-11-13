/**
 * Validates that an instance name contains only alphanumeric characters and underscores
 * @param name - The instance name to validate
 * @returns true if valid, false otherwise
 */
export function validateInstanceName(name: string): boolean {
  if (!name || name.length === 0) {
    return false;
  }
  
  // Only allow alphanumeric characters and underscores
  const validPattern = /^[a-zA-Z0-9_]+$/;
  return validPattern.test(name);
}

/**
 * Sanitizes input by removing invalid characters and replacing spaces with underscores
 * @param input - The raw input string
 * @returns Sanitized string with only alphanumeric characters and underscores
 */
function sanitizeInput(input: string): string {
  // Replace spaces with underscores
  let sanitized = input.replace(/\s+/g, '_');
  
  // Remove any characters that are not alphanumeric or underscore
  sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '');
  
  return sanitized;
}

/**
 * Generates a unique instance name by sanitizing input and appending a 4-digit random number
 * @param baseName - The base name for the instance
 * @returns A unique instance name in format: sanitizedName_XXXX
 */
export function generateInstanceName(baseName: string): string {
  // Sanitize the input
  const sanitized = sanitizeInput(baseName);
  
  // Generate a 4-digit random number (1000-9999)
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  
  // Combine sanitized name with random suffix
  return `${sanitized}_${randomSuffix}`;
}
