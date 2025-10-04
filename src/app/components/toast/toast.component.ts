import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastMessage, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscription = new Subscription();

  // Why: react to toast stream from service
  constructor(private readonly toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toasts$.subscribe((toasts) => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeToast(id: string): void {
    this.toastService.remove(id);
  }

  trackById(_: number, t: ToastMessage): string {
    return t.id;
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
