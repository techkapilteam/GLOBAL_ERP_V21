const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const dirToWalk = path.join('d:', 'Angular Projects', 'OneSphere_Version21_APR18', 'GLOBAL_ERP_V21', 'src', 'app');

walkDir(dirToWalk, (filePath) => {
  if (filePath.endsWith('.html')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('bsDatepicker')) {
      // Replace input with bsDatepicker with p-datepicker
      // This regex tries to match the input tag that contains bsDatepicker
      const regex = /<input[^>]*?bsDatepicker[^>]*?>/g;
      const newContent = content.replace(regex, (match) => {
        let formControlNameMatch = match.match(/formControlName="([^"]*)"/);
        let ngModelMatch = match.match(/\[\(ngModel\)\]="([^"]*)"/);
        let maxDateMatch = match.match(/\[maxDate\]="([^"]*)"/);
        let minDateMatch = match.match(/\[minDate\]="([^"]*)"/);
        let classMatch = match.match(/class="([^"]*)"/);
        let idMatch = match.match(/id="([^"]*)"/);
        let placeholderMatch = match.match(/placeholder="([^"]*)"/);
        let disabledMatch = match.match(/\[disabled\]="([^"]*)"/);
        
        let out = `<p-datepicker `;
        if (formControlNameMatch) out += `formControlName="${formControlNameMatch[1]}" `;
        if (ngModelMatch) out += `[(ngModel)]="${ngModelMatch[1]}" `;
        if (maxDateMatch) out += `[maxDate]="${maxDateMatch[1]}" `;
        if (minDateMatch) out += `[minDate]="${minDateMatch[1]}" `;
        if (idMatch) out += `id="${idMatch[1]}" `;
        
        // Handling placeholders
        let placeholder = "DD-MMM-YYYY";
        if (placeholderMatch && placeholderMatch[1]) placeholder = placeholderMatch[1];
        if (placeholder === 'MM/YYYY') {
            out += `view="month" dateFormat="mm/yy" `;
        } else {
            out += `dateFormat="dd-M-yy" `;
        }
        
        out += `placeholder="${placeholder}" [readonlyInput]="true" appendTo="body" styleClass="w-100" `;
        
        let cls = classMatch ? classMatch[1] : "erp-input w-100";
        if (!cls.includes('w-100')) cls += " w-100";
        out += `inputStyleClass="${cls}"`;
        
        if (disabledMatch) out += ` [disabled]="${disabledMatch[1]}"`;
        
        out += `></p-datepicker>`;
        return out;
      });
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated HTML: ${filePath}`);
    }
  } else if (filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('BsDatepickerModule') || content.includes('ngx-bootstrap/datepicker')) {
      // Remove imports
      content = content.replace(/import\s*\{[^}]*BsDatepicker[^}]*\}\s*from\s*['"]ngx-bootstrap\/datepicker['"];?/g, '');
      
      // Add DatePickerModule import if not present
      if (!content.includes("DatePickerModule") && !content.includes("primeng/datepicker")) {
          // find last import to append
          const lastImportIndex = content.lastIndexOf('import ');
          const endOfLastImport = content.indexOf(';', lastImportIndex) + 1;
          content = content.slice(0, endOfLastImport) + "\nimport { DatePickerModule } from 'primeng/datepicker';" + content.slice(endOfLastImport);
      }
      
      // Replace BsDatepickerModule in imports array
      content = content.replace(/BsDatepickerModule/g, 'DatePickerModule');
      
      // We don't remove dpConfig completely via regex since it's risky, but we can leave them as unused variables.
      // Wait, we can replace types like BsDatepickerConfig with any to prevent TS errors if they are still used.
      content = content.replace(/Partial<BsDatepickerConfig>/g, 'any');
      content = content.replace(/BsDatepickerConfig/g, 'any');
      content = content.replace(/BsDatepickerViewMode/g, 'any');

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated TS: ${filePath}`);
    }
  }
});
console.log("Migration complete.");
