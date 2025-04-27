import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appMenuButton]',
  standalone: true,
})
export class MenuButtonDirective implements OnInit {
  @Output() clickEvent = new EventEmitter<Event>();

  constructor(
    private el: ElementRef<HTMLButtonElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.setupButton();
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.stopPropagation();
    this.clickEvent.emit(event);
  }

  private setupButton(): void {
    this.renderer.addClass(this.el.nativeElement, 'menu-button');

    this.renderer.setProperty(this.el.nativeElement, 'textContent', '⋮');

    if (this.el.nativeElement.tagName !== 'BUTTON') {
      this.renderer.setAttribute(this.el.nativeElement, 'role', 'button');
      this.renderer.setAttribute(this.el.nativeElement, 'type', 'button');
    }
  }
}
