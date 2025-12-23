import { ApiToolBase } from './base.js';
import { ToolContext, ToolResponse, createSuccessResponse, createErrorResponse } from '../common/types.js';
import fs from 'fs';


/**
 * Tool for making GET requests
 */
export class GetRequestTool extends ApiToolBase {
  /**
   * Execute the GET request tool
   */
  async execute(args: any, context: ToolContext): Promise<ToolResponse> {
        return this.safeExecute(context, async (apiContext) => {
      const response = await apiContext.get(args.url, {
        headers: {
          ...(args.token ? { Authorization: `Bearer ${args.token}` } : {}),
          ...(args.headers || {})
        }
      });

      let responseText: string;
      try {
        responseText = await response.text();
      } catch (error){
        responseText = 'Unable to get response text';
      }
      
      return createSuccessResponse([
        `GET request to ${args.url}`,
        `Status: ${response.status()} ${response.statusText()}`,
        `Response: ${responseText.substring(0, 1000)}${responseText.length > 1000 ? '...' : ''}`
      ]);
    });
  }
}

type MultipartFileValue = {
  path: string;
  name?: string;
  contentType?: string;
};

type MultipartValue =
  | string
  | number
  | boolean
  | null
  | MultipartFileValue;

type PostOptions = {
  headers: Record<string, string>;
  data?: unknown;
  multipart?: Record<string, MultipartValue | {
    name: string;
    mimeType: string;
    buffer: Buffer;
  }>;
};

/**
 * Tool for making POST requests
 */
export class PostRequestTool extends ApiToolBase {
  /**
   * Execute the POST request tool
   */
  async execute(args: any, context: ToolContext): Promise<ToolResponse> {
    return this.safeExecute(context, async (apiContext) => {
      const options: PostOptions = {
        headers: {
          ...(args.token ? { Authorization: `Bearer ${args.token}` } : {}),
          ...(args.headers || {})
        }
      };

      // -------- multipart/form-data --------
      if (args.multipart) {
        options.multipart = {};

        for (const [key, value] of Object.entries(args.multipart as Record<string, MultipartValue>)) {
          // File field
          if (value && typeof value === 'object' && 'path' in value) {
            const file = value as MultipartFileValue;
            options.multipart[key] = {
              name: file.name || file.path.split('/').pop() || 'file',
              mimeType: file.contentType || 'application/octet-stream',
              buffer: fs.readFileSync(file.path)
            };
          } else {
            // Regular form field
            options.multipart[key] = value;
          }
        }
      }
      // -------- JSON (default) --------
      else if (args.value !== undefined) {
        if (
          typeof args.value === 'string' &&
          (args.value.startsWith('{') || args.value.startsWith('['))
        ) {
          try {
            options.data = JSON.parse(args.value);
          } catch (error) {
            return createErrorResponse(
              `Failed to parse request body: ${
                error instanceof Error ? error.message : String(error)
              }`
            );
          }
        } else {
          options.data = args.value;
        }

        options.headers['Content-Type'] = 'application/json';
      }

      const response = await apiContext.post(args.url, options as any);

      let responseText: string;
      try {
        responseText = await response.text();
      } catch {
        responseText = 'Unable to get response text';
      }

      return createSuccessResponse([
        `POST request to ${args.url}`,
        `Status: ${response.status()} ${response.statusText()}`,
        `Response: ${responseText.substring(0, 1000)}${
          responseText.length > 1000 ? '...' : ''
        }`
      ]);
    });
  }
}


/**
 * Tool for making PUT requests
 */
export class PutRequestTool extends ApiToolBase {
  /**
   * Execute the PUT request tool
   */
  async execute(args: any, context: ToolContext): Promise<ToolResponse> {
    return this.safeExecute(context, async (apiContext) => {
      // Check if the value is valid JSON if it starts with { or [
      if (args.value && typeof args.value === 'string' && 
        (args.value.startsWith('{') || args.value.startsWith('['))) {
        try {
          JSON.parse(args.value);
        } 
        catch (error) {
          return createErrorResponse(
            `Failed to parse request body: ${(error as Error).message}`
          );
        }
      }

      const response = await apiContext.put(args.url, {
        data: args.value,
        headers: {
          'Content-Type': 'application/json',
          ...(args.token ? { Authorization: `Bearer ${args.token}` } : {}),
          ...(args.headers || {})
        }
      });

      let responseText: string;
      try {
        responseText = await response.text();
      } catch {
        responseText = 'Unable to get response text';
      }

      return createSuccessResponse([
        `PUT request to ${args.url}`,
        `Status: ${response.status()} ${response.statusText()}`,
        `Response: ${responseText.substring(0, 1000)}${responseText.length > 1000 ? '...' : ''
        }`
      ]);
    });
  }
}


/**
 * Tool for making PATCH requests
 */
export class PatchRequestTool extends ApiToolBase {
  /**
   * Execute the PATCH request tool
   */
  async execute(args: any, context: ToolContext): Promise<ToolResponse> {
    return this.safeExecute(context, async (apiContext) => {
      // Check if the value is valid JSON if it starts with { or [
      if (
        args.value &&
        typeof args.value === 'string' &&
        (args.value.startsWith('{') || args.value.startsWith('['))
      ) {
        try {
          JSON.parse(args.value);
        } catch (error) {
          return createErrorResponse(
            `Failed to parse request body: ${(error as Error).message}`
          );
        }
      }

      const response = await apiContext.patch(args.url, {
        data: args.value,
        headers: {
          'Content-Type': 'application/json',
          ...(args.token ? { Authorization: `Bearer ${args.token}` } : {}),
          ...(args.headers || {})
        }
      });

      let responseText: string;
      try {
        responseText = await response.text();
      } catch (error){
        responseText = 'Unable to get response text';
      }

      return createSuccessResponse([
        `PATCH request to ${args.url}`,
        `Status: ${response.status()} ${response.statusText()}`,
        `Response: ${responseText.substring(0, 1000)}${
          responseText.length > 1000 ? '...' : ''
        }`
      ]);
    });
  }
}


/**
 * Tool for making DELETE requests
 */
export class DeleteRequestTool extends ApiToolBase {
  /**
   * Execute the DELETE request tool
   */
  async execute(args: any, context: ToolContext): Promise<ToolResponse> {
    return this.safeExecute(context, async (apiContext) => {
      const response = await apiContext.delete(args.url, {
        headers: {
          ...(args.token ? { Authorization: `Bearer ${args.token}` } : {}),
          ...(args.headers || {})
        }
      });      
      
      let responseText: string;
      try {
        responseText = await response.text();
      } catch (error) {
        responseText = "Unable to get response text";
      }
      
      return createSuccessResponse([
        `DELETE request to ${args.url}`,
        `Status: ${response.status()} ${response.statusText()}`,
        `Response: ${responseText.substring(0, 1000)}${responseText.length > 1000 ? '...' : ''}`
      ]);
    });
  }
} 