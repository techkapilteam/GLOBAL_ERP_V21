const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const dirToWalk = path.join('d:', 'Angular Projects', 'OneSphere_Version21_APR18', 'GLOBAL_ERP_V21', 'src', 'app', 'features', 'accounts');

walkDir(dirToWalk, (filePath) => {
  if (filePath.endsWith('.ts')) {
    let tsContent = fs.readFileSync(filePath, 'utf8');
    
    // Check if the component previously defined a maxDate in a config object
    // Or if it just has `maxDate: new Date()` etc.
    let hasMaxDate = tsContent.match(/maxDate\s*:\s*(new Date\(\)|this\.today|today|event|date)/);
    
    if (hasMaxDate) {
        // Find corresponding .html file
        let htmlPath = filePath.replace('.ts', '.html');
        if (fs.existsSync(htmlPath)) {
            let htmlContent = fs.readFileSync(htmlPath, 'utf8');
            let htmlModified = false;
            
            // Inject a generic maxDate property into the class if it doesn't exist
            if (!tsContent.includes('pDatepickerMaxDate')) {
                // Find class declaration and inject inside
                const classRegex = /export\s+class\s+\w+\s*(implements\s+[^\{]+)?\s*\{/;
                tsContent = tsContent.replace(classRegex, (match) => {
                    return match + "\n  pDatepickerMaxDate: Date = new Date();\n";
                });
                fs.writeFileSync(filePath, tsContent, 'utf8');
                console.log(`Injected pDatepickerMaxDate to ${filePath}`);
            }

            // Add [maxDate]="pDatepickerMaxDate" to p-datepicker without [maxDate]
            const datepickerRegex = /<p-datepicker([^>]*)>/g;
            htmlContent = htmlContent.replace(datepickerRegex, (match, p1) => {
                if (!p1.includes('[maxDate]')) {
                    htmlModified = true;
                    return `<p-datepicker ${p1.trim()} [maxDate]="pDatepickerMaxDate">`;
                }
                return match;
            });
            
            if (htmlModified) {
                fs.writeFileSync(htmlPath, htmlContent, 'utf8');
                console.log(`Added [maxDate] to HTML: ${htmlPath}`);
            }
        }
    }
  }
});
console.log("MaxDate restoration complete.");
