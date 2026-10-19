import { sendOrderInvoiceEmail } from './orderInvoiceTemplate.js';

export type JobType =
  | 'EMAIL_ORDER_INVOICE'
  | 'ABANDONED_CART_REMINDER'
  | 'STOCK_ALERT'
  | 'CUSTOM_ASYNC_TASK';

export interface TaskJob<T = any> {
  id: string;
  type: JobType;
  payload: T;
  attempts: number;
  maxRetries: number;
  createdAt: Date;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  error?: string;
}

class BackgroundTaskQueue {
  private queue: TaskJob[] = [];
  private isProcessing: boolean = false;
  private concurrency: number = 3;
  private activeWorkers: number = 0;

  /**
   * Enqueue a new background job
   */
  public enqueue<T = any>(
    type: JobType,
    payload: T,
    options: { maxRetries?: number } = {}
  ): string {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const job: TaskJob<T> = {
      id,
      type,
      payload,
      attempts: 0,
      maxRetries: options.maxRetries ?? 3,
      createdAt: new Date(),
      status: 'queued',
    };

    this.queue.push(job);
    this.scheduleDrain();
    return id;
  }

  private scheduleDrain() {
    if (!this.isProcessing) {
      setImmediate(() => this.drainQueue());
    }
  }

  private async drainQueue() {
    if (this.queue.length === 0 || this.activeWorkers >= this.concurrency) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0 && this.activeWorkers < this.concurrency) {
      const job = this.queue.shift();
      if (!job) break;

      this.activeWorkers++;
      this.executeJob(job).finally(() => {
        this.activeWorkers--;
        this.drainQueue();
      });
    }

    if (this.queue.length === 0 && this.activeWorkers === 0) {
      this.isProcessing = false;
    }
  }

  private async executeJob(job: TaskJob): Promise<void> {
    job.attempts++;
    job.status = 'processing';

    try {
      switch (job.type) {
        case 'EMAIL_ORDER_INVOICE': {
          await sendOrderInvoiceEmail(job.payload);
          break;
        }

        case 'ABANDONED_CART_REMINDER': {
          // Handled via cart recovery handler
          if (typeof job.payload?.execute === 'function') {
            await job.payload.execute();
          }
          break;
        }

        case 'CUSTOM_ASYNC_TASK': {
          if (typeof job.payload?.handler === 'function') {
            await job.payload.handler();
          }
          break;
        }

        default:
          console.warn(`[TaskQueue] Unknown job type: ${job.type}`);
      }

      job.status = 'completed';
      console.log(`[TaskQueue] ✓ Job #${job.id} (${job.type}) completed successfully.`);
    } catch (err: any) {
      console.error(`[TaskQueue] ✗ Job #${job.id} (${job.type}) attempt ${job.attempts} failed:`, err?.message || err);
      job.error = err?.message || String(err);

      if (job.attempts < job.maxRetries) {
        job.status = 'queued';
        const delay = Math.pow(2, job.attempts) * 1000; // Exponential backoff: 2s, 4s, 8s
        setTimeout(() => {
          this.queue.push(job);
          this.scheduleDrain();
        }, delay);
      } else {
        job.status = 'failed';
        console.error(`[TaskQueue] Job #${job.id} (${job.type}) exhausted all ${job.maxRetries} retries.`);
      }
    }
  }

  public getStats() {
    return {
      pendingJobs: this.queue.length,
      activeWorkers: this.activeWorkers,
      isProcessing: this.isProcessing,
    };
  }
}

export const taskQueue = new BackgroundTaskQueue();
