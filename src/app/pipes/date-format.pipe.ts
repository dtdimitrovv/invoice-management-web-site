import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: number[] | string): string {
    if (!value) return '';
    
    try {
      let date: Date;
      
      if (Array.isArray(value)) {
        // Handle array format [year, month, day] where month is 0-based
        const [year, month, day] = value;
        date = new Date(year, month - 1, day); // month - 1 because Date constructor expects 0-based month
      } else {
        // Handle string format
        date = new Date(value);
      }
      
      if (isNaN(date.getTime())) return Array.isArray(value) ? value.join('-') : value;
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
    } catch (error) {
      return Array.isArray(value) ? value.join('-') : value;
    }
  }
}
