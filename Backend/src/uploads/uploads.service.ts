import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadsService {
  async uploadFile(file: Express.Multer.File, fileType: string = 'general') {
    try {
      // Validate file type
      if (!this.isValidFileType(file, fileType)) {
        throw new Error('Invalid file type');
      }

      // Return file information
      return { 
        filename: file.filename, 
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/storage/${fileType}/${file.filename}`,
        path: file.path,
        uploadedAt: new Date()
      };
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      throw error;
    }
  }

  private isValidFileType(file: Express.Multer.File, fileType: string): boolean {
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      general: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    };

    const allowedMimeTypes = allowedTypes[fileType] || allowedTypes.general;
    return allowedMimeTypes.includes(file.mimetype);
  }

  static getStorageConfig(fileType: string = 'general') {
    // Ensure directories exist
    const baseDir = './uploads/storage';
    const typeDir = join(baseDir, fileType);
    
    if (!existsSync(baseDir)) {
      mkdirSync(baseDir, { recursive: true });
    }
    
    if (!existsSync(typeDir)) {
      mkdirSync(typeDir, { recursive: true });
    }

    return diskStorage({
      destination: typeDir,
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + ext;
        callback(null, filename);
      },
    });
  }

  // Specific upload methods for different entities
  async uploadProjectDocument(file: Express.Multer.File) {
    return this.uploadFile(file, 'documents');
  }

  async uploadProductImage(file: Express.Multer.File) {
    return this.uploadFile(file, 'images');
  }

  async uploadGeneralFile(file: Express.Multer.File) {
    return this.uploadFile(file, 'general');
  }
}