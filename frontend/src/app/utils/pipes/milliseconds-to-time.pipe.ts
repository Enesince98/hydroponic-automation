import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'millisecondsToTime'
})
export class MillisecondsToTimePipe implements PipeTransform {
  transform(value: number): string {
    if (value == null || isNaN(value)) return '0 minutes';
    const totalSeconds = Math.floor(value / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const hoursStr = hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''}` : '';
    const minutesStr = minutes > 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''}` : '';

    if (hoursStr && minutesStr) {
      return `${hoursStr} and ${minutesStr}`;
    } else if (hoursStr) {
      return hoursStr;
    } else if (minutesStr) {
      return minutesStr;
    } else {
      return '0 minutes';
    }
  }
}
