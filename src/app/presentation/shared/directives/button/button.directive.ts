import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appButton]',
  standalone: true,
})
export class ButtonDirective implements OnInit {
  @Input() appButton: 'primary' | 'secondary' | 'add' = 'primary';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.applyButtonClass();
  }

  private applyButtonClass(): void {
    const classesToRemove = ['btn-primary', 'btn-secondary', 'add-button'];
    classesToRemove.forEach((className) => {
      this.renderer.removeClass(this.el.nativeElement, className);
    });

    let className: string;

    switch (this.appButton) {
      case 'primary':
        className = 'btn-primary';
        break;
      case 'secondary':
        className = 'btn-secondary';
        break;
      case 'add':
        className = 'add-button';
        break;
      default:
        className = 'btn-primary';
    }

    this.renderer.addClass(this.el.nativeElement, className);
  }
} 