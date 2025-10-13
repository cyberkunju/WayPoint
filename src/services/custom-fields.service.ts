import { databaseService, Query } from './database.service';
import { COLLECTIONS } from '@/lib/appwrite';
import { ID, type Models } from 'appwrite';

/**
 * Custom field types
 */
export type CustomFieldType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'dropdown' 
  | 'multi-select' 
  | 'checkbox' 
  | 'url' 
  | 'email' 
  | 'phone';

/**
 * Custom field definition interface
 */
export interface CustomFieldDefinition {
  userId: string;
  name: string;
  fieldType: CustomFieldType;
  description?: string;
  options?: string[]; // For dropdown and multi-select
  defaultValue?: string;
  isRequired: boolean;
  isGlobal: boolean; // If true, applies to all projects; if false, specific to projectId
  projectId?: string; // Only set if isGlobal is false
  position: number;
}

/**
 * Custom field with Appwrite metadata
 */
export type CustomField = Models.Document & CustomFieldDefinition;

/**
 * Custom field value (stored in task.customFields as JSON)
 */
export interface CustomFieldValue {
  fieldId: string;
  value: string | number | boolean | string[];
}

/**
 * Custom Fields Service
 * Handles custom field definitions and values
 */
export class CustomFieldsService {
  private readonly collectionId = COLLECTIONS.CUSTOM_FIELDS;

  /**
   * Create a custom field definition
   */
  async createCustomField(
    data: Omit<CustomFieldDefinition, 'userId'>,
    userId: string,
    permissions?: string[]
  ): Promise<CustomField> {
    try {
      const fieldData: CustomFieldDefinition = {
        userId,
        name: data.name,
        fieldType: data.fieldType,
        description: data.description,
        options: data.options,
        defaultValue: data.defaultValue,
        isRequired: data.isRequired ?? false,
        isGlobal: data.isGlobal ?? true,
        projectId: data.projectId,
        position: data.position ?? 0,
      };

      const fieldPermissions = permissions || [
        `read("user:${userId}")`,
        `update("user:${userId}")`,
        `delete("user:${userId}")`,
      ];

      return await databaseService.createDocument<Record<string, unknown>>(
        this.collectionId,
        fieldData as unknown as Record<string, unknown>,
        ID.unique(),
        fieldPermissions
      ) as unknown as CustomField;
    } catch (error) {
      console.error('Create custom field error:', error);
      throw error;
    }
  }

  /**
   * Get a custom field by ID
   */
  async getCustomField(fieldId: string): Promise<CustomField> {
    try {
      return await databaseService.getDocument<Record<string, unknown>>(
        this.collectionId,
        fieldId
      ) as unknown as CustomField;
    } catch (error) {
      console.error('Get custom field error:', error);
      throw error;
    }
  }

  /**
   * Update a custom field definition
   */
  async updateCustomField(
    fieldId: string,
    data: Partial<Omit<CustomFieldDefinition, 'userId'>>,
    permissions?: string[]
  ): Promise<CustomField> {
    try {
      return await databaseService.updateDocument<Record<string, unknown>>(
        this.collectionId,
        fieldId,
        data as unknown as Record<string, unknown>,
        permissions
      ) as unknown as CustomField;
    } catch (error) {
      console.error('Update custom field error:', error);
      throw error;
    }
  }

  /**
   * Delete a custom field definition
   */
  async deleteCustomField(fieldId: string): Promise<void> {
    try {
      await databaseService.deleteDocument(this.collectionId, fieldId);
    } catch (error) {
      console.error('Delete custom field error:', error);
      throw error;
    }
  }

  /**
   * List custom fields for a user
   */
  async listCustomFields(
    userId: string,
    projectId?: string,
    includeGlobal: boolean = true
  ): Promise<CustomField[]> {
    try {
      const queries: string[] = [Query.equal('userId', userId)];

      if (projectId) {
        // Get fields specific to this project
        queries.push(Query.equal('projectId', projectId));
        
        if (includeGlobal) {
          // Also include global fields - we'll need to make two queries
          const projectFields = await databaseService.listDocuments<Record<string, unknown>>(
            this.collectionId,
            queries
          );

          const globalQueries = [
            Query.equal('userId', userId),
            Query.equal('isGlobal', true)
          ];
          const globalFields = await databaseService.listDocuments<Record<string, unknown>>(
            this.collectionId,
            globalQueries
          );

          return [
            ...globalFields.documents as unknown as CustomField[],
            ...projectFields.documents as unknown as CustomField[]
          ].sort((a, b) => a.position - b.position);
        }
      } else if (includeGlobal) {
        // Get only global fields
        queries.push(Query.equal('isGlobal', true));
      }

      queries.push(Query.orderAsc('position'));

      const result = await databaseService.listDocuments<Record<string, unknown>>(
        this.collectionId,
        queries
      );

      return result.documents as unknown as CustomField[];
    } catch (error) {
      console.error('List custom fields error:', error);
      throw error;
    }
  }

