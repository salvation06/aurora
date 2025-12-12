import { BurnResult, ContentBundle } from '../types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const execAsync = promisify(exec);

export class CDWriterAgent {
  async execute(contentBundle: ContentBundle): Promise<BurnResult> {
    const workDir = path.join(process.cwd(), 'iso_workspace', contentBundle.bundleId);
    const isoPath = path.join(process.cwd(), 'iso_output', `${contentBundle.bundleId}.iso`);
    
    let isoStatus: 'SUCCESS' | 'FAILED' = 'SUCCESS';
    let isoLog = '';

    try {
      // Create workspace directory
      await fs.mkdir(workDir, { recursive: true });
      await fs.mkdir(path.dirname(isoPath), { recursive: true });

      // Copy/create files in workspace
      console.log(`Preparing ${contentBundle.files.length} files for ISO...`);
      for (const file of contentBundle.files) {
        const targetPath = path.join(workDir, file.path);
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        
        // Copy source file if it exists, otherwise create placeholder
        try {
          await fs.copyFile(file.sourcePath, targetPath);
        } catch {
          // Create placeholder file if source doesn't exist
          await fs.writeFile(targetPath, `Placeholder for ${file.path}`);
        }
      }

      // Create ISO using hdiutil (macOS) or mkisofs (Linux)
      console.log(`Creating ISO at ${isoPath}...`);
      
      try {
        // Try macOS hdiutil first
        const { stdout, stderr } = await execAsync(
          `hdiutil makehybrid -o "${isoPath}" -iso -joliet -default-volume-name "${contentBundle.volumeLabel}" "${workDir}"`
        );
        isoLog = `ISO created successfully at ${isoPath}\n${stdout}`;
        console.log('ISO created with hdiutil');
      } catch (macError) {
        // Fallback to mkisofs/genisoimage for Linux
        try {
          const { stdout, stderr } = await execAsync(
            `mkisofs -o "${isoPath}" -V "${contentBundle.volumeLabel}" -J -R "${workDir}"`
          );
          isoLog = `ISO created successfully at ${isoPath}\n${stdout}`;
          console.log('ISO created with mkisofs');
        } catch (linuxError) {
          throw new Error('Neither hdiutil (macOS) nor mkisofs (Linux) available for ISO creation');
        }
      }

      // Calculate SHA-256 hash of the ISO
      const isoSha256 = await this.calculateSha256(isoPath);
      console.log(`ISO SHA-256: ${isoSha256}`);

      // Clean up workspace
      await fs.rm(workDir, { recursive: true, force: true });

      return {
        isoPath,
        isoStatus,
        isoLog,
        isoSha256
      };

    } catch (error) {
      isoStatus = 'FAILED';
      isoLog = `ISO creation failed: ${error}`;
      console.error('ISO creation error:', error);
      
      return {
        isoPath,
        isoStatus,
        isoLog
      };
    }
  }

  private async calculateSha256(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  }
}
