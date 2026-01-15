import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseConfig } from '../config/database.config';
import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';
import { HashUtil } from '../common/utils/hash.util';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private db: Database.Database | null = null;

  constructor() {}

  async onModuleInit() {
    // Ensure database is created when module initializes
    await this.initDatabase();
  }

  private async initDatabase() {
    try {
      // Ensure the database file exists
      const dbPath = path.resolve(process.cwd(), DatabaseConfig.database);
      
      // Create directory if it doesn't exist
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      // Create database file if it doesn't exist
      if (!fs.existsSync(dbPath)) {
        fs.closeSync(fs.openSync(dbPath, 'w'));
        console.log(`Database file created at: ${dbPath}`);
      }
      
      // Connect to the database
      this.db = new Database(dbPath, { verbose: console.log });
      
      // Enable foreign key constraints
      this.db.exec('PRAGMA foreign_keys = ON;');
      
      // Execute initialization script
      const initScriptPath = path.resolve(process.cwd(), 'sql', 'init.sql');
      const seedScriptPath = path.resolve(process.cwd(), 'sql', 'seed.sql');
      if (fs.existsSync(initScriptPath)) {
        const initScript = fs.readFileSync(initScriptPath, 'utf8');

        // Remove line comments and normalize whitespace
        const cleaned = initScript
          .replace(/--.*$/gm, ' ')          // remove SQL single-line comments
          .replace(/\r?\n/g, ' ')           // replace newlines with space
          .replace(/\s+/g, ' ')             // collapse multiple spaces
          .trim();

        const statements = cleaned
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        console.log(`Executing ${statements.length} SQL statements`);

        let successCount = 0;
        for (const statement of statements) {
          try {
            this.db.exec(statement);
            successCount++;
          } catch (stmtError) {
            console.warn('Warning: Could not execute statement:', statement.substring(0, 200), stmtError.message);
          }
        }

        console.log(`Successfully executed ${successCount}/${statements.length} SQL statements`);
        console.log('Database schema initialized successfully');
      }
      
      // Run migrations
      await this.runMigrations();
      
      // Seed the database with initial data
      await this.seedDatabase(seedScriptPath);
      
      console.log('Database initialized successfully');
      console.log('Database path:', dbPath);
      console.log('initScriptPath exists:', fs.existsSync(initScriptPath));
      console.log('seedScriptPath exists:', fs.existsSync(seedScriptPath));
      try {
        const tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        console.log('Existing tables after init:', tables);
      } catch (e) {
        console.error('Error listing tables:', e);
      }
      console.log('Database config:', DatabaseConfig);
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  private async runMigrations() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      // Create migrations table if it doesn't exist
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(255) NOT NULL,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Get list of executed migrations
      const executedMigrations = this.db.prepare('SELECT name FROM migrations ORDER BY id').all() as { name: string }[];
      const executedMigrationNames = executedMigrations.map(m => m.name);
      
      // Get migration files
      const migrationsDir = path.resolve(process.cwd(), 'sql', 'migrations');
      if (!fs.existsSync(migrationsDir)) {
        console.log('Migrations directory does not exist, skipping migrations');
        return;
      }
      
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      console.log(`Found ${migrationFiles.length} migration files`);
      
      // Execute pending migrations
      for (const migrationFile of migrationFiles) {
        if (!executedMigrationNames.includes(migrationFile)) {
          console.log(`Executing migration: ${migrationFile}`);
          
          try {
            const migrationPath = path.resolve(migrationsDir, migrationFile);
            const migrationScript = fs.readFileSync(migrationPath, 'utf8');
            
            // Remove line comments and normalize whitespace
            const cleaned = migrationScript
              .replace(/--.*$/gm, ' ')          // remove SQL single-line comments
              .replace(/\r?\n/g, ' ')           // replace newlines with space
              .replace(/\s+/g, ' ')             // collapse multiple spaces
              .trim();
            
            const statements = cleaned
              .split(';')
              .map(s => s.trim())
              .filter(s => s.length > 0);
            
            console.log(`Executing ${statements.length} statements from ${migrationFile}`);
            
            // Execute migration statements
            for (const statement of statements) {
              if (statement.trim()) {
                this.db.exec(statement);
              }
            }
            
            // Record migration as executed
            this.db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migrationFile);
            
            console.log(`Migration ${migrationFile} executed successfully`);
          } catch (error) {
            console.error(`Error executing migration ${migrationFile}:`, error);
            throw error;
          }
        } else {
          console.log(`Migration ${migrationFile} already executed, skipping`);
        }
      }
      
      console.log('All migrations completed');
    } catch (error) {
      console.error('Error running migrations:', error);
      throw error;
    }
  }

  private async seedDatabase(seedScriptPath: string) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      // Wait a moment to ensure tables are created
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if we already have data to avoid duplicate seeding
      const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
      
      if (userCount.count === 0) {
        // Execute seed script if it exists
        if (fs.existsSync(seedScriptPath)) {
          const seedScript = fs.readFileSync(seedScriptPath, 'utf8');

          // Remove line comments and normalize whitespace
          const cleaned = seedScript
            .replace(/--.*$/gm, ' ')          // remove SQL single-line comments
            .replace(/\r?\n/g, ' ')           // replace newlines with space
            .replace(/\s+/g, ' ')             // collapse multiple spaces
            .trim();

          const statements = cleaned
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

          console.log(`Executing ${statements.length} seed SQL statements`);

          let successCount = 0;
          for (const statement of statements) {
            try {
              this.db.exec(statement);
              successCount++;
            } catch (stmtError) {
              console.warn('Warning: Could not execute seed statement:', statement.substring(0, 200), stmtError.message);
            }
          }

          console.log(`Successfully executed ${successCount}/${statements.length} seed SQL statements`);
          console.log('Database seed data inserted successfully');
        }
        
        // Create admin user if it doesn't exist
        try {
          const adminEmail = 'admin@origintechnologies.com';
          const adminExists = this.db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
          
          if (!adminExists) {
            // Hash the password
            const hashedPassword = await HashUtil.hashPassword('admin123');
            
            // Insert admin user
            const insertAdmin = this.db.prepare(`
              INSERT INTO users (email, password, role, first_name, last_name)
              VALUES (?, ?, ?, ?, ?)
            `);
            
            const result = insertAdmin.run(
              adminEmail,
              hashedPassword,
              'admin',
              'Admin',
              'User'
            );
            
            console.log(`Admin user created with ID: ${result.lastInsertRowid}`);
          } else {
            console.log('Admin user already exists');
          }
        } catch (adminError) {
          console.error('Error creating admin user:', adminError);
        }
      } else {
        console.log('Database already seeded, skipping...');
      }
      
      // Seed notifications for all users
      await this.seedNotifications();
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }
  
  private async seedNotifications() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      // Check if we already have notifications
      const notificationCount = this.db.prepare('SELECT COUNT(*) as count FROM notifications').get() as { count: number };
      
      if (notificationCount.count === 0) {
        console.log('Seeding notifications...');
        
        // Create 10 notifications for users 1-4
        const notifications = [
          // User 1 (Admin) - 3 notifications (1 unread)
          { user_id: 1, title: 'Welcome to Origin Technologies', message: 'Welcome to our platform! We\'re excited to have you on board.', type: 'welcome', is_read: 1 },
          { user_id: 1, title: 'System Update', message: 'We\'ve deployed a major system update. Please review the changes.', type: 'alert', is_read: 1 },
          { user_id: 1, title: 'Security Notice', message: 'Please review your security settings to ensure your account is protected.', type: 'alert', is_read: 0 },
          
          // User 2 - 3 notifications (2 unread)
          { user_id: 2, title: 'Project Assigned', message: 'You have been assigned to a new project. Please review the details.', type: 'project_update', is_read: 1 },
          { user_id: 2, title: 'Document Review Required', message: 'Please review the project documentation and provide feedback.', type: 'project_update', is_read: 0 },
          { user_id: 2, title: 'Meeting Scheduled', message: 'A meeting has been scheduled for tomorrow at 10:00 AM.', type: 'reminder', is_read: 0 },
          
          // User 3 - 2 notifications (1 unread)
          { user_id: 3, title: 'Account Setup Complete', message: 'Your account setup is complete. You can now access all features.', type: 'welcome', is_read: 1 },
          { user_id: 3, title: 'Payment Received', message: 'We\'ve received your payment. Thank you for your business!', type: 'alert', is_read: 0 },
          
          // User 4 - 2 notifications (all unread)
          { user_id: 4, title: 'New Feature Available', message: 'Check out our new dashboard feature for better insights.', type: 'alert', is_read: 0 },
          { user_id: 4, title: 'Profile Update Required', message: 'Please update your profile information to ensure we can contact you.', type: 'reminder', is_read: 0 },
        ];
        
        const insertNotification = this.db.prepare(`
          INSERT INTO notifications (user_id, title, message, type, is_read)
          VALUES (?, ?, ?, ?, ?)
        `);
        
        for (const notification of notifications) {
          try {
            insertNotification.run(
              notification.user_id,
              notification.title,
              notification.message,
              notification.type,
              notification.is_read
            );
          } catch (error) {
            console.error('Error inserting notification:', error);
          }
        }
        
        console.log(`Inserted ${notifications.length} notifications`);
      } else {
        console.log('Notifications already seeded, skipping...');
      }
    } catch (error) {
      console.error('Error seeding notifications:', error);
    }
  }

  async findUserById(id: number) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      console.log(`Finding user with ID: ${id}`, user);
      return user;
    } catch (error) {
      console.error(`Error finding user with ID ${id}:`, error);
      return null;
    }
  }

  async createUser(userData: any) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      console.log('Creating user:', userData);
      
      const insertUser = this.db.prepare(`
        INSERT INTO users (email, password, role, first_name, last_name, phone, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = insertUser.run(
        userData.email,
        userData.password,
        userData.role || 'client',
        userData.firstName || userData.first_name,
        userData.lastName || userData.last_name,
        userData.phone,
        userData.is_verified || 0
      );
      
      // Return the created user
      const createdUser = this.db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
      console.log('User created successfully:', createdUser);
      return createdUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async findUserByEmail(email: string) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const user = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      console.log(`Finding user with email: ${email}`, user);
      return user;
    } catch (error) {
      console.error(`Error finding user with email ${email}:`, error);
      return null;
    }
  }

  // Add method to store OTP for a user
  async saveUserOTP(email: string, otp: string, expiresAt: Date) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      // First, check if an OTP record already exists for this user
      const existingRecord = this.db.prepare('SELECT id FROM user_otps WHERE email = ?').get(email);
      
      if (existingRecord) {
        // Update existing record
        const updateStmt = this.db.prepare(`
          UPDATE user_otps 
          SET otp = ?, expires_at = ?, attempts = 0 
          WHERE email = ?
        `);
        updateStmt.run(otp, expiresAt.toISOString(), email);
      } else {
        // Insert new record
        const insertStmt = this.db.prepare(`
          INSERT INTO user_otps (email, otp, expires_at, attempts)
          VALUES (?, ?, ?, ?)
        `);
        insertStmt.run(email, otp, expiresAt.toISOString(), 0);
      }
      
      console.log(`OTP saved for user ${email}`);
      return true;
    } catch (error) {
      console.error(`Error saving OTP for user ${email}:`, error);
      throw error;
    }
  }

  // Add method to verify OTP
  async verifyUserOTP(email: string, otp: string) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const record = this.db.prepare(`
        SELECT * FROM user_otps 
        WHERE email = ? AND otp = ? AND expires_at > datetime('now')
      `).get(email, otp);
      
      if (record) {
        // Delete the OTP record after successful verification
        this.db.prepare('DELETE FROM user_otps WHERE email = ? AND otp = ?').run(email, otp);
        
        // Update user as verified
        this.db.prepare('UPDATE users SET is_verified = 1 WHERE email = ?').run(email);
        
        console.log(`OTP verified for user ${email}`);
        return true;
      }
      
      console.log(`Invalid or expired OTP for user ${email}`);
      return false;
    } catch (error) {
      console.error(`Error verifying OTP for user ${email}:`, error);
      throw error;
    }
  }

  // Add method to update user password
  async updateUserPassword(email: string, hashedPassword: string) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const updateStmt = this.db.prepare(`
        UPDATE users 
        SET password = ?, updated_at = datetime('now')
        WHERE email = ?
      `);
      
      const result = updateStmt.run(hashedPassword, email);
      
      if (result.changes > 0) {
        console.log(`Password updated for user ${email}`);
        return true;
      }
      
      console.log(`No user found with email ${email} for password update`);
      return false;
    } catch (error) {
      console.error(`Error updating password for user ${email}:`, error);
      throw error;
    }
  }

  // Add method to update user details (excluding email)
  async updateUserDetails(id: number, userData: any) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      // Build dynamic update query
      const fields: string[] = [];
      const values: any[] = [];
      
      // Only allow updating specific fields (exclude email)
      if (userData.firstName !== undefined) {
        fields.push('first_name = ?');
        values.push(userData.firstName);
      }
      
      if (userData.lastName !== undefined) {
        fields.push('last_name = ?');
        values.push(userData.lastName);
      }
      
      if (userData.phone !== undefined) {
        fields.push('phone = ?');
        values.push(userData.phone);
      }
      
      if (userData.role !== undefined) {
        fields.push('role = ?');
        values.push(userData.role);
      }
      
      // Always update the updated_at timestamp
      fields.push('updated_at = datetime(\'now\')');
      
      if (fields.length === 1) {
        // Only timestamp would be updated
        const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        return user;
      }

      values.push(id); // For the WHERE clause

      const updateQuery = `
        UPDATE users 
        SET ${fields.join(', ')}
        WHERE id = ?
      `;

      const result = this.db.prepare(updateQuery).run(values);
      
      if (result.changes > 0) {
        // Get the updated user
        const updatedUser = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        console.log(`User details updated for user ID ${id}:`, updatedUser);
        return updatedUser;
      }
      
      console.log(`No user found with ID ${id} for update`);
      return null;
    } catch (error) {
      console.error(`Error updating user details for user ID ${id}:`, error);
      throw error;
    }
  }

  // Add method to delete a user (for admin use)
  async deleteUser(id: number) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      // First check if user exists
      const existingUser = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      if (!existingUser) {
        return { message: 'User not found', deleted: false };
      }
      
      // Delete the user
      const result = this.db.prepare('DELETE FROM users WHERE id = ?').run(id);
      
      if (result.changes > 0) {
        console.log(`User deleted successfully: ID ${id}`);
        return { message: 'User deleted successfully', deleted: true };
      }
      
      return { message: 'User not found', deleted: false };
    } catch (error) {
      console.error(`Error deleting user ID ${id}:`, error);
      throw error;
    }
  }

  // Method to execute raw SQL queries
  public executeQuery(sql: string, params: any[] = []): any {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const stmt = this.db.prepare(sql);
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        return stmt.all(params);
      } else {
        const info = stmt.run(params);
        return { changes: info.changes, lastInsertRowid: info.lastInsertRowid };
      }
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }
}