  /**
   * Get custom fields for a specific project (including global fields)
   */
  async getFieldsForProject(userId: string, projectId: string): Promise<CustomField[]> {
    return this.listCustomFields(userId, projectId, true);
  }

  /**
   * Get only global custom fields
   */
  async getGlobalFields(userId: string): Promise<CustomField[]> {
    return this.listCustomFields(userId, undefined, true);
  }

  /**
   * Parse custom field values from task.customFields JSON string
   */
  parseCustomFieldValues(customFieldsJson?: string): CustomFieldValue[] {
    if (!customFieldsJson) {
      return [];
    }

    try {
      const parsed = JSON.parse(customFieldsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Parse custom field values error:', error);
      return [];
    }
  }

  /**
   * Serialize custom field values to JSON string for task.customFields
   */
  serializeCustomFieldValues(values: CustomFieldValue[]): string {
    return JSON.stringify(values);
  }

  /**
   * Get a specific field value from task's custom fields
   */
  getFieldValue(customFieldsJson: string | undefined, fieldId: string): CustomFieldValue | undefined {
    const values = this.parseCustomFieldValues(customFieldsJson);
    return values.find(v => v.fieldId === fieldId);
  }

  /**
   * Set a field value in task's custom fields
   */
  setFieldValue(
    customFieldsJson: string | undefined,
    fieldId: string,
    value: string | number | boolean | string[]
  ): string {
    const values = this.parseCustomFieldValues(customFieldsJson);
    const existingIndex = values.findIndex(v => v.fieldId === fieldId);

    if (existingIndex >= 0) {
      values[existingIndex].value = value;
    } else {
      values.push({ fieldId, value });
    }

    return this.serializeCustomFieldValues(values);
  }

  /**
   * Remove a field value from task's custom fields
   */
  removeFieldValue(customFieldsJson: string | undefined, fieldId: string): string {
    const values = this.parseCustomFieldValues(customFieldsJson);
    const filtered = values.filter(v => v.fieldId !== fieldId);
    return this.serializeCustomFieldValues(filtered);
  }

  /**
   * Validate a field value against its definition
   */
  validateFieldValue(field: CustomField, value: unknown): { valid: boolean; error?: string } {
    // Required field check
    if (field.isRequired && (value === undefined || value === null || value === '')) {
      return { valid: false, error: `${field.name} is required` };
    }

    // Type-specific validation
    switch (field.fieldType) {
      case 'number':
        if (value !== undefined && value !== null && value !== '' && isNaN(Number(value))) {
          return { valid: false, error: `${field.name} must be a number` };
        }
        break;

      case 'email':
        if (value && typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return { valid: false, error: `${field.name} must be a valid email` };
          }
        }
        break;

      case 'url':
        if (value && typeof value === 'string') {
          try {
            new URL(value);
          } catch {
            return { valid: false, error: `${field.name} must be a valid URL` };
          }
        }
        break;

      case 'phone':
        if (value && typeof value === 'string') {
          const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
          if (!phoneRegex.test(value)) {
            return { valid: false, error: `${field.name} must be a valid phone number` };
          }
        }
        break;

      case 'dropdown':
        if (value && field.options && !field.options.includes(String(value))) {
          return { valid: false, error: `${field.name} must be one of: ${field.options.join(', ')}` };
        }
        break;

      case 'multi-select':
        if (value && Array.isArray(value) && field.options) {
          const invalidOptions = value.filter(v => !field.options!.includes(String(v)));
          if (invalidOptions.length > 0) {
            return { valid: false, error: `Invalid options for ${field.name}: ${invalidOptions.join(', ')}` };
          }
        }
        break;
    }

    return { valid: true };
  }

  /**
   * Validate all field values for a task
   */
  validateAllFieldValues(
    fields: CustomField[],
    customFieldsJson: string | undefined
  ): { valid: boolean; errors: string[] } {
    const values = this.parseCustomFieldValues(customFieldsJson);
    const errors: string[] = [];

    for (const field of fields) {
      const fieldValue = values.find(v => v.fieldId === field.$id);
      const validation = this.validateFieldValue(field, fieldValue?.value);
      
      if (!validation.valid && validation.error) {
        errors.push(validation.error);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Reorder custom fields
   */
  async reorderFields(fieldIds: string[], userId: string): Promise<void> {
    try {
      const updates = fieldIds.map((id, index) => ({
        id,
        data: { position: index } as Record<string, unknown>
      }));

      await databaseService.batchUpdateDocuments<Record<string, unknown>>(
        this.collectionId,
        updates
      );
    } catch (error) {
      console.error('Reorder fields error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const customFieldsService = new CustomFieldsService();
