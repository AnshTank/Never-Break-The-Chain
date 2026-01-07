const fs = require('fs');
const path = require('path');

// Directories to search for console statements
const searchDirs = [
  path.join(__dirname, '..', 'components'),
  path.join(__dirname, '..', 'app', 'api'),
  path.join(__dirname, '..', 'hooks'),
  path.join(__dirname, '..', 'lib')
];

// File extensions to process
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// Console methods to comment out
const consoleMethods = ['log', 'error', 'warn', 'info', 'debug'];

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return extensions.includes(ext) && !filePath.includes('node_modules');
}

function commentConsoleStatements(content) {
  let modified = false;
  let lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Skip already commented lines
    if (trimmedLine.startsWith('//')) {
      continue;
    }
    
    // Check for console statements
    for (const method of consoleMethods) {
      const consolePattern = new RegExp(`console\\.${method}\\s*\\(`, 'g');
      
      if (consolePattern.test(line) && !line.trim().startsWith('//')) {
        // Comment out the line
        const indentation = line.match(/^\s*/)[0];
        lines[i] = `${indentation}// ${line.trim()}`;
        modified = true;
        console.log(`Commented: ${line.trim()}`);
        break;
      }
    }
  }
  
  return { content: lines.join('\n'), modified };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = commentConsoleStatements(content);
    
    if (result.modified) {
      fs.writeFileSync(filePath, result.content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return 1;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function processDirectory(dirPath) {
  let filesModified = 0;
  
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return 0;
  }
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      filesModified += processDirectory(itemPath);
    } else if (stat.isFile() && shouldProcessFile(itemPath)) {
      filesModified += processFile(itemPath);
    }
  }
  
  return filesModified;
}

function main() {
  console.log('🔍 Starting console statement cleanup...\n');
  
  let totalFilesModified = 0;
  
  for (const dir of searchDirs) {
    console.log(`📁 Processing directory: ${dir}`);
    const modified = processDirectory(dir);
    totalFilesModified += modified;
    console.log(`   Modified ${modified} files in this directory\n`);
  }
  
  console.log(`🎉 Cleanup complete! Modified ${totalFilesModified} files total.`);
  
  if (totalFilesModified === 0) {
    console.log('✨ No console statements found or all were already commented.');
  }
}

main();