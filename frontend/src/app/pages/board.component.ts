import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, Category, Stats, Status, Task } from '../core/api.service';

const COLUMNS: { status: Status; label: string; hint: string }[] = [
  { status: 'todo', label: 'A fazer', hint: 'Ainda não começou' },
  { status: 'doing', label: 'Fazendo', hint: 'Em andamento' },
  { status: 'done', label: 'Feito', hint: 'Concluídas' },
];

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="hero" aria-label="Resumo">
      @for (col of columns; track col.status) {
        <div class="stat">
          <h2>{{ col.label }}</h2>
          <strong>{{ stats()[col.status] }}</strong>
          <span>{{ stats()[col.status] === 1 ? 'tarefa' : 'tarefas' }}</span>
          <small>{{ col.hint }}</small>
        </div>
      }
    </section>

    <section class="panel">
      <div class="cell">
        <h3>Buscar</h3>
        <input [(ngModel)]="search" (ngModelChange)="load()" placeholder="Título da tarefa" aria-label="Buscar" />
        <select [(ngModel)]="filterCategory" (ngModelChange)="load()" aria-label="Filtrar por categoria">
          <option [ngValue]="null">Todas as categorias</option>
          @for (c of categories(); track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
        </select>
      </div>

      <form class="cell wide" (ngSubmit)="add()">
        <h3>Nova tarefa</h3>
        <input name="title" [(ngModel)]="title" placeholder="O que precisa ser feito?" required aria-label="Título da tarefa" />
        <div class="pair">
          <select name="cat" [(ngModel)]="newCategory" aria-label="Categoria">
            <option [ngValue]="null">Sem categoria</option>
            @for (c of categories(); track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
          </select>
          <input name="due" type="date" [(ngModel)]="due" aria-label="Prazo" />
        </div>
        <button class="go">Adicionar</button>
      </form>

      <form class="cell" (ngSubmit)="addCategory()">
        <h3>Categorias</h3>
        <input name="newcat" [(ngModel)]="categoryName" placeholder="Nome da categoria" aria-label="Nova categoria" />
        <button class="go">Criar</button>
      </form>
    </section>
    @if (error()) { <p class="error" role="alert">{{ error() }}</p> }

    <div class="columns">
      @for (col of columns; track col.status) {
        <section>
          <h2 [class]="'coltab ' + col.status">{{ col.label }}</h2>
          <div class="colbody">
            @for (t of byStatus(col.status); track t.id) {
              <article [class]="t.status">
                <h3>{{ t.title }}</h3>
                @if (t.category_name) { <span class="tag">{{ t.category_name }}</span> }
                @if (t.due_date) { <small class="muted">Prazo: {{ t.due_date }}</small> }
                <div class="actions">
                  @if (col.status !== 'todo') { <button (click)="move(t, -1)" aria-label="Mover para a coluna anterior">←</button> }
                  @if (col.status !== 'done') { <button (click)="move(t, 1)" aria-label="Mover para a próxima coluna">→</button> }
                  <button class="del" (click)="remove(t)">Excluir</button>
                </div>
              </article>
            } @empty {
              <p class="muted">Nenhuma tarefa aqui.</p>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .hero { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; padding: 1.75rem 1.5rem;
            background: linear-gradient(#bde14a 0 9%, #9acb25 9% 13%, #6f9f10 13% 48%, #5f8f0a 48% 74%, #78ac16 74% 90%, #c3e55a 90% 95%, #a9d535 95%);
            color: var(--lime-hi); }
    .stat { display: grid; align-content: start; }
    .stat h2 { font-size: 22px; font-weight: 700; }
    .stat strong { font-size: 40px; line-height: 1.1; margin-top: .25rem; }
    .stat small { opacity: .95; }

    .panel { display: grid; grid-template-columns: 1fr 1.4fr 1fr; border: 1px solid var(--tab-line); border-top: none; }
    .cell { padding: 1rem 1.25rem; display: grid; gap: .55rem; align-content: start; }
    .cell + .cell { border-left: 1px solid var(--line); }
    .cell h3 { font-size: 16px; color: var(--olive); }
    .cell button { justify-self: start; }
    .pair { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; }

    .columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; align-items: start; margin-top: 1.5rem; }
    .coltab { display: inline-block; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--olive);
              background: var(--tab); border: 1px solid var(--tab-line); border-bottom: none; border-radius: 7px 7px 0 0; padding: .35rem 1.1rem; }
    .colbody { border: 1px solid var(--tab-line); padding: .75rem; min-height: 120px; display: grid; gap: .6rem; align-content: start; }
    article { border: 1px solid var(--line); border-left: 4px solid var(--todo); padding: .6rem .7rem; display: grid; gap: .3rem; }
    article.doing { border-left-color: var(--doing); } article.done { border-left-color: var(--done); }
    article h3 { font-size: 13px; color: var(--ink); }
    .tag { justify-self: start; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em;
           background: var(--lime); color: var(--edge); border: 1px solid var(--edge); padding: 0 .4rem; }
    .actions { display: flex; gap: .35rem; margin-top: .2rem; }
    .actions button { padding: .15rem .55rem; }
    .del { margin-left: auto; color: var(--danger); }

    @media (max-width: 640px) {
      .hero, .panel { grid-template-columns: 1fr; }
      .cell + .cell { border-left: none; border-top: 1px solid var(--line); }
    }
  `],
})
export class BoardComponent implements OnInit {
  private api = inject(ApiService);
  columns = COLUMNS;

  tasks = signal<Task[]>([]);
  categories = signal<Category[]>([]);
  stats = signal<Stats>({ todo: 0, doing: 0, done: 0 });
  error = signal('');

  title = '';
  due = '';
  newCategory: number | null = null;
  categoryName = '';
  search = '';
  filterCategory: number | null = null;

  ngOnInit() {
    this.api.categories().subscribe((c) => this.categories.set(c));
    this.load();
  }

  load() {
    this.api.tasks({ category: this.filterCategory, search: this.search }).subscribe({
      next: (t) => this.tasks.set(t),
      error: () => this.error.set('Não foi possível carregar as tarefas.'),
    });
    this.api.stats().subscribe((s) => this.stats.set(s));
  }

  byStatus(status: Status) {
    return this.tasks().filter((t) => t.status === status);
  }

  add() {
    const title = this.title.trim();
    if (!title) return;
    this.api.createTask({ title, category: this.newCategory, due_date: this.due || null }).subscribe({
      next: () => { this.title = ''; this.due = ''; this.load(); },
      error: () => this.error.set('Não foi possível criar a tarefa.'),
    });
  }

  move(task: Task, direction: 1 | -1) {
    const order = COLUMNS.map((c) => c.status);
    const next = order[order.indexOf(task.status) + direction];
    if (next) this.api.updateTask(task.id, { status: next }).subscribe(() => this.load());
  }

  remove(task: Task) {
    this.api.deleteTask(task.id).subscribe(() => this.load());
  }

  addCategory() {
    const name = this.categoryName.trim();
    if (!name) return;
    this.api.createCategory(name).subscribe({
      next: (c) => { this.categories.update((l) => [...l, c]); this.categoryName = ''; this.error.set(''); },
      error: (e) => this.error.set(e.error?.name?.[0] ?? 'Não foi possível criar a categoria.'),
    });
  }
}
