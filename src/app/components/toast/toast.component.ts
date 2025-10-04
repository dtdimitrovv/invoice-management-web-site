import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts; track toast.id) {
        <div 
          class="toast toast-{{ toast.type }}" 
          [class.show]="true"
          (click)="removeToast(toast.id)"
        >
          <div class="toast-content">
            <div class="toast-icon-wrapper">
              <div class="toast-icon">
                @switch (toast.type) {
                  @case ('success') {
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  }
                  @case ('error') {
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                    </svg>
                  }
                  @case ('warning') {
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                    </svg>
                  }
                  @case ('info') {
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                  }
                }
              </div>
            </div>
            <div class="toast-body">
              <div class="toast-title">{{ getToastTitle(toast.type) }}</div>
              <div class="toast-message">{{ toast.message }}</div>
            </div>
            <button class="toast-close" (click)="removeToast(toast.id); $event.stopPropagation()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          <div class="toast-progress" [style.animation-duration]="toast.duration + 'ms'"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 420px;
    }

    .toast {
      background: linear-gradient(135deg, #ffffff 0%, #f8fffe 100%);
      border-radius: 16px;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.12),
        0 2px 8px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
      opacity: 0;
      transform: translateX(100%) scale(0.95);
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      cursor: pointer;
      min-width: 320px;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
    }

    .toast.show {
      opacity: 1;
      transform: translateX(0) scale(1);
    }

    .toast:hover {
      transform: translateX(-4px) scale(1.02);
      box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.15),
        0 4px 12px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }

    .toast-success {
      background: linear-gradient(135deg, #f0fff4 0%, #dcfce7 50%, #bbf7d0 100%);
      border-color: rgba(34, 197, 94, 0.2);
    }

    .toast-success::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #22c55e, #16a34a, #15803d);
      border-radius: 16px 16px 0 0;
    }

    .toast-error {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 50%, #fecaca 100%);
      border-color: rgba(239, 68, 68, 0.2);
    }

    .toast-error::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #ef4444, #dc2626, #b91c1c);
      border-radius: 16px 16px 0 0;
    }

    .toast-warning {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%);
      border-color: rgba(245, 158, 11, 0.2);
    }

    .toast-warning::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #f59e0b, #d97706, #b45309);
      border-radius: 16px 16px 0 0;
    }

    .toast-info {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%);
      border-color: rgba(59, 130, 246, 0.2);
    }

    .toast-info::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6, #2563eb, #1d4ed8);
      border-radius: 16px 16px 0 0;
    }

    .toast-content {
      display: flex;
      align-items: flex-start;
      padding: 20px;
      gap: 16px;
      position: relative;
      z-index: 1;
    }

    .toast-icon-wrapper {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      position: relative;
    }

    .toast-success .toast-icon-wrapper {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
    }

    .toast-error .toast-icon-wrapper {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .toast-warning .toast-icon-wrapper {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }

    .toast-info .toast-icon-wrapper {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .toast-icon {
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
    }

    .toast-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .toast-title {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .toast-success .toast-title {
      color: #15803d;
    }

    .toast-error .toast-title {
      color: #b91c1c;
    }

    .toast-warning .toast-title {
      color: #b45309;
    }

    .toast-info .toast-title {
      color: #1d4ed8;
    }

    .toast-message {
      font-size: 15px;
      font-weight: 500;
      color: #1f2937;
      line-height: 1.5;
    }

    .toast-close {
      background: rgba(255, 255, 255, 0.8);
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      color: #6b7280;
      transition: all 0.2s ease;
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
    }

    .toast-close:hover {
      background: rgba(255, 255, 255, 0.95);
      color: #374151;
      transform: scale(1.1);
    }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4));
      border-radius: 0 0 16px 16px;
      animation: progress-bar linear forwards;
    }

    .toast-success .toast-progress {
      background: linear-gradient(90deg, #22c55e, #16a34a);
    }

    .toast-error .toast-progress {
      background: linear-gradient(90deg, #ef4444, #dc2626);
    }

    .toast-warning .toast-progress {
      background: linear-gradient(90deg, #f59e0b, #d97706);
    }

    .toast-info .toast-progress {
      background: linear-gradient(90deg, #3b82f6, #2563eb);
    }

    @keyframes progress-bar {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }

    @media (max-width: 768px) {
      .toast-container {
        left: 16px;
        right: 16px;
        top: 16px;
        max-width: none;
      }

      .toast {
        min-width: auto;
        border-radius: 12px;
      }

      .toast-content {
        padding: 16px;
        gap: 12px;
      }

      .toast-icon-wrapper {
        width: 40px;
        height: 40px;
      }

      .toast-icon svg {
        width: 20px;
        height: 20px;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeToast(id: string): void {
    this.toastService.remove(id);
  }

  getToastTitle(type: string): string {
    switch (type) {
      case 'success':
        return 'Успех';
      case 'error':
        return 'Грешка';
      case 'warning':
        return 'Предупреждение';
      case 'info':
        return 'Информация';
      default:
        return 'Съобщение';
    }
  }
}
