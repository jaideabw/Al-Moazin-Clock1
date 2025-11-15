export class DateUtils {
  static getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  static getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  static isToday(dateString: string): boolean {
    return dateString === this.getTodayString();
  }
  static isYesterday(dateString: string): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return dateString === this.getDateString(yesterday);
  }
  static getTomorrowString(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.getDateString(tomorrow);
  }
  static formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  static isValidTimeFormat(time: string): boolean {
    return /^\d{2}:\d{2}$/.test(time);
  }
  static convertTo12Hour(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'م' : 'ص';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  static convertTo24Hour(time12: string): string {
    const match = time12.match(/^(\d{1,2}):(\d{2})\s*(ص|م)$/);
    if (!match) return time12;
    let [, hours, minutes, period] = match;
    let hours24 = parseInt(hours);
    if (period === 'ص' && hours24 === 12) {
      hours24 = 0;
    } else if (period === 'م' && hours24 !== 12) {
      hours24 += 12;
    }
    return `${hours24.toString().padStart(2, '0')}:${minutes}`;
  }
  static getTimeDifferenceInMinutes(time1: string, time2: string): number {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    const minutes1 = h1 * 60 + m1;
    const minutes2 = h2 * 60 + m2;
    return minutes2 - minutes1;
  }
  static isCurrentTimeBetween(startTime: string, endTime: string, currentTime?: string): boolean {
    const current = currentTime || new Date().toTimeString().slice(0, 5);
    const [currentH, currentM] = current.split(':').map(Number);
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const currentMinutes = currentH * 60 + currentM;
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  }
  static getArabicDayName(date: Date = new Date()): string {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  }
  static getArabicMonthName(date: Date = new Date()): string {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return months[date.getMonth()];
  }
}
