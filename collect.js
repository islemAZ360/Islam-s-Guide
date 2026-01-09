import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// إعدادات البيئة
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- إعدادات السكريبت ---
const OUTPUT_FILE = 'project_full_code.txt';
const ROOT_DIR = process.cwd(); // المجلد الحالي

// المجلدات والملفات التي سيتم تجاهلها تماماً
const IGNORE_LIST = new Set([
    'node_modules',
    '.git',
    '.idea',
    '.vscode',
    '.next',
    'dist',
    'build',
    'coverage',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '.DS_Store',
    'Thumbs.db',
    OUTPUT_FILE, // تجاهل ملف الخرج
    path.basename(__filename) // تجاهل السكريبت نفسه
]);

// الامتدادات التي تعتبر ملفات ثنائية (غير نصية) ولا يجب قراءتها
const BINARY_EXTENSIONS = new Set([
    // الصور
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp', '.bmp', '.tiff',
    // الصوت والفيديو
    '.mp3', '.mp4', '.wav', '.avi', '.mov', '.mkv',
    // المستندات والخطوط
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', 
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    // المضغوطة والتنفيذية
    '.zip', '.rar', '.7z', '.tar', '.gz', '.exe', '.bin', '.dll', '.so',
    // ملفات قاعدة البيانات
    '.sqlite', '.db'
]);

// --- دوال مساعدة ---

/**
 * التحقق مما إذا كان المسار يجب تجاهله
 */
function shouldIgnore(itemName) {
    return IGNORE_LIST.has(itemName);
}

/**
 * التحقق مما إذا كان الملف نصياً بناءً على الامتداد
 */
function isTextFile(filepath) {
    const ext = path.extname(filepath).toLowerCase();
    return !BINARY_EXTENSIONS.has(ext);
}

/**
 * الحصول على قائمة الملفات والمجلدات مرتبة أبجدياً
 * (المجلدات أولاً ثم الملفات، أو أبجدياً بالكامل حسب الرغبة)
 */
function getSortedItems(dir) {
    try {
        const items = fs.readdirSync(dir);
        return items
            .filter(item => !shouldIgnore(item))
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    } catch (e) {
        return [];
    }
}

// --- الدالة الأولى: رسم شجرة المشروع ---
function generateTree(dir, prefix = '') {
    let output = '';
    const items = getSortedItems(dir);

    items.forEach((item, index) => {
        const fullPath = path.join(dir, item);
        const isLast = index === items.length - 1;
        let stat;

        try {
            stat = fs.statSync(fullPath);
        } catch (e) { return; }

        const marker = isLast ? '└── ' : '├── ';
        output += `${prefix}${marker}${item}\n`;

        if (stat.isDirectory()) {
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            output += generateTree(fullPath, newPrefix);
        }
    });
    return output;
}

// --- الدالة الثانية: جمع المحتوى ---
function collectContent(dir, rootDir) {
    let output = '';
    const items = getSortedItems(dir);

    items.forEach(item => {
        const fullPath = path.join(dir, item);
        let stat;

        try {
            stat = fs.statSync(fullPath);
        } catch (e) { return; }

        if (stat.isDirectory()) {
            output += collectContent(fullPath, rootDir);
        } else if (stat.isFile() && isTextFile(fullPath)) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                // حساب المسار النسبي ليكون الشكل جميلاً
                const relativePath = path.relative(rootDir, fullPath);
                
                output += '\n' + '='.repeat(60) + '\n';
                output += `FILE: ${relativePath}\n`;
                output += '='.repeat(60) + '\n';
                output += content + '\n';
            } catch (err) {
                console.error(`Error reading ${fullPath}: ${err.message}`);
            }
        }
    });
    return output;
}

// --- التنفيذ الرئيسي ---

(function main() {
    console.log('🚀 Starting project collection...');
    
    const startTime = Date.now();

    // 1. توليد الشجرة
    console.log('🌳 Generating directory tree...');
    const treeStructure = generateTree(ROOT_DIR);

    // 2. جمع المحتوى
    console.log('📄 Collecting file contents...');
    const fileContents = collectContent(ROOT_DIR, ROOT_DIR);

    // 3. تجميع المخرجات النهائية
    const finalOutput = 
`--- START OF FILE ${OUTPUT_FILE} ---

PROJECT STRUCTURE:
==================

.
${treeStructure}

FILE CONTENTS:
==============
${fileContents}
--- END OF FILE ---
`;

    // 4. الحفظ
    try {
        fs.writeFileSync(OUTPUT_FILE, finalOutput);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n✅ Success! All project files collected into: ${OUTPUT_FILE}`);
        console.log(`⏱️  Time taken: ${duration}s`);
    } catch (err) {
        console.error('❌ Error writing output file:', err);
    }
})();