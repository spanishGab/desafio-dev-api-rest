import { DateTime } from 'luxon';

export const SHORT_ISO8601 = 'yyyy-MM-dd';

export class DateUtils {
  public static saoPauloNow() {
    return DateTime.now().setZone('America/Sao_Paulo');
  }
}
