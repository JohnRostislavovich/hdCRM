import pino from 'pino';
import { Service } from 'typedi';

@Service({ global: true })
export class Logger {
  private logger = pino({
    enabled: process.env.NODE_ENV !== 'test',
    level: LogLevel.DEBUG,
    prettyPrint:
      process.env.NODE_ENV === 'development'
        ? {
            levelFirst: true,
            colorize: true,
            translateTime: 'SYS:standard'
          }
        : false
  });

  public trace(message: string): void {
    this.logger[LogLevel.TRACE](message);
  }

  public debug(message: string): void {
    this.logger[LogLevel.DEBUG](message);
  }

  public info(message: string): void {
    this.logger[LogLevel.INFO](message);
  }

  public warn(message: string): void {
    this.logger[LogLevel.WARN](message);
  }

  public error(message: string): void {
    this.logger[LogLevel.ERROR](message);
  }

  public fatal(message: string): void {
    this.logger[LogLevel.FATAL](message);
  }

  public get instance() {
    return this.logger;
  }
}

enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}
