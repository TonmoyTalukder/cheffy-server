/* eslint-disable @typescript-eslint/no-unused-vars */
declare module 'node-cron' {
    interface ScheduledTask {
      start: () => void;
      stop: () => void;
      destroy: () => void;
      getStatus: () => 'scheduled' | 'running' | 'stopped';
    }
  
    type CronScheduleCallback = () => void;
  
    interface NodeCron {
      schedule: (
        _cronExpression: string,
        _callback: CronScheduleCallback,
        _options?: { scheduled?: boolean; timezone?: string }
      ) => ScheduledTask;
  
      validate: (_cronExpression: string) => boolean;
    }
  
    const nodeCron: NodeCron;
    export = nodeCron;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
  