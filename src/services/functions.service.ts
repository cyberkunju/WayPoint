import { functions } from '@/lib/appwrite';
import { type Models } from 'appwrite';

/**
 * Functions Service
 * Handles serverless function executions with Appwrite Functions
 */
export class FunctionsService {
  /**
   * Execute a function
   */
  async executeFunction(
    functionId: string,
    body?: string,
    async_?: boolean,
    path?: string,
    method?: string,
    headers?: Record<string, string>
  ): Promise<Models.Execution> {
    try {
      return await functions.createExecution(
        functionId,
        body,
        async_,
        path,
        method as any,
        headers
      );
    } catch (error) {
      console.error(`Execute function error for ${functionId}:`, error);
      throw error;
    }
  }

  /**
   * Get function execution details
   */
  async getExecution(functionId: string, executionId: string): Promise<Models.Execution> {
    try {
      return await functions.getExecution(functionId, executionId);
    } catch (error) {
      console.error(`Get execution error for ${functionId}:`, error);
      throw error;
    }
  }

  /**
   * List function executions
   */
  async listExecutions(functionId: string, queries?: string[]): Promise<Models.ExecutionList> {
    try {
      return await functions.listExecutions(functionId, queries);
    } catch (error) {
      console.error(`List executions error for ${functionId}:`, error);
      throw error;
    }
  }

  /**
   * Execute function and wait for result (synchronous)
   */
  async executeFunctionSync<T = unknown>(
    functionId: string,
    body?: string,
    path?: string,
    method?: string,
    headers?: Record<string, string>
  ): Promise<T> {
    try {
      const execution = await this.executeFunction(
        functionId,
        body,
        false, // async = false for synchronous execution
        path,
        method,
        headers
      );

      if (execution.status === 'failed') {
        throw new Error(execution.responseBody || 'Function execution failed');
      }

      return JSON.parse(execution.responseBody) as T;
    } catch (error) {
      console.error(`Execute function sync error for ${functionId}:`, error);
      throw error;
    }
  }

  /**
   * Execute function asynchronously (fire and forget)
   */
  async executeFunctionAsync(
    functionId: string,
    body?: string,
    path?: string,
    method?: string,
    headers?: Record<string, string>
  ): Promise<Models.Execution> {
    try {
      return await this.executeFunction(
        functionId,
        body,
        true, // async = true for asynchronous execution
        path,
        method,
        headers
      );
    } catch (error) {
      console.error(`Execute function async error for ${functionId}:`, error);
      throw error;
    }
  }

  /**
   * Poll execution status until completion
   */
  async pollExecution(
    functionId: string,
    executionId: string,
    maxAttempts: number = 30,
    intervalMs: number = 1000
  ): Promise<Models.Execution> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const execution = await this.getExecution(functionId, executionId);

        if (execution.status === 'completed' || execution.status === 'failed') {
          return execution;
        }

        await new Promise((resolve) => setTimeout(resolve, intervalMs));
        attempts++;
      } catch (error) {
        console.error(`Poll execution error for ${functionId}:`, error);
        throw error;
      }
    }

    throw new Error(`Execution polling timeout after ${maxAttempts} attempts`);
  }

  /**
   * Execute function with retry logic
   */
  async executeFunctionWithRetry<T = unknown>(
    functionId: string,
    body?: string,
    maxRetries: number = 3,
    retryDelayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeFunctionSync<T>(functionId, body);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Function execution attempt ${attempt + 1} failed:`, error);

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('Function execution failed after retries');
  }
}

// Export singleton instance
export const functionsService = new FunctionsService();
