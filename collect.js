import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// محاكاة __dirname في بيئة ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// اسم الملف الناتج
const OUTPUT_FILE = 'project_full_code.txt';

// المجلدات والملفات التي سيتم تجاهلها
const IGNORE_PATTERNS = [
    'node_modules', 
    '.git', 
    'dist', 
    'build', 
    '.vscode', 
    'package-lock.json', 
    'yarn.lock',
    '.DS_Store',
    OUTPUT_FILE, // نتجاهل ملف الخرج نفسه
    'collect.js', // نتجاهل هذا السكريبت
    '.ico', '.png', '.jpg', '.jpeg', '.svg', '.gif' // نتجاهل الصور
];

// دالة لمعرفة هل الملف نصي أم لا
function isTextFile(filepath) {
    const ext = path.extname(filepath).toLowerCase();
    const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.exe', '.bin', '.woff', '.woff2', '.ttf'];
    return !binaryExts.includes(ext);
}

// دالة لرسم شجرة الملفات
function getTree(dir, prefix = '') {
    let output = '';
    let items;
    try {
        items = fs.readdirSync(dir);
    } catch (e) {
        return '';
    }
    
    // تصفية العناصر المتجاهلة
    const filteredItems = items.filter(item => !IGNORE_PATTERNS.includes(item));

    filteredItems.forEach((item, index) => {
        const fullPath = path.join(dir, item);
        const isLast = index === filteredItems.length - 1;
        let stat;
        try {
            stat = fs.statSync(fullPath);
        } catch (e) { return; }
        
        const marker = isLast ? '└── ' : '├── ';
        output += `${prefix}${marker}${item}\n`;
        
        if (stat.isDirectory()) {
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            output += getTree(fullPath, newPrefix);
        }
    });
    return output;
}

// دالة لجمع محتوى الملفات
function getFilesContent(dir) {
    let output = '';
    let items;
    try {
        items = fs.readdirSync(dir);
    } catch (e) {
        return '';
    }

    const filteredItems = items.filter(item => !IGNORE_PATTERNS.includes(item));

    filteredItems.forEach(item => {
        const fullPath = path.join(dir, item);
        let stat;
        try {
            stat = fs.statSync(fullPath);
        } catch (e) { return; }

        if (stat.isDirectory()) {
            output += getFilesContent(fullPath);
        } else if (isTextFile(fullPath)) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                output += '\n' + '='.repeat(50) + '\n';
                output += `FILE: ${fullPath}\n`;
                output += '='.repeat(50) + '\n';
                output += content + '\n';
            } catch (err) {
                console.error(`Error reading ${fullPath}: ${err.message}`);
            }
        }
    });
    return output;
}

// التنفيذ الرئيسي
console.log('Generating project tree...');
const tree = getTree('.');

console.log('Collecting file contents...');
const content = getFilesContent('.');

const finalOutput = `PROJECT STRUCTURE:\n==================\n\n.\n${tree}\n\n` + 
                    `FILE CONTENTS:\n==============\n${content}`;

try {
    fs.writeFileSync(OUTPUT_FILE, finalOutput);
    console.log(`\nDone! File created: ${OUTPUT_FILE}`);
} catch (err) {
    console.error('Error writing file:', err);
}
